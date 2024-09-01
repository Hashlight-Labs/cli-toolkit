import { config } from "dotenv";
import { cli } from "./src/cli";
import { checkIfRepoIsUpToDate } from "@/lib/checkUpdates";
import chalk from "chalk";
import ora from "ora";
import { sleep } from "@/helpers/utils";
config();

console.log(`${chalk.yellow(`
  █░█ ▄▀█ █▀ █░█ █░░ █ █▀▀ █░█ ▀█▀
  █▀█ █▀█ ▄█ █▀█ █▄▄ █ █▄█ █▀█ ░█░`)}
  ${chalk.gray(
    `Made with ${chalk.red("♥")} by ${chalk.blue("https://t.me/morphelay")}`
  )}\n`);

const spinner = ora("Checking updates");
spinner.start();
await checkIfRepoIsUpToDate(() => spinner.stop());

cli.homescreen();
