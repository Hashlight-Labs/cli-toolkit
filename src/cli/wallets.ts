import { cli } from "@/cli";
import { mnemonicToPrivateKey, privateKeyToAddress } from "@/helpers/bitcoin";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { drawBitcoinTable } from "@/stats/bitcoin";
import { drawProxyTable } from "@/stats/proxy";
import { number, select, confirm } from "@inquirer/prompts";
import { eachOfSeries } from "async";
import bip39 from "bip39";
import { createHash } from "crypto";
import { readFileSync } from "fs";

export const walletsCli = [
  {
    name: "Wallets -> Generate",
    value: async () => {
      const amount = await number({
        message: "How many wallets to generate?",
        default: 10,
      });

      await eachOfSeries(Array(amount).fill(0), async () => {
        const mnemonic = bip39.generateMnemonic();

        const id = createHash("sha256")
          .update(mnemonic)
          .digest("hex")
          .slice(0, 16);

        db.data.wallets.push({
          id,
          mnemonic,
          addresses: {
            bitcoin: privateKeyToAddress(
              mnemonicToPrivateKey(mnemonic)
            ) as string,
          },
        });
      });

      await db.write();

      logger.info(`Generated ${amount} wallets. Here's the updated list:`);

      drawBitcoinTable(db.data.wallets);

      cli.homescreen();
    },
  },

  {
    name: "Wallets -> List",
    value: async () => {
      drawBitcoinTable(db.data.wallets);
      cli.homescreen();
    },
  },

  {
    name: "Wallets -> Proxy",
    value: async () => {
      const mode = await select({
        message: "Override existing or append?",
        choices: [
          {
            name: "Add proxies from proxy.txt in format ip:port:user:pass",
            value: "append",
          },
          {
            name: "Remove all proxies",
            value: "remove",
          },
        ],
      });

      await db.read();

      const proxies = readFileSync("proxy.txt", "utf-8")
        .split("\n")
        .filter(Boolean);

      if (mode === "remove") {
        db.data.wallets.forEach((w) => {
          w.proxy = "";
        });

        await db.write();
      }

      if (mode === "append") {
        const allowDuplicates = await confirm({
          message: "Allow duplicates?",
          default: false,
        });

        const walletsWithoutProxy = db.data.wallets.filter((w) => !w.proxy);

        const allowedProxies = allowDuplicates
          ? proxies
          : proxies.filter((p) => !db.data.wallets.find((w) => w.proxy === p));

        walletsWithoutProxy
          .slice(
            0,
            allowDuplicates ? walletsWithoutProxy.length : allowedProxies.length
          )
          .forEach((w, i) => {
            w.proxy = allowedProxies[i % allowedProxies.length];
          });

        await db.write();
      }

      drawProxyTable(db.data.wallets);

      cli.homescreen();
    },
  },
];
