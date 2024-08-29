# Hashlight CLI Fractal Module
[Website](https://hashlight.xyz/) | [Discord](https://discord.gg/tKbHweDkeY) | [Twitter](https://x.com/hashlight) | [Blog](https://teletype.in/@hashlight)

**💰 For more software, help with setup and useful info join our [Discord](https://discord.gg/tKbHweDkeY) 💰**

## Guide
1. Make sure you have everything installed according to the [guide](/README.en.md#requirements).
2. Create a `.env` file in the root directory.
3. Add the following environment variables:
```
2CAPTCHA_API_KEY=... 
UNISAT_FRACTAL_API_TOKEN=...
```
You can obtain `UNISAT_FRACTAL_API_TOKEN` from [developer dashboard](https://developer.unisat.io/account/login) and `2CAPTCHA_API_KEY` from [2captcha](https://2captcha.com/enterpage).

> 2captcha is required to solve captchas for the Fractal Testnet claim module. It's not required for other modules.
4. Update `src/config.ts` with your wallet configuration.
```ts
// This config will mint 1-2 NFTs for each ticker in random order for each wallet you select
export const GLOBAL_CONFIG = {
  fractal: {
    mint: [
      {
        tick: "pepeoe", // ticker
        repeat: [1, 2], // min/max repeat mint
      },
      {
        tick: "pizzapp",
        repeat: [1, 2],
      },
    ],
  },
};
```
5. `yarn start` to run the CLI toolkit.
6. Generate wallets in `Wallets -> Generate` menu.
7. Attach your proxies to wallets in `Wallets -> Proxy` menu. It requires to create `proxy.txt` file with proxies in format `ip:port:user:pass`
8. Go to `Fractal -> Claim testnet tokens` menu to claim the Fractal Testnet tokens. You can select wallets and delay between claims.
9. Go to `Fractal -> Mint testnet BRC20 tokens` menu to mint BRC-20 tokens. You can select wallets and delay between mints.
