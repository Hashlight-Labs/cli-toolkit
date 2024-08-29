# Hashlight CLI Toolkit
[Сайт](https://hashlight.xyz/) | [Discord](https://discord.gg/tKbHweDkeY) | [Личный ТГ](https://teletype.in/@hashlight) | [Twitter](https://x.com/hashlight) 

> 🇬🇧 See the [English version](/README.en.md) of this document.

**💰 Больше софта, помощь по настройке и полезную инфу можно найти у нас в [Discord](https://discord.gg/tKbHweDkeY) 💰**

## О софте
Это CLI-инструмент для автоматизации различных задач в блокчейне. Можно ранить локально и на сервере.

## Модули
- Генерация и управление кошельками и прокси
- Модуль на клейм и минт Fractal Testnet — [гайд](/guides/fractal_ru.md)

## Скрипты
- [Клейм на Elixir](/src/scripts/elixirClaim.ts)

## Требования
1. Node.js >=18.17.1, установка по [гайду](https://nodejs.org/en/download/package-manager)
2. yarn >=1.22.19, установка через `npm install --global yarn`
3. playwright >=1.46.1, установка через `npx playwright install` (может потребовать установки системных зависимостей, следуйте подсказкам)
4. Зависимости проекта, установка через `yarn install`

### База данных
Все данные хранятся в файле `db.json`. Делай бэкап этого файла, чтобы не потерять свои сидки и остальное.

### Логи
Логи хранятся в `history.log`. При возникновении проблем смотри сюда или пиши в [Discord](https://discord.gg/tKbHweDkeY).