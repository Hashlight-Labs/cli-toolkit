import { config } from "dotenv";
import { cli } from "./src/cli";
import { checkIfRepoIsUpToDate } from "@/lib/checkUpdates";
import chalk from "chalk";
import ora from "ora";
import { sleep } from "@/helpers/utils";
import { log } from "console";
import checkbox from "@/lib/inquirer/checkbox";
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

const spinner = ora("Checking updates");
spinner.start();
await checkIfRepoIsUpToDate(() => spinner.stop());

cli.homescreen();
