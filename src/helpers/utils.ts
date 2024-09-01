import { ProgramError, ProgramErrorFlag } from "@/lib/classes/ProgramError";
import { logger } from "@/lib/logger";
import _ from "lodash";

export const sleep = (ms: number, msg = `Sleeping for {}`) => {
  logger.info(msg.replace("{}", `${ms / 1000} seconds`));
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
  } catch (error: any | ProgramError) {
    if (error instanceof ProgramError && !error.shouldRetry) throw error;
    if (!retriesLeft) throw error;

    logger.debug(
      `Retries left: ${retriesLeft}${id ? ` (${id})` : ""}. Delay: ${delay}.`,
      error
    );
    await sleep(delay);
    return retry(fn, retriesLeft - 1, delay * multiplier, id, multiplier);
  }
};

export const shuffle = <T>(arr: T[]): T[] => _.shuffle([...arr]);

export const getRandomNumberBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const getDelaySet = (
  length: number,
  minDelay: number,
  maxDelay: number
) =>
  [
    0,
    ...Array.from(
      { length: length - 1 },
      () => Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay
    ),
  ].map((delay, i, arr) => {
    const newDelay = delay + (arr[i - 1] || 0);
    arr[i] = newDelay;
    return newDelay;
  });

/**
 * Retry function until it succeeds or runs out of retries
 */
export const waitForValue = async <R>(
  fn: () => R | Promise<R>,
  verify: (value: R) => boolean,
  delay = 10000,
  { firstMessage = "", successMessage = "" } = {}
): Promise<void> => {
  const check = async (attempt = 0) => {
    const value = await fn();

    logger.debug("Waiting for value", {
      value,
    });

    if (verify(value)) {
      if (successMessage && attempt > 0) logger.info(successMessage);
      return;
    }

    if (attempt === 0 && firstMessage) logger.info(firstMessage);

    await sleep(delay);

    return check(attempt + 1);
  };

  return check();
};
