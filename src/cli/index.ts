import { select } from "@inquirer/prompts";
import { logger } from "@/lib/logger.js";
import { Choice } from "@/types/inquirer";
import { CliMethod } from "@/types/cli";
import { walletsCli } from "@/cli/wallets";
import { fractalCli } from "@/modules/fractal/cli";

const selectWrapper = (name: string, options: Choice<CliMethod>[]) => ({
  name,
  value: () =>
    select({
      message: "Select action",
      pageSize: 20,
      choices: [
        ...options,
        {
          name: "Back",
          value: cli.homescreen,
        },
      ],
    }).then((result) => result()),
});

const fractal = selectWrapper("Fractal", fractalCli);
const wallets = selectWrapper("Wallets", walletsCli);

export const cli = {
  fractal: fractal.value,
  wallets: wallets.value,

  homescreen: () =>
    select({
      message: "Select action",
      pageSize: 20,
      choices: [
        wallets,
        fractal,
        {
          name: "Exit",
          value: () => {
            logger.info("Goodbye!");
            process.exit(0);
          },
        },
      ],
    }).then((fn) => fn()),
};

cli.homescreen();
