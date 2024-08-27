# Hashlight CLI Toolkit
[Website](https://hashlight.xyz/) | [Discord](https://discord.gg/tKbHweDkeY) | [Twitter](https://x.com/hashlight) | [Blog](https://teletype.in/@hashlight)

## About
This is a CLI toolkit for different kinds of blockchain automation. You can run it locally or on a server.

Modules included:
1. Wallet creation and management
2. Proxy management
3. Fractal Testnet claim and BRC-20 minting

**More modules will be added soon, join [Discord](https://discord.gg/tKbHweDkeY) to stay updated.**


## Usage
Requirements: 
1. Node.js >=18.17.1, install with [guide](https://nodejs.org/en/download/package-manager)
2. yarn >=1.22.19, install with `npm install --global yarn`
3. playwright >=1.46.1, install with `npx playwright install` (might require to install some system dependencies, follow the guide)
4. Npm packages, install with `yarn install`

### Quick Start
1. Create a `.env` file in the root directory.
2. Add the following environment variables:
```
2CAPTCHA_API_KEY=... 
UNISAT_FRACTAL_API_TOKEN=...
```
You can obtain `2CAPTCHA_API_KEY` from [developer dashboard](https://developer.unisat.io/account/login) and `UNISAT_FRACTAL_API_TOKEN` from [2captcha](https://2captcha.com/enterpage).

> 2captcha is required to solve captchas for the Fractal Testnet claim module. It's not required for other modules.
3. Update `src/config.ts` with your wallet configuration.
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
4. `yarn start` to run the CLI toolkit.



### Database
All your data is stored in `db.json` file. Make backup of this file to avoid losing your seeds and other data.



