/**
 * @guide
 *  1. Install nodejs >= 18.x
 *  2. Install yarn
 *  3. Run `yarn` to install dependencies in the root dir of the project
 *  4. Add your private keys to the `privateKeys` array
 *  5. Run `npx tsx src/scripts/elixirClaim.ts` to run this script
 *
 * █░█ ▄▀█ █▀ █░█ █░░ █ █▀▀ █░█ ▀█▀
 * █▀█ █▀█ ▄█ █▀█ █▄▄ █ █▄█ █▀█ ░█░
 *         Made with ♥ by Morphelay
 *
 * @discord https://discord.gg/tKbHweDkeY
 * @twitter https://twitter.com/hashlight
 * @telegram https://t.me/morphelalydev
 * @website https://hashlight.xyz/
 */
import { eachOfSeries } from "async";
import {
  Contract,
  ContractTransactionResponse,
  formatEther,
  JsonRpcProvider,
  Wallet,
} from "ethers";
import elixirAbi from "@/abi/ethereum/elixir.json";
import { logger } from "@/lib/logger";

/**
 * Private keys go here
 */
const privateKeys = [
  "0x0000000000000000000000000000000000000000000000000000000000000000",
  "0x0000000000000000000000000000000000000000000000000000000000000000",
  "0x0000000000000000000000000000000000000000000000000000000000000000",
];

const ethProvider = new JsonRpcProvider("https://rpc.ankr.com/eth");

eachOfSeries(privateKeys, async (privateKey) => {
  try {
    const ethWallet = new Wallet(privateKey, ethProvider);

    logger.info(`Checking ${ethWallet.address} unused ETH...`);

    const elixirContract = new Contract(
      "0x4265f5d6c0cf127d733eefa16d66d0df4b650d53",
      elixirAbi,
      ethWallet
    );

    const unusedBalance = await elixirContract.unusedBalance(ethWallet.address);

    if (unusedBalance === 0n) {
      logger.info(`No unused ETH found for ${ethWallet.address}`);
      return;
    }

    logger.info(`Found ${formatEther(unusedBalance)} unused ETH. Claiming...`);

    const withdrawTx: ContractTransactionResponse =
      await elixirContract.withdrawEth(unusedBalance);

    logger.info(
      `Waiting for tx withdrawal conifrmation for ${ethWallet.address}: https://etherscan.io/tx/${withdrawTx.hash}`
    );

    withdrawTx
      .wait()
      .then(() => {
        logger.info(
          `Successfully claimed ${formatEther(unusedBalance)} ETH for ${
            ethWallet.address
          }`
        );
      })
      .catch((e) => {
        logger.error(`Could not claim ETH for ${ethWallet.address}`, e);
      });
  } catch (e) {
    logger.error(e);
    console.error(e);
  }
});
