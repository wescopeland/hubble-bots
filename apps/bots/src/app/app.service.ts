import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, Intents } from 'discord.js';
import { CryptoAssetMetaService } from './crypto-asset-meta.service';
import {
  buildPriceNicknameLabel,
  buildPricePresenceActivityOptions,
} from '@hubble-bots/utils/bot-labels';

@Injectable()
export class AppService implements OnModuleInit {
  client: Client | null = null;

  constructor(
    private readonly cryptoAssetMetaService: CryptoAssetMetaService
  ) {}

  async onModuleInit() {
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS],
    });

    // When the client is ready, run this code once.
    this.client.once('ready', async () => {
      const hbbResponse =
        await this.cryptoAssetMetaService.fetchCryptoAssetMarketData('hubble');

      this.client.guilds.cache.forEach((guild) => {
        const name = buildPriceNicknameLabel('HBB', hbbResponse.currentPrice, {
          priceChangePercentage: hbbResponse.dailyPricePercentDelta,
        });

        guild.me.setNickname(name);
        this.client.user.setPresence({
          activities: [
            buildPricePresenceActivityOptions(
              hbbResponse.dailyPricePercentDelta
            ),
          ],
        });
      });
    });

    // Login to Discord with the token.
    this.client.login(process.env.HBB_BOT_TOKEN ?? '');
  }
}
