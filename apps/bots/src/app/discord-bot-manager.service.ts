import { HubbleService } from "@hubble-bots/data-access/hubble";
import {
  buildPriceNicknameLabel,
  buildPricePresenceActivityOptions
} from "@hubble-bots/utils/bot-labels";
import { Injectable, Logger } from "@nestjs/common";
import { Client as DiscordClient, Intents } from "discord.js";
import * as numbro from "numbro";

import { coinGeckoTrackingBotEntities } from "./coin-gecko-tracking-bot-entities";
import { CryptoAssetMetaService } from "./crypto-asset-meta.service";
import type { CoinGeckoTrackingBotEntity } from "./models";

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * Creates an interval, but also executes the given function
 * immediately. This is useful for running the bot functions
 * right when they start up instead of waiting for the timer
 * to kick in.
 */
function setIntervalImmediately(func, interval) {
  func();
  return setInterval(func, interval);
}

@Injectable()
export class DiscordBotManagerService {
  private readonly logger = new Logger(DiscordBotManagerService.name);

  constructor(
    private readonly cryptoAssetMetaService: CryptoAssetMetaService,
    private readonly hubbleService: HubbleService
  ) {}

  async initializeAllBots() {
    this.initializeSystemLtvMonitorBot();
    this.initializeStabilityPoolDepositedBot();
    this.initializeHbbStakedBot();

    for (const botEntity of coinGeckoTrackingBotEntities) {
      await this.initializeCoinGeckoTrackingBotEntity(botEntity);
    }
  }

  private async initializeHbbStakedBot() {
    this.logger.log(
      "Initializing Discord bot for Hubble Protocol current staked HBB."
    );

    const newDiscordClient = new DiscordClient({
      intents: [Intents.FLAGS.GUILDS]
    });

    // When the client is ready, immediately fetch the HBB staked.
    newDiscordClient.once("ready", () => {
      setIntervalImmediately(async () => {
        this.logger.log("Cycling HBB staked bot.");

        try {
          const hubbleMetricsResponse =
            await this.hubbleService.fetchCurrentHubbleMetrics();

          const stakedHbbCount = hubbleMetricsResponse.hbb.staked;
          const hbbStakersCount = hubbleMetricsResponse.hbb.numberOfStakers;

          // Set the bot's nickname and presence for all servers.
          // eslint-disable-next-line unicorn/no-array-for-each -- not a native array
          newDiscordClient.guilds.cache.forEach((guild) => {
            const nicknameLabel = `${numbro(stakedHbbCount).format({
              mantissa: 0,
              thousandSeparated: true
            })} staked`;

            guild.me.setNickname(nicknameLabel);
            newDiscordClient.user.setPresence({
              activities: [
                {
                  type: "WATCHING",
                  name: `${hbbStakersCount} HBB stakers`
                }
              ]
            });

            this.logger.log(
              `Updated staked HBB bot with ${stakedHbbCount} HBB staked.`
            );
          });
        } catch (error) {
          this.logger.error(
            "There was a problem cycling the HBB staked bot.",
            error
          );
        }
      }, FIVE_MINUTES);
    });

    // Have the bot log in to Discord and start doing things.
    newDiscordClient.login(process.env.HBB_STAKED_BOT_TOKEN ?? "");
  }

  private async initializeStabilityPoolDepositedBot() {
    this.logger.log(
      "Initializing Discord bot for Hubble Protocol current stability pool USDH deposits."
    );

    const newDiscordClient = new DiscordClient({
      intents: [Intents.FLAGS.GUILDS]
    });

    // When the client is ready, immediately fetch the USDH deposited.
    newDiscordClient.once("ready", () => {
      setIntervalImmediately(async () => {
        this.logger.log("Cycling USDH stability pool deposits bot.");

        try {
          const hubbleMetricsResponse =
            await this.hubbleService.fetchCurrentHubbleMetrics();

          const stabilityPoolDepositsValue =
            hubbleMetricsResponse.usdh.stabilityPool;

          // Set the bot's nickname and presence for all servers.
          // eslint-disable-next-line unicorn/no-array-for-each -- not a native array
          newDiscordClient.guilds.cache.forEach((guild) => {
            const nicknameLabel = numbro(
              stabilityPoolDepositsValue
            ).formatCurrency({
              mantissa: 0,
              thousandSeparated: true
            });

            guild.me.setNickname(nicknameLabel);
            newDiscordClient.user.setPresence({
              activities: [
                {
                  type: "WATCHING",
                  name: "Stability Pool USDH"
                }
              ]
            });

            this.logger.log(
              `Updated current stability pool USDH deposits bot with ${stabilityPoolDepositsValue} USDH in the pool.`
            );
          });
        } catch (error) {
          this.logger.error(
            "There was a problem cycling the USDH stability pool deposits bot.",
            error
          );
        }
      }, FIVE_MINUTES);
    });

    // Have the bot log in to Discord and start doing things.
    newDiscordClient.login(process.env.STABILITY_POOL_USDH_BOT_TOKEN ?? "");
  }

  private async initializeSystemLtvMonitorBot() {
    this.logger.log("Initializing Discord bot for Hubble Protocol System LTV.");

    const newDiscordClient = new DiscordClient({
      intents: [Intents.FLAGS.GUILDS]
    });

    // When the client is ready, immediately fetch the system LTV.
    newDiscordClient.once("ready", () => {
      setIntervalImmediately(async () => {
        this.logger.log("Cycling System LTV bot.");

        try {
          const hubbleMetricsResponse =
            await this.hubbleService.fetchCurrentHubbleMetrics();

          const { absoluteLtv, formattedLtv } =
            this.hubbleService.calculateSystemLTV(hubbleMetricsResponse);

          // Set the bot's nickname and presence for all servers.
          // eslint-disable-next-line unicorn/no-array-for-each -- not a native array
          newDiscordClient.guilds.cache.forEach((guild) => {
            let nicknameLabel = `SysLTV: ${formattedLtv}`;

            if (absoluteLtv >= 0.64) {
              nicknameLabel += " 🟥";
            } else if (absoluteLtv < 0.64 && absoluteLtv >= 0.595) {
              nicknameLabel += " 🟨";
            } else if (absoluteLtv < 0.595) {
              nicknameLabel += " 🟩";
            }

            let currentMode = "Normal";
            if (absoluteLtv > 0.666) {
              currentMode = "Recovery";
            }

            let currentLR = "90.9%";
            if (currentMode === "Recovery") {
              currentLR = "66.6%";
            }

            guild.me.setNickname(nicknameLabel);
            newDiscordClient.user.setPresence({
              activities: [
                {
                  type: "WATCHING",
                  name: `[${currentMode}] LR: ${currentLR}`
                }
              ]
            });

            this.logger.log(`Updated System LTV bot with ${formattedLtv} LTV.`);
          });
        } catch (error) {
          this.logger.error(
            "There was a problem cycling the System LTV bot.",
            error
          );
        }
      }, FIVE_MINUTES);
    });

    // Have the bot log in to Discord and start doing things.
    newDiscordClient.login(process.env.SYSTEM_LTV_BOT_TOKEN ?? "");
  }

  private async initializeCoinGeckoTrackingBotEntity(
    botEntity: CoinGeckoTrackingBotEntity
  ) {
    this.logger.log(`Initializing Discord bot for ${botEntity.assetSymbol}.`);

    const newDiscordClient = new DiscordClient({
      intents: [Intents.FLAGS.GUILDS]
    });

    // When the client is ready, immediately fetch the asset price.
    newDiscordClient.once("ready", () => {
      setIntervalImmediately(async () => {
        this.logger.log(`Cycling ${botEntity.assetSymbol} price bot.`);

        try {
          const assetMarketDataResponse =
            await this.cryptoAssetMetaService.fetchCryptoAssetMarketData(
              botEntity.coinGeckoAssetName
            );

          // Set the bot's nickname and presence for all servers.
          // eslint-disable-next-line unicorn/no-array-for-each -- not a native array
          newDiscordClient.guilds.cache.forEach((guild) => {
            const nicknameLabel = buildPriceNicknameLabel(
              botEntity.assetSymbol,
              assetMarketDataResponse.currentPrice,
              {
                priceDirection: assetMarketDataResponse.priceDirection,
                mantissa: botEntity.priceDecimalsToShow
              }
            );

            guild.me.setNickname(nicknameLabel);
            newDiscordClient.user.setPresence({
              activities: [
                buildPricePresenceActivityOptions(
                  assetMarketDataResponse.dailyPricePercentDelta,
                  assetMarketDataResponse.priceDirection
                )
              ]
            });

            this.logger.log(
              `Updated ${
                botEntity.assetSymbol
              } bot with ${nicknameLabel} nickname and ${assetMarketDataResponse.dailyPricePercentDelta.toPrecision(
                2
              )}% price delta.`
            );
          });
        } catch (error) {
          this.logger.error(
            `There was a problem cycling the ${botEntity.assetSymbol} price bot.`,
            error
          );
        }
      }, FIVE_MINUTES);
    });

    // Have the bot log in to Discord and start doing things.
    newDiscordClient.login(botEntity.botAccessToken);
  }
}
