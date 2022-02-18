import { Module } from '@nestjs/common';

import { CoinGeckoModule } from '@hubble-bots/data-access/coin-gecko';
import { CryptoAssetMetaService } from './crypto-asset-meta.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CoinGeckoModule],
  controllers: [AppController],
  providers: [AppService, CryptoAssetMetaService],
})
export class AppModule {}
