import { number } from "@inquirer/prompts";

export const getDelays = async () => {
  const { min, max } = {
    min: await number({
      message: "Min delay (in seconds)",
      default: 60,
    }),
    max: await number({
      message: "Max delay (in seconds)",
      default: 300,
    }),
  };

  if (typeof min !== "number" || typeof max !== "number")
    throw new Error("Invalid input: min and max must be numbers");

  return { min, max };
};

export const getTxAmount = async () => {
  const { min, max } = {
    min: await number({
      message: "Min txs per wallet",
      default: 3,
    }),
    max: await number({
      message: "Max txs per wallet",
      default: 5,
    }),
  };

  if (typeof min !== "number" || typeof max !== "number")
    throw new Error("Invalid input: min and max must be numbers");

  return { min, max };
};
