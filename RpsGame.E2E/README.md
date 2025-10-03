# RpsGame End-to-End Tests

This project hosts the Playwright test suite for the Rock · Paper · Scissors application.

## Prerequisites

- Node.js 20+
- The API running locally (`dotnet run --project ../RpsGame.Api`)
- (Optional) the Vite frontend running locally (`npm run dev` inside `../RpsGame.React`)

## Setup

```bash
cd RpsGame.E2E
npm install
npx playwright install --with-deps
```

## Running tests

```bash
# default headless run
npm test

# headed debugging
npm run test:headed

# interactive UI mode
npm run test:ui
```

To explore reports afterwards:

```bash
npm run report
```

## Project structure

- `playwright.config.ts` – shared config
- `tests/` – Playwright specs and page objects
- `tests/pages/game-page.ts` – encapsulates common UI interactions

Adjust the `webServer` section in `playwright.config.ts` if you'd like Playwright to boot the frontend automatically.
