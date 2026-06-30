# Phase 2D Slice 5 — B1/C1 UI wiring

## Goal

Wire the existing pure multi-look helpers to real frontend wizard state after D1 teammate testing is stable.

## B1 requirements

- Exactly 5 looks.
- One shared `characterIdentityCardId`.
- UI must block invalid count/card mismatch before launch.
- Build canonical `WebB1LaunchRequest` only from real wizard state.

## C1 requirements

- Exactly 3 looks.
- Three unique `characterIdentityCardId` values.
- UI must block invalid count/duplicate-card mismatch before launch.
- Build canonical `WebC1LaunchRequest` only from real wizard state.

## Non-goals

- No fake success.
- No B1/C1 accepted backend launch until backend explicitly supports it.
- No paid provider calls.
- No billing semantics unless explicitly scoped.

## Product questions before implementation

- How should the current single-look production wizard represent multiple looks?
- Should B1/C1 use separate flows or extend `ActiveProductionFlow`?
- How should model/card selection UX differ for B1 vs C1?

## Acceptance criteria

- B1/C1 frontend can build canonical requests from real UI state.
- Invalid shapes surface structured blocked states.
- Existing helper checks remain green.

## Verification

```bash
npm run lint
npx tsx scripts/checkMultiLookLaunchDraft.ts
npm run build
git diff --check origin/main...HEAD
```
