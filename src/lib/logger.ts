import winston, { format } from "winston";
import { sleep } from "@/helpers/utils.js";
import { CONSOLE_LOG_LEVEL } from "@/lib/env";
import { db, Db } from "@/lib/db";

const { combine, timestamp, prettyPrint, cli } = winston.format;

winston.addColors({
  success: "green",
});

export const logger = winston.createLogger({
  level: "info",
  levels: {
    debug: 4,
    info: 3,
    success: 2,
    warn: 1,
    error: 0,
  },

  transports: [
    new winston.transports.Console({
      level: CONSOLE_LOG_LEVEL || "info",
      format: combine(
        format((info) => {
          return {
            ...info,
            message: `${info.prefix ? `[${info.prefix}] ` : ""}${info.message}`,
          };
        })(),
        cli({
          levels: {
            debug: 4,
            info: 3,
            success: 2,
            warn: 1,
            error: 0,
          },
        })
      ),
    }),
    new winston.transports.File({
      level: "debug",
      maxFiles: 5,
      maxsize: 1024 * 1024 * 128, // 128MB
      filename: "history.log",
      format: combine(timestamp(), prettyPrint()),
    }),
  ],
}) as winston.Logger & {
  success: (message: any) => void;
};

export const createChildLogger = (
  module: string,
  wallet: Db.Wallet,
  suffix: string
) => {
  const walletIndex = db.data.wallets.findIndex((w) => w.id === wallet.id) + 1;

  return logger.child({
    prefix: `${module}:${walletIndex}:${suffix}`,
  });
};

process.on("uncaughtException", async (error) => {
  logger.error(`App crashed with error: ${error}\n${error?.stack}`);
  await sleep(1000);

  console.log("Crashing....");
  process.exit(1);
});
