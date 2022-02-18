import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoinGeckoModule } from './shared/integrations/coin-gecko/coin-gecko.module';

@Module({
  imports: [CoinGeckoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
