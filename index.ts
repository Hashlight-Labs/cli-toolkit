import { config } from "dotenv";
import { cli } from "./src/cli";
import { checkIfRepoIsUpToDate } from "@/lib/checkUpdates";
import chalk from "chalk";
import ora from "ora";
import { DB_FILE } from "@/lib/env";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
config();

// listen for ctrl c to exit
process.on("SIGINT", async () => {
  console.log(`\n${chalk.green("Bye!")}`);
  process.exit();
});

console.log(`${chalk.yellow(`
  █░█ ▄▀█ █▀ █░█ █░░ █ █▀▀ █░█ ▀█▀
  █▀█ █▀█ ▄█ █▀█ █▄▄ █ █▄█ █▀█ ░█░`)}
  ${chalk.gray(
    `Made with ${chalk.red("♥")} by ${chalk.blue("https://t.me/morphelay")}`
  )}\n`);

logger.info(
  `You're using ${chalk.green(DB_FILE)} database wich has ${chalk.green(
    `${db.data.wallets.length} wallets`
  )}`
);

const spinner = ora("Checking updates");
spinner.start();
await checkIfRepoIsUpToDate(() => spinner.stop());

cli.homescreen();
