# ModaAI full-stack audit

Дата: 2026-06-29

## Scope

Репозиторий веб-приложения: `https://github.com/DesigAi/ModaAi.git`.

Задача: довести web app до клиентского demo-flow, переиспользуя уже существующую backend/Telegram-бот логику там, где она доступна, и не выдумывать production endpoints.

## Что найдено в `DesigAi/ModaAi`

`DesigAi/ModaAi` сейчас является Vite + React + TypeScript приложением:

- `src/App.tsx` — основной stateful shell приложения.
- `src/types.ts` — доменные типы: `Model`, `WardrobeItem`, `WardrobeKit`, `Look`, `PaymentIntent`, `LedgerItem`, `ResultItem`, `ActiveProductionFlow`.
- `src/mockData.ts` — стартовые данные для демо.
- `src/components/*` — экраны demo-flow: auth, create wizard, wardrobe, looks, results, tariffs, settings.
- `package.json` содержит `express`/`dotenv`, но в этом repo нет server entrypoint, API routes или Telegram handlers.

Проверка по tracked-файлам и grep-маркерам не нашла в `DesigAi/ModaAi`:

- Telegram bot handlers;
- backend API server;
- storage/DB adapter;
- queue/worker для generation jobs;
- payment/USDT backend;
- real AI generation pipeline.

## Где найден существующий Telegram/backend код

Связанный рабочий backend/Telegram bot найден локально отдельно от web repo:

```text
/home/roman/projects/ai-fashion-content-generation-telegram-bot
https://github.com/skillet07/ai-fashion-content-generation-telegram-bot
```

Ключевые backend модули:

- `src/fashion_bot/bot/*` — Telegram UX/FSM handlers.
- `src/fashion_bot/pipeline/*` — D1/B1/C1/streetwear orchestration.
- `src/fashion_bot/generation/*` — provider abstraction, mock provider, KIE/Seedance, ImgBB.
- `src/fashion_bot/storage/*` — SQLAlchemy repositories, artifact storage, SQLite.
- `src/fashion_bot/api/miniapp.py` — существующий read-only Mini App API.

Существующие Mini App endpoints в backend repo:

| Method | Path | Назначение |
|---|---|---|
| GET | `/healthz` | health check |
| GET | `/api/v1/generations` | список generation history для Telegram user/admin |
| GET | `/api/v1/generations/{job_id}` | один generation job |
| GET | `/api/v1/artifacts/{artifact_id}/download-url` | signed download URL |

Важно: этот API уже использует Telegram WebApp init data auth (`X-Telegram-Init-Data`) и не покрывает CRUD web сущностей ModaAI.

## Что можно переиспользовать из Telegram/backend

Можно переиспользовать без переписывания бизнес-логики:

- pipeline orchestration для generation jobs;
- provider abstraction и safe mock mode;
- storage repositories/artifact store;
- generation history/read-only miniapp API;
- Telegram WebApp init data validation;
- D1/B1/C1 template configs и prompt/pipeline contracts.

Но прямое подключение из `DesigAi/ModaAi` сейчас невозможно без adapter layer в backend repo, потому что web app оперирует сущностями `Model/WardrobeItem/WardrobeKit/Look/Credits`, а текущий backend Mini App API отдаёт только generation history/artifacts.

## Что было mock/localStorage-only в web app

До этого audit/refactor в `src/App.tsx` локально хранились:

- auth/session;
- credits balance/reserved credits;
- models;
- wardrobe items/kits;
- looks;
- active production flow;
- results lifecycle;
- ledger;
- payment simulation/admin actions.

Это было удобно для AI Studio прототипа, но не создавало backend boundary.

## Добавленная demo boundary

В этом repo добавлен явный typed service layer:

```text
src/api/contracts.ts
src/api/demoStore.ts
src/api/index.ts
```

`demoStore` остаётся localStorage-backed только в explicit demo mode, но компоненты теперь работают через typed service boundary вместо хаотичного localStorage persistence внутри `App.tsx`.

Переменные:

```env
VITE_API_MODE="demo"      # demo | http
VITE_API_BASE_URL="..."   # future live backend adapter
```

`http` mode намеренно fail-fast для мутаций, пока live backend contracts не реализованы.

## Минимальный backend-compatible contract для клиентского демо

Текущий frontend service contract:

| Area | Contract |
|---|---|
| Auth | `loginDemo`, `logoutDemo`, `getWorkspace` |
| Workspace | `saveWorkspace`, `resetWorkspace` |
| Models | `saveModel` |
| Wardrobe | `saveWardrobeKit`, update/hide/delete через workspace patch |
| Looks | `saveLook`, rename/delete через workspace patch |
| Credits/Ledger | `addCredits`, `adminAdjustCredits`, `addLedgerEntry` |
| Production | `startProductionFlow`, `launchProduction` |
| Results | `advanceResultStatus`, `refundResult`, `manualFixResult` |

Future backend endpoints should map to the same request/response DTOs from `src/api/contracts.ts`, not to component-private state.

## Demo flow covered

Explicit demo mode covers:

1. demo login;
2. select/create model;
3. upload/select wardrobe kit;
4. create/save look;
5. launch production;
6. reserve credits and ledger entry;
7. result appears as `queued`;
8. automatic demo lifecycle progresses through `processing → quality_check → archive_preparing → ready`;
9. ready status confirms spend and releases reserve;
10. failure/support paths remain available from Results drawer.

## Remaining blocker for real backend reuse

To move from `VITE_API_MODE=demo` to real backend reuse, backend repo needs a web adapter/API that exposes:

- demo/session or Telegram WebApp session bridge;
- model/wardrobe/look storage APIs or mapping to existing character/template storage;
- production launch endpoint that creates backend `GenerationJob` using existing pipeline orchestration;
- wallet/ledger semantics, or an explicit decision to keep credits demo-only for now;
- result status/history endpoint mapped to web `ResultItem` contract.

Until that adapter exists, production endpoints must not be invented in the web repo.
