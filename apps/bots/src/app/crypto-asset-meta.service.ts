import { Injectable } from '@nestjs/common';

import { CoinGeckoService } from '@hubble-bots/data-access/coin-gecko';

@Injectable()
export class CryptoAssetMetaService {
  constructor(private readonly coinGeckoService: CoinGeckoService) {}

  fetchCryptoAssetMarketData(assetName: string) {
    return this.coinGeckoService.fetchCryptoAssetMarketMeta(assetName);
  }
}
