import type { CoinGeckoTrackingBotEntity } from "./models";

export const coinGeckoTrackingBotEntities: CoinGeckoTrackingBotEntity[] = [
  {
    coinGeckoAssetName: "hubble",
    assetSymbol: "HBB",
    priceDecimalsToShow: 3,
    botAccessToken: process.env.HBB_BOT_TOKEN
  },
  {
    coinGeckoAssetName: "usdh",
    assetSymbol: "USDH",
    priceDecimalsToShow: 3,
    botAccessToken: process.env.USDH_BOT_TOKEN
  }
];
