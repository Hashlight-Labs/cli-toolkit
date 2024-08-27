import { satsToBtc } from "@/helpers/bitcoin";
import { getShortString } from "@/helpers/utils";
import { dayjs } from "@/lib/dayjs";
import { Db, db, saveWallet } from "@/lib/db";
import { createChildLogger, logger as mainLogger } from "@/lib/logger";
import { FractalApi } from "@/modules/fractal/api";
import { FractalBrowserAgent } from "@/modules/fractal/browser";
import { syncFractalBalance } from "@/modules/fractal/utils";
import _ from "lodash";

export const claimFractal = async (wallet: Db.Wallet) => {
  const logger = createChildLogger(
    "FRACTAL:CLAIM",
    wallet,
    getShortString(wallet.addresses.bitcoin)
  );
  logger.info(`Claiming fractal testnet tokens`);

  if (!wallet.proxy) throw new Error(`Wallet ${wallet.proxy} has no proxy`);

  if ((wallet.moduleCache?.fractal?.nextClaim || 0) > Date.now()) {
    logger.info(
      `Next claim available in ${dayjs(
        wallet.moduleCache?.fractal?.nextClaim
      ).fromNow()}`
    );
    return;
  }

  const hasCookie = !!wallet.moduleCache?.fractal?.cfClearance;

  logger.debug(`Has ${hasCookie ? "cookie" : "no cookie yet, getting it..."}`);

  if (!hasCookie) {
    const agent = new FractalBrowserAgent(wallet);
    await agent.start().then(async (params) => {
      logger.debug("Received fractal params", params);
      agent.close().catch(console.error);

      await db.read();

      if (!wallet.addresses.bitcoin)
        throw new Error("No bitcoin address found");

      wallet.moduleCache = _.merge(wallet.moduleCache, {
        fractal: {
          cfClearance: params.cfClearance,
          userAgent: params.userAgent,
        },
      } as typeof wallet.moduleCache);

      await saveWallet(wallet);
    });
  }

  const claimResult = await FractalApi.claim(wallet).catch(async (e) => {
    if (e.message.includes("Unexpected token")) {
      logger.debug("Remove cf cookie due to the error", e);
      await saveWallet(
        _.merge(wallet, {
          moduleCache: {
            fractal: {
              cfClearance: "",
            },
          },
        } as Db.Wallet)
      );
    }

    throw e;
  });

  if (claimResult.code !== 0)
    throw new Error(claimResult.msg || "Could not claim fractal");

  await saveWallet(
    _.merge(wallet, {
      moduleCache: {
        fractal: {
          nextClaim: Date.now() + 1000 * 60 * 60 * 6,
        },
      },
    })
  );

  logger.info(
    `Claimed ${satsToBtc(claimResult.data.value)} tFB successfully in tx ${
      claimResult.data.txid
    }`
  );

  syncFractalBalance(wallet).catch(console.debug);
};
