import * as numbro from "numbro";

export const buildPriceNicknameLabel = (
  assetSymbol: string,
  givenPrice: number,
  options: Partial<{ mantissa: number; priceChangePercentage: number }> = {}
) => {
  const { mantissa, priceChangePercentage } = options;

  const decimalsToDisplay = mantissa ?? 2;

  const formattedPrice = numbro(givenPrice).formatCurrency({
    mantissa: decimalsToDisplay
  });

  let priceLabel = `${assetSymbol.toUpperCase()}: ${formattedPrice}`;

  if (priceChangePercentage !== undefined) {
    let arrowSymbol = "→";

    if (priceChangePercentage < 0) {
      arrowSymbol = "↘";
    } else if (priceChangePercentage > 0) {
      arrowSymbol = "↗";
    }

    priceLabel += ` ${arrowSymbol}`;
  }

  return priceLabel;
};
