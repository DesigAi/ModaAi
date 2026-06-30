# Phase 2D Slice 4 — Teammate runbook and env guardrails

## Goal

Make the test handoff runnable by a teammate without Roman/Hermes explaining hidden setup.

## Scope

- Add `docs/TEAMMATE_TEST_RUNBOOK.md`.
- Document backend mock-safe start command.
- Document frontend HTTP-mode start command.
- Document required env vars.
- Add visible frontend API mode indicator or warning.
- Prevent accidental demo-mode testing when backend HTTP mode is intended.

## Required runbook sections

- Prerequisites.
- Backend setup/start.
- Frontend setup/start.
- Required env.
- D1 happy path.
- Expected blocked cases.
- Known limitations.
- Bug report template for teammate.

## Non-goals

- No production deploy/restart.
- No secret printing.
- No paid/live mode instructions as default path.

## Acceptance criteria

- Teammate can identify current mode: `demo` vs `http`.
- Runbook contains copy-paste commands.
- D1 test path has clear expected result.
- B1/C1 are clearly marked as not yet wired if still unavailable.

## Verification

```bash
npm run lint
npm run build
git diff --check origin/main...HEAD
```
