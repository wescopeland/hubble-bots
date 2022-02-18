import { HubbleService } from "@hubble-bots/data-access/hubble";
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
    private readonly cryptoAssetMetaService: CryptoAssetMetaService,
    private readonly hubbleService: HubbleService
  ) {}

  async initializeAllBots() {
    await this.initializeSystemLtvMonitorBot();

    for (const botEntity of coinGeckoTrackingBotEntities) {
      await this.initializeCoinGeckoTrackingBotEntity(botEntity);
    }
  }

  private async initializeSystemLtvMonitorBot() {
    this.logger.log("Initializing Discord bot for Hubble Protocol System LTV.");

    const newDiscordClient = new DiscordClient({
      intents: [Intents.FLAGS.GUILDS]
    });

    // When the client is ready, immediately fetch the system LTV.
    newDiscordClient.once("ready", async () => {
      const hubbleMetricsResponse =
        await this.hubbleService.fetchCurrentHubbleMetrics();

      const { absoluteLtv, formattedLtv } =
        this.hubbleService.calculateSystemLTV(hubbleMetricsResponse);

      // Set the bot's nickname and presence for all servers.
      // eslint-disable-next-line unicorn/no-array-for-each -- not a native array
      newDiscordClient.guilds.cache.forEach((guild) => {
        let nicknameLabel = `SysLTV: ${formattedLtv}`;

        if (absoluteLtv >= 0.64) {
          nicknameLabel += " 🟥";
        } else if (absoluteLtv < 0.64 && absoluteLtv >= 0.585) {
          nicknameLabel += " 🟨";
        } else if (absoluteLtv < 0.585) {
          nicknameLabel += " 🟩";
        }

        guild.me.setNickname(nicknameLabel);
        newDiscordClient.user.setPresence({
          activities: [
            {
              type: "WATCHING",
              name: `${hubbleMetricsResponse.borrowing.loans.total} loans`
            }
          ]
        });

        this.logger.log(`Initialized System LTV bot with ${formattedLtv} LTV.`);
      });
    });

    // Have the bot log in to Discord and start doing things.
    newDiscordClient.login(process.env.SYSTEM_LTV_BOT_TOKEN ?? "");
  }

  private async initializeCoinGeckoTrackingBotEntity(
    botEntity: CoinGeckoTrackingBotEntity
  ) {
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
