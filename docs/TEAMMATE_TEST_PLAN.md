# ModaAI teammate test plan — D1 mock-safe web launch

## Purpose

Prepare a teammate-testable web flow for ModaAI without fake success, paid providers, or production deployment.

The first teammate test target is **D1/streetwear mock-safe** only.

## Current baseline

Merged frontend main includes:

- D1 canonical launch payload builder.
- Structured launch blocked-state UI.
- Pure B1/C1 multi-look helper with runtime cardinality guards.

Merged backend main includes:

- Canonical `/api/v1/web/launch` contract validation.
- D1/streetwear mock-safe `GenerationJob` queueing.
- B1/C1 blocked with canonical `launch_unavailable`.

## Test readiness gaps

Before handing to teammate, close these gaps:

1. D1 accepted/queued UX.
2. D1 result refresh/polling loop.
3. Mock completion/result behavior verified or implemented.
4. Teammate runbook and environment guardrails.

## Test scenario to support

1. Teammate starts backend in mock-safe mode.
2. Teammate starts frontend in HTTP API mode.
3. Teammate creates/selects the required D1 inputs.
4. Teammate launches D1.
5. Frontend shows either:
   - canonical accepted/queued response with job/result ids; or
   - canonical blocked response with clear error/details.
6. Frontend refreshes/polls result state honestly.

## Explicit non-goals for first teammate handoff

- No paid provider calls.
- No production deploy/restart.
- No B1/C1 accepted launch unless separately wired.
- No fake successful result.
- No hidden demo-mode fallback when HTTP mode is expected.

## Environment guardrails to add

Frontend should clearly show current API mode:

```text
API mode: demo | http
```

For backend-integrated teammate tests, `demo` mode must be visually obvious or blocked by a test-run warning.

## Suggested docs/runbook destination

Implemented runbook:

```text
docs/TEAMMATE_TEST_RUNBOOK.md
```

It includes:

- backend command;
- frontend command;
- env vars;
- auth/dev assumptions;
- D1 happy path;
- expected blocked cases;
- known limitations.
