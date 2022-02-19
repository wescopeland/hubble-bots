import type { ActivitiesOptions } from "discord.js";
import * as numbro from "numbro";

export const buildPricePresenceActivityOptions = (
  priceChangePercentage: number,
  priceDirection: "sideways" | "up" | "down"
): ActivitiesOptions => {
  const formattedPercentage = numbro(priceChangePercentage).format({
    output: "percent",
    mantissa: 2
  });

  const priceDirectionLabel = priceDirection === "down" ? "-" : "";
  const activityName = `24h: ${priceDirectionLabel}${formattedPercentage}`;

  return { type: "WATCHING", name: activityName };
};
