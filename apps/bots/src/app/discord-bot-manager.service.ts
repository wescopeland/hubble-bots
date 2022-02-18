import {
  buildPriceNicknameLabel,
  buildPricePresenceActivityOptions
} from "@hubble-bots/utils/bot-labels";
import { Injectable, Logger } from "@nestjs/common";
import { Client as DiscordClient, Intents } from "discord.js";

import { coinGeckoTrackingBotEntities } from "./coin-gecko-tracking-bot-entities";
import { CryptoAssetMetaService } from "./crypto-asset-meta.service";
import type { CoinGeckoTrackingBotEntity } from "./models";

@Injectable()
export class DiscordBotManagerService {
  private discordBotClients: Record<string, DiscordClient | null> = {};
  private readonly logger = new Logger(DiscordBotManagerService.name);

  constructor(
    private readonly cryptoAssetMetaService: CryptoAssetMetaService
  ) {}

  async initializeAllBots() {
    for (const botEntity of coinGeckoTrackingBotEntities) {
      await this.initializeBotEntity(botEntity);
    }
  }

  private async initializeBotEntity(botEntity: CoinGeckoTrackingBotEntity) {
    this.logger.log(`Initializing Discord bot for ${botEntity.assetSymbol}.`);

    const newDiscordClient = new DiscordClient({
      intents: [Intents.FLAGS.GUILDS]
    });

    // When the client is ready, immediately fetch the asset price.
    newDiscordClient.once("ready", async () => {
      const assetMarketDataResponse =
        await this.cryptoAssetMetaService.fetchCryptoAssetMarketData(
          botEntity.coinGeckoAssetName
        );

      // Set the bot's nickname and presence for all servers.
      // eslint-disable-next-line unicorn/no-array-for-each -- not a native array
      newDiscordClient.guilds.cache.forEach((guild) => {
        const nicknameLabel = buildPriceNicknameLabel(
          botEntity.assetSymbol,
          assetMarketDataResponse.currentPrice,
          {
            priceChangePercentage:
              assetMarketDataResponse.dailyPricePercentDelta,
            mantissa: botEntity.priceDecimalsToShow
          }
        );

        guild.me.setNickname(nicknameLabel);
        newDiscordClient.user.setPresence({
          activities: [
            buildPricePresenceActivityOptions(
              assetMarketDataResponse.dailyPricePercentDelta
            )
          ]
        });

        this.logger.log(
          `Initialized ${
            botEntity.assetSymbol
          } bot with ${nicknameLabel} nickname and ${assetMarketDataResponse.dailyPricePercentDelta.toPrecision(
            2
          )}% price delta.`
        );
      });
    });

    // Have the bot log in to Discord and start doing things.
    newDiscordClient.login(botEntity.botAccessToken);

    // Store the bot in memory for future use.
    this.discordBotClients[botEntity.assetSymbol] = newDiscordClient;
  }
}
