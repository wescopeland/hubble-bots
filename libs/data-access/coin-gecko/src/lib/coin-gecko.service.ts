import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import urlcat from "urlcat";

import type { MarketChartResponse } from "./models";

@Injectable()
export class CoinGeckoService {
  private readonly apiBaseUrl = "https://api.coingecko.com/api/v3/coins";

  constructor(private readonly httpService: HttpService) {}

  async fetchCryptoAssetMarketMeta(coinName: string) {
    const requestUrl = urlcat(this.apiBaseUrl, "/:coinName/market_chart", {
      coinName,
      vs_currency: "usd",
      days: 1,
      interval: "hourly"
    });

    const { data: coinGeckoData } = await lastValueFrom(
      this.httpService.get<MarketChartResponse>(requestUrl)
    );

    return this.parseRetrievedAssetMetaData(coinGeckoData);
  }

  private calculatePercentDifference(oldNumber: number, newNumber: number) {
    let percentDifference = 0;

    if (newNumber > oldNumber) {
      percentDifference = (newNumber - oldNumber) / oldNumber;
    }

    if (newNumber < oldNumber) {
      percentDifference = (oldNumber - newNumber) / oldNumber;
    }

    return percentDifference;
  }

  private parseRetrievedAssetMetaData(
    marketChartResponse: MarketChartResponse
  ) {
    const { sanitizedPriceData, sanitizedMarketCapData } =
      this.sanitizeCoinGeckoResponseData(
        marketChartResponse.prices,
        marketChartResponse.market_caps
      );

    const { price: currentPrice } =
      sanitizedPriceData[sanitizedPriceData.length - 1];

    const { marketCap: currentMarketCap } =
      sanitizedMarketCapData[sanitizedMarketCapData.length - 1];

    const dailyPricePercentDelta = this.calculatePercentDifference(
      sanitizedPriceData[0].price,
      currentPrice
    );

    const dailyMarketCapPercentDelta = this.calculatePercentDifference(
      sanitizedMarketCapData[0].marketCap,
      currentMarketCap
    );

    let priceDirection: "sideways" | "up" | "down" = "sideways";
    if (sanitizedPriceData[0].price > currentPrice) {
      priceDirection = "down";
    } else if (sanitizedPriceData[0].price < currentPrice) {
      priceDirection = "up";
    }

    return {
      currentPrice,
      currentMarketCap,
      dailyPricePercentDelta,
      dailyMarketCapPercentDelta,
      priceDirection
    };
  }

  private sanitizeCoinGeckoResponseData(
    priceDataNodes: number[][],
    marketCapDataNodes: number[][]
  ) {
    const sanitizedPriceData: Array<{ price: number; dateTime: number }> = [];
    const sanitizedMarketCapData: Array<{
      marketCap: number;
      dateTime: number;
    }> = [];

    for (const [dateTime, price] of priceDataNodes) {
      sanitizedPriceData.push({
        price,
        dateTime
      });
    }

    for (const [dateTime, marketCap] of marketCapDataNodes) {
      sanitizedMarketCapData.push({
        marketCap,
        dateTime
      });
    }

    return { sanitizedPriceData, sanitizedMarketCapData };
  }
}
