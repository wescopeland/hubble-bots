import {
  buildPriceNicknameLabel,
  buildPricePresenceActivityOptions
} from "@hubble-bots/utils/bot-labels";
import { Injectable } from "@nestjs/common";
import { Client, Intents } from "discord.js";

import { CryptoAssetMetaService } from "./crypto-asset-meta.service";

@Injectable()
export class DiscordBotManagerService {
  private hbbBotClient: Client | null = null;

  constructor(
    private readonly cryptoAssetMetaService: CryptoAssetMetaService
  ) {}

  async initializeHbbBot() {
    this.hbbBotClient = new Client({
      intents: [Intents.FLAGS.GUILDS]
    });

    // When the client is ready, immediately fetch the asset price.
    this.hbbBotClient.once("ready", async () => {
      const hbbResponse =
        await this.cryptoAssetMetaService.fetchCryptoAssetMarketData("hubble");

      // Set the nickname and presence for all servers this bot is in.
      if (this.hbbBotClient) {
        // eslint-disable-next-line unicorn/no-array-for-each -- not a native array
        this.hbbBotClient.guilds.cache.forEach((guild) => {
          const name = buildPriceNicknameLabel(
            "HBB",
            hbbResponse.currentPrice,
            {
              priceChangePercentage: hbbResponse.dailyPricePercentDelta,
              mantissa: 3
            }
          );

          guild.me.setNickname(name);
          this.hbbBotClient.user.setPresence({
            activities: [
              buildPricePresenceActivityOptions(
                hbbResponse.dailyPricePercentDelta
              )
            ]
          });
        });
      }
    });

    // Be sure the bot is logged in to Discord.
    this.hbbBotClient.login(process.env.HBB_BOT_TOKEN ?? "");
  }
}
