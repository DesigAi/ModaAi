# ModaAI Web Demo

ModaAI is a Vite + React + TypeScript client demo for the AI Fashion production workspace.

## Current status

This repository is the web application only. The working Telegram bot/backend code lives in a separate repository:

```text
/home/roman/projects/ai-fashion-content-generation-telegram-bot
https://github.com/skillet07/ai-fashion-content-generation-telegram-bot
```

See [`docs/AUDIT.md`](docs/AUDIT.md) for the full-stack audit, reusable backend modules, web/backend gaps, and the exact blocker for live backend reuse.

## Demo mode

The app ships with an explicit typed demo API layer:

```text
src/api/contracts.ts
src/api/demoStore.ts
src/api/index.ts
```

By default `VITE_API_MODE=demo`. In this mode the frontend uses a local contract-compatible store so the client demo can run end-to-end without paid providers or a live backend adapter.

Covered demo flow:

1. demo login;
2. select/create AI model;
3. upload/select wardrobe kit;
4. save look;
5. launch production;
6. reserve credits and write ledger;
7. result appears in Results;
8. lifecycle advances automatically: `queued → processing → quality_check → archive_preparing → ready`;
9. ready confirms spend and releases reserve.

`VITE_API_MODE=http` is reserved for a future backend adapter and currently fails fast instead of inventing endpoints.

## Run locally

**Prerequisites:** Node.js 22+ recommended.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:3000/ModaAi/`.

## Verify

```bash
npm run lint
npm run build
```

## Environment

```env
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
VITE_API_MODE="demo"
VITE_API_BASE_URL="http://localhost:8080"
```

Do not commit real API keys, bot tokens, billing credentials, marketplace credentials, or wallet secrets.

## Live backend integration notes

The existing backend repo already has Telegram bot handlers, D1/B1/C1 generation pipelines, storage, provider abstractions, and a read-only Mini App API for generation history.

The web app still needs a backend adapter for:

- demo/session or Telegram WebApp session bridge;
- model/wardrobe/look storage APIs or mapping to existing backend entities;
- production launch endpoint using existing pipeline orchestration;
- credits/ledger ownership semantics;
- result status/history mapping to `src/api/contracts.ts`.

Until that adapter exists, keep `VITE_API_MODE=demo` for client demos.
