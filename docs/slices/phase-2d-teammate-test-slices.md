# Phase 2D — teammate-ready frontend test slices

## Goal

Bring the current ModaAI web-launch integration to a state where Roman can hand it to a teammate for a real manual test without verbal “magic here” explanations.

The immediate target is **D1/streetwear mock-safe frontend + backend flow**:

1. launch from the real frontend UI;
2. hit the real backend HTTP launch endpoint;
3. receive and render canonical accepted/blocked states;
4. observe queued/progress/result state honestly;
5. keep B1/C1 unavailable unless their UX/data model is explicitly wired.

## Current merged baseline

### Frontend `ModaAi` main

- D1 canonical launch payload builder.
- Structured canonical blocked-state UI.
- Pure B1/C1 multi-look helper with runtime cardinality guards.
- No B1/C1 production wizard wiring yet.

### Backend `ai-fashion-content-generation-telegram-bot` main

- `/api/v1/web/launch` canonical validation.
- Mock-safe D1/streetwear launch queues a real `GenerationJob`.
- Accepted response is canonical `ok:true` with `requestId`, `jobId`, `resultId`, `status`, and `workspace`.
- No provider/orchestrator calls in the web launch path.
- No credit reserve/spend in the mock-safe queue slice.
- B1/C1 remain blocked.

## Reality check

The current state is good engineering progress, but it is not yet teammate-ready for a full frontend manual test loop because:

- frontend D1 launch still needs a post-launch UX loop;
- teammate needs runbook/env clarity;
- we must verify whether queued mock jobs become observable/completed in a way the frontend can show;
- B1/C1 helper exists, but UI/data-model wiring does not.

---

## Slice P0.1 — D1 launch accepted/queued UX

### Goal

After successful `POST /api/v1/web/launch`, frontend shows an explicit accepted/queued state instead of relying on implicit workspace side effects.

### Scope

- Render accepted launch state in-app.
- Show:
  - `requestId`
  - `jobId`
  - `resultId`
  - `status`
- Associate the accepted launch with workspace/results view.
- Keep blocked responses on the existing structured blocked-state path.

### Success criteria

- User can launch D1 and immediately see canonical accepted state.
- User can distinguish:
  - blocked response;
  - accepted/queued response.
- No raw `alert()` for launch state.
- No fake completion.

### Out of scope

- Worker execution semantics.
- B1/C1 wizard UX.
- Billing/credit semantics.
- Paid/live provider calls.

---

## Slice P0.2 — D1 result refresh / polling loop

### Goal

After `queued`, frontend can refresh workspace/results so a teammate can observe progression or an honest persistent queued state.

### Scope

- Add polling or explicit refresh after accepted launch.
- Refresh relevant workspace/result state.
- Stop polling on a stable terminal state if one exists.
- If backend remains queued-only, show an honest “queued in backend” state.

### Questions to answer

- Which existing API path reflects job/result progress: workspace, results endpoint, or both?
- Does mock mode transition the job automatically?
- If not, is persistent `queued` acceptable for the first teammate test, or do we need P0.3 first?

### Success criteria

- Teammate can see a meaningful post-launch state transition or a clear persistent queued state.
- No fake completion.

---

## Slice P0.3 — Verify / add mock-safe completion path

### Goal

Determine whether a usable mock completion path already exists. If not, add the smallest mock-safe backend slice that makes queued D1 testable end-to-end.

### Scope

- Inspect backend mock job lifecycle.
- Determine whether queued D1 jobs:
  - remain pending forever;
  - become completed via existing background mechanism;
  - need explicit mock worker/completion support.
- If needed, add a tiny backend mock-safe completion path.

### Success criteria

One of:

1. existing mock completion path is verified and documented; or
2. minimal new mock-safe completion path exists and is verified.

### Hard constraints

- No paid providers.
- No production deploy/restart.
- No `.env` secret editing.
- No accidental live execution.

---

## Slice P0.4 — Teammate test runbook + env guardrails

### Goal

Create a test handoff that a teammate can follow without asking “which mode am I in?” or “what do I click next?”

### Scope

- Add or refresh teammate-facing test docs.
- Define required frontend env.
- Define required backend mock-safe env.
- Describe D1 test scenario.
- Add explicit frontend mode visibility:
  - `demo`
  - `http`
- Prefer fail-fast or clear warning if teammate is in demo mode when backend test is intended.

### Minimum runbook content

- Backend start command.
- Frontend start command.
- Required env vars.
- Login/auth/dev assumptions.
- D1 expected happy path.
- Expected blocked cases.
- Known limitations:
  - B1/C1 not wired;
  - paid/live modes blocked.

### Implementation note

Runbook destination:

```text
docs/TEAMMATE_TEST_RUNBOOK.md
```

Frontend must show the visible `API mode: demo | http` banner while testing.

### Success criteria

- Teammate can run the app without asking which API mode is active.
- Teammate can follow one D1 scenario end-to-end.

---

## Slice P1.1 — B1 wizard wiring

### Goal

Wire the existing multi-look helper to real B1 UI state.

### Required UX/data model

- 5 looks.
- 1 shared `characterIdentityCardId`.
- Clear blocked states before submit.

### Success criteria

- Frontend can build B1 canonical request from real wizard state.
- Invalid count/shared-card mismatch is blocked in UI before submit.
- No fake success.

### Blockers / owner decisions

- Exact B1 UX state ownership.
- How user selects 5 looks in the current wizard model.

---

## Slice P1.2 — C1 wizard wiring

### Goal

Wire the existing multi-look helper to real C1 UI state.

### Required UX/data model

- 3 looks.
- 3 unique `characterIdentityCardId` values.

### Success criteria

- Frontend can build C1 canonical request from real wizard state.
- Invalid count/duplicate-card mismatch is blocked in UI.
- No fake success.

---

## Slice P1.3 — Mapping parity for frontend-only selections

### Goal

Resolve frontend-only selections — scene, pose, video labels — into one of:

- backend-native ids;
- explicit unsupported mappings;
- new canonical contract fields.

### Success criteria

- No silent drop of meaningful selections.
- Unsupported mappings are shown honestly.
- Contract remains canonical.

---

## Slice P1.4 — Billing / credits semantics

### Goal

Define the real launch-time billing contract.

### Questions

- When reserve?
- When spend?
- When release?
- What happens on failure/cancel?
- Should mock-safe teammate flow remain zero-spend?

### Note

This is not required for immediate teammate D1 mock-safe testing if the explicit expectation remains “no reserve/spend in mock-safe mode”.

---

## Recommended execution order

1. P0.1 — D1 accepted/queued UX.
2. P0.2 — D1 result refresh/polling.
3. P0.3 — verify or implement mock completion path.
4. P0.4 — teammate runbook + env guardrails.
5. P1.1 — B1 wizard wiring.
6. P1.2 — C1 wizard wiring.
7. P1.3 — mapping parity for frontend-only selections.
8. P1.4 — billing/credits semantics.

## Definition of teammate-ready

We can hand the build to a teammate when all are true:

- D1 launch works from real frontend UI against backend HTTP mode.
- Accepted/blocked launch states are understandable in-app.
- Teammate can observe queued/progress/completion honestly.
- Teammate has a runbook with env/setup steps.
- App clearly indicates demo/http mode.
- B1/C1 are either wired or explicitly marked unavailable.
- No fake success.
- No paid-provider calls.
- No production deploy/restart.
