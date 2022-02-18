interface Distribution {
  value: number;
  percentile: number;
  totalCount: number;
}

export interface HubbleMetricsResponse {
  borrowing: {
    loans: {
      total: number;
      max: number;
      min: number;
      average: number;
      median: number;

      distribution: Distribution[];
    };

    treasury: number;
    numberOfBorrowers: number;
  };

  collateral: {
    deposited: number;
    inactive: number;
    total: number;
    collateralRatio: number;

    depositedTokens: Array<{
      name: string;
      amount: number;
      price: number;
    }>;

    ratioDistribution: Distribution[];
  };

  hbb: {
    issued: number;
    staked: number;
    price: number;
    numberOfStakers: number;
    numberOfHolders: number;
  };

  revenue: number;

  usdh: {
    issued: number;

    jupiter: {
      price: number;
      liquidityPool: number;
    };

    saber: {
      price: number;
      liquidityPool: number;
    };

    stabilityPool: number;
    stabilityPoolDistribution: Distribution[];
  };

  circulatingSupplyValue: number;
  totalValueLocked: number;
}
