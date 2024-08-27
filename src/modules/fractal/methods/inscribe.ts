import { getShortString } from "@/helpers/utils";
import { Db } from "@/lib/db";
import { createChildLogger } from "@/lib/logger";
import { FractalApi } from "@/modules/fractal/api";
import { sendBtc } from "@/modules/fractal/bitcoin";
import { syncFractalBalance } from "@/modules/fractal/utils";

export const mintFractal = async ({
  wallet,
  ticker,
  count,
}: {
  wallet: Db.Wallet;
  ticker: string;
  count: number;
}) => {
  const logger = createChildLogger(
    `FRACTAL:MINT:${ticker}`,
    wallet,
    getShortString(wallet.addresses.bitcoin)
  );

  logger.info(`Minting BRC20 token: ${ticker} x ${count}`);

  const brc20Data = await FractalApi.getBrc20Info(ticker);
  if (!("data" in brc20Data))
    throw new Error(
      `No brc20 data found for ticker ${ticker}: ${brc20Data.msg}`
    );

  const canMint =
    Number(brc20Data.data.max) - Number(brc20Data.data.limit) >=
    Number(brc20Data.data.minted);

  if (!canMint) throw new Error(`Reached limit for mint ${ticker}`);

  const feeRate = await FractalApi.getFeeRate();
  const mint = await FractalApi.createBrc20Mint({
    receiveAddress: wallet.addresses.bitcoin,
    feeRate: feeRate.fastestFee,
    brc20Amount: String(brc20Data.data.limit),
    brc20Ticker: ticker,
    count,
  });

  logger.debug({ mintinfo: mint });

  if (!("data" in mint))
    throw new Error(`No mint data found for ticker ${ticker}: ${mint.msg}`);

  const txid = await sendBtc(
    wallet,
    mint.data.payAddress,
    mint.data.amount,
    feeRate.fastestFee * 158 // vsize for transfer
  );

  logger.info(`Minted ${count} ${ticker}. Txid: ${txid}`);

  syncFractalBalance(wallet).catch(console.debug);
};
