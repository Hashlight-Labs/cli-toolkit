import { Browser, Page } from "playwright";
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import ProxyChain from "proxy-chain";
import { proxyStringToUri } from "@/lib/proxy.js";
import { createChildLogger } from "@/lib/logger";
import _ from "lodash";
import { Solver } from "@2captcha/captcha-solver";
import {
  fractalInitScript,
  fractalCallback,
} from "@/modules/fractal/scripts/fractalBrowserScripts";
import { _2CAPTCHA_API_KEY } from "@/lib/env";
import { Db } from "@/lib/db";
import { getShortString } from "@/helpers/utils";

const solver = new Solver(_2CAPTCHA_API_KEY || "");

chromium.use(stealth());

const USE_HEADFUL = false;

export class FractalBrowserAgent {
  browser?: Browser;
  page?: Page;
  proxyUrl?: string;
  proxyString: string;
  logger;

  constructor(wallet: Db.Wallet) {
    if (!wallet.proxy) throw new Error(`Wallet ${wallet.proxy} has no proxy`);
    this.proxyString = wallet.proxy;
    this.logger = createChildLogger(
      "FRACTAL:BROWSER",
      wallet,
      getShortString(wallet.addresses.bitcoin)
    );
  }

  async start(): Promise<{
    userAgent: string;
    cfClearance: string;
  }> {
    this.proxyUrl = await ProxyChain.anonymizeProxy(
      proxyStringToUri(this.proxyString)
    );

    this.browser = await chromium.launch({
      headless: false,
      args: [USE_HEADFUL ? "" : `--headless=new`].filter((e) => e),

      proxy: {
        server: this.proxyUrl,
      },
    });

    const context = await this.browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    });

    this.page = await context.newPage();
    this.page.addInitScript(fractalInitScript);
    await this.page.goto("https://explorer-testnet.fractalbitcoin.io/faucet", {
      waitUntil: "load",
    });

    /**
     * Intercepts the captcha params and solves it
     */
    return new Promise(async (resolve, reject) => {
      let solving = false;

      this.page?.on("console", async (msg) => {
        const txt = msg.text();

        if (!txt.includes("intercepted-params:") || solving) return;
        solving = true;
        const params = JSON.parse(txt.replace("intercepted-params:", ""));

        try {
          this.logger.debug(`Solving the captcha with params`, params);
          const res = await solver.cloudflareTurnstile(params);
          this.logger.debug(`Solved the captcha ${res.id}`, res);

          await this.page?.evaluate(fractalCallback, res.data);
          await this.page?.waitForTimeout(5000);

          const cookies = await context.cookies();

          const cfClearance = cookies.find(
            (e) => e.name === "cf_clearance"
          )?.value;

          if (!cfClearance) throw new Error("No cf_clearance cookie found");

          resolve({
            userAgent: params.userAgent as string,
            cfClearance,
          });
        } catch (e: any) {
          reject(e);
        }

        setTimeout(() => {
          reject("Timeout");
        }, 900000);
      });

      await this.page?.reload({ waitUntil: "load" });
    });
  }

  async close() {
    if (this.browser) this.browser?.close();
    if (this.proxyUrl)
      await ProxyChain.closeAnonymizedProxy(this.proxyUrl, true);
  }
}
