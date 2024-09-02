import { Db, db } from "@/lib/db";
import { cli } from "../../cli";
import { CliMethod } from "../../types/cli";
import { Choice } from "../../types/inquirer";
import { checkbox } from "@inquirer/prompts";
import { eachOfSeries } from "async";
import { claimFractal } from "@/modules/fractal/methods/claim";
import { logger } from "@/lib/logger";
import { dayjs } from "@/lib/dayjs";
import {
  getDelaySet,
  getRandomNumberBetween,
  getShortString,
  retry,
  shuffle,
  sleep,
  waitForValue,
} from "@/helpers/utils";
import { getDelays } from "@/helpers/inquirer";
import { mintFractal } from "@/modules/fractal/methods/inscribe";
import { GLOBAL_CONFIG } from "@/config";
import { drawFractalMintConfig } from "@/stats/fractalMintConfig";
import chalk from "chalk";
import { satsToBtc } from "@/helpers/bitcoin";
import { FractalApi } from "@/modules/fractal/api";
import { waitForFractalFee } from "@/modules/fractal/utils";

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

          const balanceMsg = wallet.balances?.[Db.Network.FractalTestnet]
            ? chalk.yellow(
                ` ${satsToBtc(
                  wallet.balances?.[Db.Network.FractalTestnet]
                )} tFB `
              )
            : "";

          return {
            name: `[${i + 1}] ${getShortString(
              wallet.addresses.bitcoin
            )}${balanceMsg}${nextClaimMsg}`,
            value: wallet,
          };
        }),
      });

      const { min, max } = await getDelays();

      logger.info(
        `Claiming fractal testnet tokens for ${wallets.length} wallets`
      );

      await eachOfSeries(wallets, async (wallet) => {
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
        choices: db.data.wallets.map((wallet, i) => {
          const balanceMsg = wallet.balances?.[Db.Network.FractalTestnet]
            ? chalk.yellow(
                ` ${satsToBtc(
                  wallet.balances?.[Db.Network.FractalTestnet]
                )} tFB `
              )
            : "";

          return {
            name: `[${i + 1}] ${getShortString(
              wallet.addresses.bitcoin
            )}${balanceMsg}`,
            value: wallet,
          };
        }),
      });

      const { min: minDelay, max: maxDelay } = await getDelays();
      const delaySet = getDelaySet(
        wallets.length,
        minDelay * 1000,
        maxDelay * 1000
      );

      logger.info("Select delay between transactions and wallets:");
      logger.info(`Minting Fractal BRC20 for ${wallets.length} wallets`);

      GLOBAL_CONFIG.fractal.maxFee &&
        (await waitForFractalFee(
          GLOBAL_CONFIG.fractal.maxFee,
          wallets[0]?.proxy
        ));

      await Promise.all(
        wallets.map(async (wallet, i) => {
          try {
            await sleep(
              delaySet[i],
              `${getShortString(
                wallet.addresses.bitcoin
              )} will start minting in {}`
            );

            GLOBAL_CONFIG.fractal.maxFee &&
              (await waitForFractalFee(
                GLOBAL_CONFIG.fractal.maxFee,
                wallet?.proxy
              ));

            await eachOfSeries(
              shuffle(GLOBAL_CONFIG.fractal.mint),
              async (mint) => {
                await retry(
                  () =>
                    mintFractal({
                      wallet,
                      count: getRandomNumberBetween(
                        mint.repeat[0],
                        mint.repeat[1]
                      ),
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
                  getRandomNumberBetween(minDelay * 1000, maxDelay * 1000),
                  `${getShortString(wallet.addresses.bitcoin)} sleeping for {}`
                );
              }
            );
          } catch (e) {
            logger.error(
              `Could not mint BRC for ${getShortString(
                wallet.addresses.bitcoin
              )}`,
              e
            );
          }
        })
      );

      return cli.homescreen();
    },
  },
];
