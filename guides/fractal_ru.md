# Fractal Модуль Hashlight CLI
[Приложение](https://hashlight.xyz/) | [Discord](https://discord.gg/tKbHweDkeY) | [Личный ТГ](https://teletype.in/@hashlight) | [Twitter](https://x.com/hashlight) 

## Гайд
1. Создать `.env` файл в корне приложения
2. Добавить переменные:
```
2CAPTCHA_API_KEY=... 
UNISAT_FRACTAL_API_TOKEN=...
```
Получить `UNISAT_FRACTAL_API_TOKEN` можно на [платформе разработчиков Unisat](https://developer.unisat.io/account/login), а `2CAPTCHA_API_KEY` в дешборде [2captcha](https://2captcha.com/enterpage) после регистрации.

> 2captcha и прокси нужны для клейма токенов Fractal Testnet. Они не нужны для других модулей.

3. Обновить `src/config.ts` с твоей конфигурацией кошельков.
```ts
// Этот конфиг будет мнтить 1-2 NFT для каждого тикера в случайном порядке для каждого выбранного кошелька
export const GLOBAL_CONFIG = {
  fractal: {
    mint: [
      {
        tick: "pepeoe", // тикер
        repeat: [1, 2], // мин/макс повторений
      },
      {
        tick: "pizzapp",
        repeat: [1, 2],
      },
    ],
  },
};
```
1. `yarn start` чтобы запустить CLI.
2. Сгенерировать кошельки в меню `Wallets -> Generate`
3. Добавить прокси в меню `Wallets -> Proxy`. Для этого нужно будет создать файл `proxy.txt` с прокси в формате `ip:port:user:pass`
4. В разделе `Fractal -> Claim testnet tokens` запускается клейм токенов. Можно клеймить раз в 6 часов на один и тот же кошелек или прокси (с нескольких прокси на один кошелек сразу не получится).
5. В разделе `Fractal -> Mint testnet BRC20 tokens` можно запустить минт BRC-20. Конфиг будет взят из `src/config.ts`

**Больше софта, помощь по настройке и полезную инфу можно найти у нас в [Discord](https://discord.gg/tKbHweDkeY)**