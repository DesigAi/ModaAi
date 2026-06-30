# ModaAI teammate test runbook — D1 mock-safe HTTP backend

## Purpose

Run one teammate-testable D1 flow from the real frontend UI into the real local backend HTTP endpoint without paid providers, production deploys, or hidden demo fallback.

## Scope

This runbook covers the current Phase 2D P0 baseline:

- D1/streetwear single-look canonical launch request building exists.
- D1 mock-safe backend launch can complete to a local placeholder result.
- Frontend renders accepted launch state and refreshes backend result status.
- B1/C1 production wizard wiring is not enabled yet.
- Streetwear is accepted as a single-look template but currently remains queued in mock-safe backend completion semantics; D1 is the teammate-ready path.

## Hard safety rules

- Do not enable paid generation.
- Do not run against production.
- Do not edit `.env` secrets for this test.
- Do not use frontend `demo` mode as proof of backend integration.
- Do not treat B1/C1 as ready unless a separate B1/C1 wiring slice is merged.

## Required modes

| Surface | Required value | Why |
|---|---:|---|
| Frontend | `VITE_API_MODE=http` | Forces the frontend to call backend HTTP APIs. |
| Backend | `FASHION_BOT_PROVIDER_MODE=mock` | Keeps provider calls local/mock-only. |
| Backend | `FASHION_BOT_ALLOW_PAID_GENERATION=false` | Blocks paid KIE/Seedance generation. |

The app also displays a visible banner:

```text
API mode: demo | http
```

For this runbook, the banner must show:

```text
API mode: http
```

If it says `demo`, stop: the browser is not testing backend integration.

## Backend start

From the backend repo:

```bash
cd /home/roman/projects/ai-fashion-content-generation-telegram-bot
FASHION_BOT_PROVIDER_MODE=mock \
FASHION_BOT_ALLOW_PAID_GENERATION=false \
PYTHONPATH=src \
python -m fashion_bot.app --run-api
```

Expected local API base:

```text
http://localhost:8080
```

Optional backend verification before UI testing:

```bash
FASHION_BOT_PROVIDER_MODE=mock FASHION_BOT_ALLOW_PAID_GENERATION=false python -m pytest -q
FASHION_BOT_PROVIDER_MODE=mock FASHION_BOT_ALLOW_PAID_GENERATION=false PYTHONPATH=src python -m fashion_bot.app --check-config
FASHION_BOT_PROVIDER_MODE=mock FASHION_BOT_ALLOW_PAID_GENERATION=false PYTHONPATH=src python -m fashion_bot.app --check-bot
```

## Frontend start

From the frontend repo:

```bash
cd /home/roman/projects/ModaAi
VITE_API_MODE=http \
VITE_API_BASE_URL=http://localhost:8080 \
npm run dev
```

If the backend requires Telegram init data in the current local setup, also provide:

```bash
VITE_TELEGRAM_INIT_DATA='<valid local test init data>'
```

Do not paste real tokens or secrets into committed files.

## Frontend verification commands

Run before handing the build to a teammate:

```bash
npm run lint
npx tsx scripts/checkCanonicalLaunch.ts
npx tsx scripts/checkMultiLookLaunchDraft.ts
npm run build
git diff --check origin/main...HEAD
```

## D1 happy path — what teammate should see

1. Open the frontend.
2. Confirm the banner says:
   ```text
   API mode: http
   ```
3. Prepare/select the required D1 inputs:
   - saved look;
   - selected kit;
   - selected model with backend `characterIdentityCardId`.
4. Launch D1.
5. Expected accepted state:
   - accepted card appears in-app;
   - `requestId` is visible;
   - `jobId` is visible;
   - `resultId` is visible;
   - accepted status is `queued`.
6. Click **Обновить** or wait for polling.
7. Expected backend result state for D1 mock-safe:
   ```text
   ready
   ```
8. Result card in History/Results should show the backend-projected result, not a frontend-only fake completion.

## Expected blocked cases

The app should render structured blocked/unsupported state, not raw alert/fake success, when:

- frontend is missing a saved look;
- selected model has no backend `characterIdentityCardId`;
- unsupported frontend-only mapping reaches backend;
- B1/C1 is attempted before production wizard wiring exists;
- backend is not in mock-safe mode.

## Known limitations

- B1/C1 UI wiring is still out of scope for P0.
- Streetwear currently remains queued in mock-safe completion semantics; D1 is the teammate-ready path.
- Billing/credit reserve/spend semantics are not part of this teammate mock-safe flow.
- No production deploy/restart is part of this runbook.
- Paid provider output quality is not tested here.

## Stop conditions

Stop and ask the owner if any test requires:

- paid provider calls;
- production deploy/restart;
- new secrets or `.env` edits;
- billing/credit semantics decision;
- B1/C1 UX/product decision.
