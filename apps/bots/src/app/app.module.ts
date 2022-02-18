import { CoinGeckoModule } from "@hubble-bots/data-access/coin-gecko";
import { HubbleModule } from "@hubble-bots/data-access/hubble";
import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CryptoAssetMetaService } from "./crypto-asset-meta.service";
import { DiscordBotManagerService } from "./discord-bot-manager.service";

@Module({
  imports: [CoinGeckoModule, HubbleModule],
  controllers: [AppController],
  providers: [AppService, CryptoAssetMetaService, DiscordBotManagerService]
})
export class AppModule {}
