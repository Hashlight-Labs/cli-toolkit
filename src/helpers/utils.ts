import { logger } from "@/lib/logger";
import _ from "lodash";

export const sleep = (ms: number) => {
  logger.info(`Sleeping for ${ms / 1000} seconds`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getShortString = (str: string, length = 4) =>
  str.length > length ? str.slice(0, length) + ".." + str.slice(-length) : str;

export const retry = async <T>(
  fn: (retriesLeft: number) => Promise<T>,
  retriesLeft = 5,
  delay = 1000,
  id = "",
  multiplier = 1
): Promise<T> => {
  try {
    return await fn(retriesLeft);
  } catch (error) {
    if (retriesLeft) {
      logger.debug(
        `Retries left: ${retriesLeft} ${id ? `(${id})` : ""}}. Delay: ${delay}`,
        error
      );
      await sleep(delay);
      return retry(fn, retriesLeft - 1, delay * multiplier, id, multiplier);
    }
    throw error;
  }
};

export const shuffle = <T>(arr: T[]): T[] => _.shuffle([...arr]);

export const getRandomNumberBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);
