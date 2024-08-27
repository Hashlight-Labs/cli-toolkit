import CliTable3 from "cli-table3";
import chalk from "chalk";
import { Db } from "@/lib/db";
import { GLOBAL_CONFIG } from "@/config";

export const drawFractalMintConfig = () => {
  const table = new CliTable3({
    head: [
      chalk.cyan("Tick"),
      chalk.cyan("Min repeat"),
      chalk.cyan("Max repeat"),
    ],
  });

  table.push(
    ...GLOBAL_CONFIG.fractal.mint.map((mint) => [
      chalk.green(mint.tick),
      chalk.green(mint.repeat[0]),
      chalk.green(mint.repeat[1]),
    ])
  );

  console.log(table.toString());
};
