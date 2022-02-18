import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import urlcat from "urlcat";

import type { HubbleMetricsResponse } from "./models";

@Injectable()
export class HubbleService {
  apiBaseUrl = "https://api.hubbleprotocol.io/";

  constructor(private readonly httpService: HttpService) {}

  async fetchCurrentHubbleMetrics() {
    const requestUrl = urlcat(this.apiBaseUrl, "/metrics");

    const { data: hubbleMetricsData } = await lastValueFrom(
      this.httpService.get<HubbleMetricsResponse>(requestUrl)
    );

    return hubbleMetricsData;
  }
}
