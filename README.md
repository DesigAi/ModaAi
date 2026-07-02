# ModaAI Web Demo — deploy mirror

> **Canonical source moved to the monorepo.**
>
> This repository remains the public GitHub Pages deployment mirror for the ModaAI web app until the project has a supported Pages/deploy target from the monorepo.

## Canonical source

```text
/home/roman/projects/ai-fashion-content-generation-telegram-bot/apps/web
https://github.com/skillet07/ai-fashion-content-generation-telegram-bot/tree/main/apps/web
```

## Public demo URL

```text
https://desigai.github.io/ModaAi/
```

## Repository policy

- Product/frontend source changes should happen in the monorepo under `apps/web/`.
- This repository should receive only deliberate mirror/deploy updates from the monorepo or explicit repository-retirement changes.
- Do not add new product features directly here unless Roman explicitly reopens this repo as an active source repo.
- Do not put backend secrets, bot tokens, provider keys, billing credentials, marketplace credentials, or wallet secrets in this repository.

See [`docs/MONOREPO_MIRROR_POLICY.md`](docs/MONOREPO_MIRROR_POLICY.md) for the operational policy.

## Current app status

ModaAI is a Vite + React + TypeScript client demo for the AI Fashion production workspace.

This mirror still deploys the static web app through GitHub Pages from `main`.

The working backend/runtime/control-plane lives in the monorepo:

```text
/home/roman/projects/ai-fashion-content-generation-telegram-bot
https://github.com/skillet07/ai-fashion-content-generation-telegram-bot
```

See [`docs/AUDIT.md`](docs/AUDIT.md) for the full-stack audit, reusable backend modules, web/backend gaps, and the exact blocker for live backend reuse.

## Product / UX specs

- [`docs/specs/desktop-web-platform-ux-spec.md`](docs/specs/desktop-web-platform-ux-spec.md) — target desktop web MVP/product UX specification. This is the future product source of truth, not a claim that the current demo PR already implements every requirement.

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

`VITE_API_MODE=http` is reserved for backend adapter work and should not invent endpoints.

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
