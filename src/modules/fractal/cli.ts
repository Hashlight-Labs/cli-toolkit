import { db } from "@/lib/db";
import { cli } from "../../cli";
import { CliMethod } from "../../types/cli";
import { Choice } from "../../types/inquirer";
import { checkbox } from "@inquirer/prompts";
import { eachOfSeries } from "async";
import { claimFractal } from "@/modules/fractal/methods/claim";
import { logger } from "@/lib/logger";
import { dayjs } from "@/lib/dayjs";
import {
  getRandomNumberBetween,
  getShortString,
  retry,
  shuffle,
  sleep,
} from "@/helpers/utils";
import { getDelays } from "@/helpers/inquirer";
import { mintFractal } from "@/modules/fractal/methods/inscribe";
import { GLOBAL_CONFIG } from "@/config";
import { drawFractalMintConfig } from "@/stats/fractalMintConfig";
import chalk from "chalk";

export const fractalCli: Choice<CliMethod>[] = [
  {
    name: "Claim testnet tokens",
    value: async () => {
      await db.read();

      const wallets = await checkbox({
        message: "Select wallets",
        pageSize: 20,
        choices: db.data.wallets.map((wallet, i) => {
          const nextClaimMsg =
            (wallet.moduleCache?.fractal?.nextClaim || 0) > Date.now()
              ? chalk.red(
                  ` (next claim ${dayjs(
                    wallet.moduleCache?.fractal?.nextClaim
                  ).fromNow()})`
                )
              : "";

          return {
            name: `[${i + 1}] ${getShortString(
              wallet.addresses.bitcoin
            )}${nextClaimMsg}`,
            value: wallet,
          };
        }),
      });

      const { min, max } = await getDelays();

      logger.info(
        `Claiming fractal testnet tokens for ${wallets.length} wallets`
      );

      await eachOfSeries(shuffle(wallets), async (wallet) => {
        await retry(() => claimFractal(wallet), 1).catch((e) => {
          logger.error(
            `Could not claim fractal for ${getShortString(
              wallet.addresses.bitcoin
            )}`,
            e
          );
        });

        await sleep(getRandomNumberBetween(min * 1000, max * 1000));
      });

      return cli.homescreen();
    },
  },
  {
    name: "Mint testnet BRC20 tokens",
    value: async () => {
      await db.read();

      drawFractalMintConfig();

      const wallets = await checkbox({
        message: "Select wallets",
        pageSize: 20,
        choices: db.data.wallets.map((wallet, i) => ({
          name: `[${i + 1}] ${getShortString(wallet.addresses.bitcoin)}`,
          value: wallet,
        })),
      });

      const { min: minDelay, max: maxDelay } = await getDelays();

      logger.info(`Minting Fractal BRC20 for ${wallets.length} wallets`);

      await eachOfSeries(shuffle(wallets), async (wallet) => {
        await eachOfSeries(
          shuffle(GLOBAL_CONFIG.fractal.mint),
          async (mint) => {
            await retry(
              () =>
                mintFractal({
                  wallet,
                  count: getRandomNumberBetween(mint.repeat[0], mint.repeat[1]),
                  ticker: mint.tick,
                }),
              3
            ).catch((e) => {
              logger.error(
                `Could not mint BRC for ${getShortString(
                  wallet.addresses.bitcoin
                )}`,
                e
              );
            });

            await sleep(
              getRandomNumberBetween(minDelay * 1000, maxDelay * 1000)
            );
          }
        );
      });

      return cli.homescreen();
    },
  },
];
