import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, Intents } from 'discord.js';
import { CoinGeckoService } from './shared/integrations/coin-gecko/coin-gecko.service';

@Injectable()
export class AppService implements OnModuleInit {
  client: Client | null = null;

  constructor(private readonly coinGeckoService: CoinGeckoService) {}

  async onModuleInit() {
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS],
    });

    // When the client is ready, run this code once.
    this.client.once('ready', () => {
      console.log('Ready!');

      this.client.guilds.cache.forEach((guild) => {
        guild.me.setNickname('AAAAA');
      });
    });

    // Login to Discord with the token.
    this.client.login(process.env.HBB_BOT_TOKEN ?? '');

    const cgResponse = await this.coinGeckoService.fetchCoinMarketMeta(
      'bitcoin'
    );

    console.log(cgResponse);
  }
}
