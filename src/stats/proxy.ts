import CliTable3 from "cli-table3";
import chalk from "chalk";
import { Db } from "@/lib/db";

export const drawProxyTable = (wallets: Db.Wallet[]) => {
  /**
   * Drawing table
   */
  {
    const table = new CliTable3({
      head: [chalk.cyan("#"), chalk.cyan("ID"), chalk.cyan("Proxy")],
    });
    const data = wallets.map((wallet, index) => [
      chalk.green(index + 1),
      chalk.green(wallet.id),
      wallet.proxy,
    ]);
    table.push(...data);

    console.log(table.toString());
  }
};
