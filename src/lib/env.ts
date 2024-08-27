import { config } from "dotenv";
import env from "env-var";

const { get } = env;

config();

export const DB_FILE = get("DB_FILE").default("db.json").asString();

export const _2CAPTCHA_API_KEY = get("2CAPTCHA_API_KEY").asString();

export const CONSOLE_LOG_LEVEL = get("CONSOLE_LOG_LEVEL")
  .default("info")
  .asString();

export const UNISAT_FRACTAL_API_TOKEN = get(
  "UNISAT_FRACTAL_API_TOKEN"
).asString();
