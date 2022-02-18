import type { ActivitiesOptions } from "discord.js";
import * as numbro from "numbro";

export const buildPricePresenceActivityOptions = (
  priceChangePercentage: number
): ActivitiesOptions => {
  const formattedPercentage = numbro(priceChangePercentage).format({
    output: "percent",
    mantissa: 2
  });

  const activityName = `24h: ${formattedPercentage}`;

  return { type: "WATCHING", name: activityName };
};
