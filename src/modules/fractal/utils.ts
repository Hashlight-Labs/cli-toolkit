import { satsToBtc } from "@/helpers/bitcoin";
import { getShortString, retry, waitForValue } from "@/helpers/utils";
import { db, Db, saveWallet } from "@/lib/db";
import { logger } from "@/lib/logger";
import { FractalApi } from "@/modules/fractal/api";
import _ from "lodash";

export const syncFractalBalance = async (wallet: Db.Wallet) => {
  await db.read();
  const res = await FractalApi.getBalance(wallet.addresses.bitcoin);
  if (!("data" in res)) throw new Error("Couldn't fetch fractal balance");

  const balance = res.data.satoshi + res.data.pendingSatoshi;

  logger.info(
    `[${getShortString(
      wallet.addresses.bitcoin
    )}] Fractal balance updated: ${satsToBtc(balance)} tFB`
  );

  await saveWallet(
    _.merge(wallet, {
      balances: {
        [Db.Network.FractalTestnet]: balance,
      },
    } as Db.Wallet)
  );
};

export const waitForFractalFee = (maxFee: number, proxy?: string) =>
  waitForValue(
    () => retry(() => FractalApi.getFeeRate(proxy)),
    (feeRate) => feeRate.fastestFee < maxFee,
    10000,
    {
      firstMessage: `Waiting for fee to drop below ${maxFee} sat/vB`,
    }
  );
