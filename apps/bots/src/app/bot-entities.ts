import type { BotEntity } from "./models";

export const botEntities: BotEntity[] = [
  {
    coinGeckoAssetName: "hubble",
    assetSymbol: "HBB",
    priceDecimalsToShow: 3,
    botAccessToken: process.env.HBB_BOT_TOKEN
  }
];
