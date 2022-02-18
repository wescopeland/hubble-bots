import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import * as numbro from "numbro";
import { lastValueFrom } from "rxjs";
import urlcat from "urlcat";

import type { HubbleMetricsResponse } from "./models";

@Injectable()
export class HubbleService {
  private readonly apiBaseUrl = "https://api.hubbleprotocol.io/";

  constructor(private readonly httpService: HttpService) {}

  async fetchCurrentHubbleMetrics() {
    const requestUrl = urlcat(this.apiBaseUrl, "/metrics");

    const { data: hubbleMetricsData } = await lastValueFrom(
      this.httpService.get<HubbleMetricsResponse>(requestUrl)
    );

    return hubbleMetricsData;
  }

  calculateSystemLTV({ collateral, usdh }: HubbleMetricsResponse) {
    const absoluteLtv = usdh.issued / collateral.total;

    // 55.234234234 --> "55.23%"
    const formattedLtv = numbro(absoluteLtv).format({
      output: "percent",
      mantissa: 2
    });

    return { absoluteLtv, formattedLtv };
  }
}
