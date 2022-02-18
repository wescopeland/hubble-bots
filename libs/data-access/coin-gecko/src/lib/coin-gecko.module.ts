import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { CoinGeckoService } from "./coin-gecko.service";

@Module({
  imports: [HttpModule],
  providers: [CoinGeckoService],
  exports: [CoinGeckoService]
})
export class CoinGeckoModule {}
