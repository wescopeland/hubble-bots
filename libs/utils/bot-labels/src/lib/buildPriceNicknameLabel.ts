import * as numbro from "numbro";

export const buildPriceNicknameLabel = (
  assetSymbol: string,
  givenPrice: number,
  options: Partial<{
    mantissa: number;
    priceDirection: "up" | "down" | "sideways";
  }> = {}
) => {
  const { mantissa, priceDirection } = options;

  const decimalsToDisplay = mantissa ?? 2;

  const formattedPrice = numbro(givenPrice).formatCurrency({
    mantissa: decimalsToDisplay
  });

  let priceLabel = `${assetSymbol.toUpperCase()}: ${
    priceDirection === "down" ? "-" : ""
  }${formattedPrice}`;

  if (priceDirection !== undefined) {
    let arrowSymbol = "→";

    if (priceDirection === "down") {
      arrowSymbol = "↘";
    } else if (priceDirection === "up") {
      arrowSymbol = "↗";
    }

    priceLabel += ` ${arrowSymbol}`;
  }

  return priceLabel;
};
