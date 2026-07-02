# ModaAI monorepo mirror policy

## Status

`DesigAi/ModaAi` is no longer the canonical source repository for ModaAI frontend product work.

Canonical source:

```text
skillet07/ai-fashion-content-generation-telegram-bot/apps/web
```

Local canonical path:

```text
/home/roman/projects/ai-fashion-content-generation-telegram-bot/apps/web
```

This repository remains active only as the public GitHub Pages deployment mirror while the backend monorepo is private and cannot use GitHub Pages under the current GitHub plan.

## Why this mirror remains

The canonical monorepo is private:

```text
skillet07/ai-fashion-content-generation-telegram-bot
```

GitHub Pages creation for that private repository currently fails with:

```text
422 Your current plan does not support GitHub Pages for this repository.
```

The existing public Pages URL remains:

```text
https://desigai.github.io/ModaAi/
```

## Allowed changes in this repository

Allowed without reopening the repo as canonical:

- mirror/deploy updates intentionally copied from monorepo `apps/web`;
- README/policy changes explaining the repository status;
- GitHub Pages workflow maintenance;
- emergency demo fixes only if Roman explicitly approves direct mirror edits.

Not allowed by default:

- new product features;
- backend/API contract invention;
- paid-provider or Telegram runtime changes;
- secrets or `.env` values;
- divergent frontend logic that does not exist in the monorepo.

## Mirror update checklist

When updating this repository from monorepo `apps/web`:

1. Verify monorepo source is clean and pushed.
2. Copy only frontend mirror content from `apps/web`.
3. Preserve this mirror policy unless intentionally changing repository status.
4. Run:

```bash
npm run lint
npm run build
git diff --check
```

5. Push and verify GitHub Pages workflow succeeds.
6. Do not claim canonical source moved back here unless Roman explicitly decides that.

## Retirement options

Future decision gates:

1. **Mirror-only** — current Q237 state. Public Pages stays here; source lives in monorepo.
2. **Redirect-only** — this repo deploys a static redirect to another live URL.
3. **Archive** — only after an alternative public deployment is proven and old links are handled.
