import CliTable3 from "cli-table3";
import chalk from "chalk";
import { Db } from "@/lib/db";
import { satsToBtc } from "@/helpers/bitcoin";

export const drawBitcoinTable = (wallets: Db.Wallet[]) => {
  const table = new CliTable3({
    head: [
      chalk.cyan("#"),
      chalk.cyan("ID"),
      chalk.cyan("Address (P2TR)"),
      chalk.cyan("Fractal Testnet Balance"),
    ],
  });

  table.push(
    ...wallets.map((w, i) => [
      chalk.green(i + 1),
      chalk.green(w.id),
      chalk.yellow(w.addresses.bitcoin),
      `${
        w.balances?.FractalTestnet
          ? `${satsToBtc(w.balances?.FractalTestnet)} tFB`
          : chalk.gray("—")
      }`,
    ])
  );

  console.log(table.toString());
};
