# Hashlight CLI Toolkit
[Website](https://hashlight.xyz/) | [Discord](https://discord.gg/tKbHweDkeY) | [Twitter](https://x.com/hashlight) | [Blog](https://teletype.in/@hashlight)

> Перейти к [🇷🇺 русской версии](/README.ru.md) документации.

**💰 For more software, help with setup and useful info join our [Discord](https://discord.gg/tKbHweDkeY) 💰**

## About
This is a CLI toolkit for different kinds of blockchain automation. You can run it locally or on a server.

## Modules
- Wallet & proxy management
- Fractal Testnet Claim & Mint — [guide](/guides/fractal_en.md)

## Scripts
- [Elixir Claim](/src/scripts/elixirClaim.ts)

## Requirements
1. Node.js >=18.17.1, install with [guide](https://nodejs.org/en/download/package-manager)
2. yarn >=1.22.19, install with `npm install --global yarn`
3. playwright >=1.46.1, install with `npx playwright install` (might require to install some system dependencies, follow the guide)
4. Npm packages, install with `yarn install`

### Database
All your data is stored in `db.json` file. Make backup of this file to avoid losing your seeds and other data.



