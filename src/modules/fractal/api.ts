import { db, Db } from "@/lib/db";
import { UNISAT_FRACTAL_API_TOKEN } from "@/lib/env";
import { proxyStringToUri } from "@/lib/proxy";
import { sendBtc } from "@/modules/fractal/bitcoin";
import { FRACTAL_API_BASE_URL as BASE_URL } from "@/modules/fractal/const";
import { type FractalApi as TFractalApi } from "@/modules/fractal/types";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";
import crypto from "crypto";

const defaultHeaders = {
  accept: "application/json",
  "content-type": "application/json",
  Authorization: `Bearer ${UNISAT_FRACTAL_API_TOKEN}`,
};

export const getUnisatHeaders = (dataRaw: string, path: string) => {
  const time = Math.floor(Date.now() / 1e3).toString();
  const strToSign = `${path}\n${dataRaw}\n${time}@#?.#@deda5ddd2b3d84988b2cb0a207c4674e`;
  const appid = "1adcd7969603261753f1812c9461cd36";

  const sign = crypto.createHash("md5").update(strToSign).digest("hex");
  const cf = ""
    .concat(Math.random().toString(36).slice(-6))
    .concat(sign.substring(12, 14))
    .concat(Math.random().toString(36).slice(-8), "u")
    .concat(Math.random().toString(36).slice(-8));

  return { appid, cf, sign, time };
};

export const FractalApi = {
  claim(wallet: Db.Wallet) {
    const proxyString = wallet.proxy;
    const cfClearance = wallet.moduleCache?.fractal?.cfClearance;
    const userAgent = wallet.moduleCache?.fractal?.userAgent;
    const address = wallet.addresses.bitcoin;

    if (!proxyString) throw new Error("No proxyString found");
    if (!cfClearance) throw new Error("No cfClearance found");
    if (!userAgent) throw new Error("No userAgent found");

    return fetch(
      "https://explorer-testnet.fractalbitcoin.io/faucet-api/claim",
      {
        agent: new HttpsProxyAgent(proxyStringToUri(proxyString)),
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-GB,en;q=0.9,ru-RU;q=0.8,ru;q=0.7,en-US;q=0.6",
          "cache-control": "no-cache",
          "content-type": "application/json",
          "fetch-mode": "no-cors",
          "fetch-site": "same-origin",
          pragma: "no-cache",
          priority: "u=1, i",
          "user-agent": userAgent,
          cookie: `cf_clearance=${cfClearance};`,
          Referer: "https://explorer-testnet.fractalbitcoin.io/faucet",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: JSON.stringify({
          address,
          clientId: Math.random().toString(36).substring(7),
        }),
        method: "POST",
      }
    ).then(
      (res) =>
        res.json() as Promise<TFractalApi.Response<TFractalApi.ClaimData>>
    );
  },

  getFeeRate() {
    return fetch(
      `https://mempool-testnet.fractalbitcoin.io/api/v1/fees/recommended`,
      {
        headers: defaultHeaders,
      }
    ).then((res) => res.json() as Promise<TFractalApi.FeeRate>);
  },

  getBalance(address: string) {
    return fetch(`${BASE_URL}/v1/indexer/address/${address}/balance`, {
      headers: defaultHeaders,
    }).then(
      (res) =>
        res.json() as Promise<TFractalApi.Response<TFractalApi.BalanceData>>
    );
  },

  getUtxo(address: string) {
    return fetch(`${BASE_URL}/v1/indexer/address/${address}/utxo-data`, {
      headers: defaultHeaders,
    }).then(
      (res) => res.json() as Promise<TFractalApi.Response<TFractalApi.UtxoData>>
    );
  },

  getBrc20Info(ticker: string) {
    return fetch(`${BASE_URL}/v1/indexer/brc20/${ticker}/info`, {
      headers: defaultHeaders,
    }).then(
      (res) =>
        res.json() as Promise<TFractalApi.Response<TFractalApi.Brc20Data>>
    );
  },

  pushTx(txHex: string) {
    return fetch(`${BASE_URL}/v1/indexer/local_pushtx`, {
      headers: defaultHeaders,
      method: "POST",
      body: JSON.stringify({ txHex }),
    }).then((res) => res.json() as Promise<TFractalApi.Response<string>>);
  },

  createInscribeOrderV5({
    receiveAddress,
    feeRate,
    files,
    proxy,
  }: {
    receiveAddress: string;
    feeRate: number;
    files: { dataURL: string; filename: string }[];
    proxy: string;
  }) {
    const body = JSON.stringify({
      files,
      receiver: receiveAddress,
      feeRate,
      outputValue: 546,
      clientId: Math.random().toString(36).substring(7),
    });

    const path = "/inscribe-v5/order/create";
    const headers = getUnisatHeaders(body, path);

    return fetch(`https://fractal-api-testnet.unisat.io${path}`, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "cache-control": "no-cache",
        "cf-token": headers.cf,
        "x-appid": headers.appid,
        "x-sign": headers.sign,
        "x-ts": headers.time,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      },
      referrer: "https://fractal-testnet.unisat.io/",
      body,
      method: "POST",
      agent: new HttpsProxyAgent(proxyStringToUri(proxy)),
    }).then(
      (res) =>
        res.json() as Promise<TFractalApi.Response<TFractalApi.OrderData>>
    );
  },

  createBrc20Mint({
    receiveAddress,
    feeRate,
    brc20Ticker,
    brc20Amount,
    count,
  }: {
    receiveAddress: string;
    feeRate: number;
    brc20Amount: string;
    brc20Ticker: string;
    count: number;
  }) {
    return fetch(`${BASE_URL}/v2/inscribe/order/create/brc20-mint`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        receiveAddress: receiveAddress,
        feeRate: feeRate,
        outputValue: 546,
        brc20Ticker,
        brc20Amount,
        count,
      }),
    }).then(
      (res) =>
        res.json() as Promise<TFractalApi.Response<TFractalApi.OrderData>>
    );
  },

  createInscribeOrder({
    receiveAddress,
    feeRate,
    files,
  }: {
    receiveAddress: string;
    feeRate: number;
    files: { dataURL: string; filename: string }[];
  }) {
    return fetch(`${BASE_URL}/v2/inscribe/order/create`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        receiveAddress,
        feeRate,
        outputValue: 546,
        files,
      }),
    }).then(
      (res) =>
        res.json() as Promise<TFractalApi.Response<TFractalApi.OrderData>>
    );
  },
};
