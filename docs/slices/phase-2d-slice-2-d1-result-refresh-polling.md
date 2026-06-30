# Phase 2D Slice 2 — D1 result refresh / polling

## Goal

After D1 launch is accepted, refresh or poll backend state so the teammate can observe the job/result honestly.

## Scope

- Determine whether workspace/results endpoints expose useful queued/completed state.
- Add polling or explicit refresh after accepted launch.
- Stop polling on terminal states if available.
- Show persistent queued state honestly if backend does not complete jobs yet.

## Non-goals

- No fake successful result.
- No provider/orchestrator execution.
- No paid provider calls.
- No B1/C1 wiring.

## Acceptance criteria

- After launch, frontend updates visible state from backend.
- User sees either progress/completion or a clear queued/pending state.
- Polling has safe interval and cleanup.

## Verification

```bash
npm run lint
npm run build
git diff --check origin/main...HEAD
```

If backend checks are needed:

```bash
FASHION_BOT_PROVIDER_MODE=mock FASHION_BOT_ALLOW_PAID_GENERATION=false python -m pytest -q tests/unit/api/test_miniapp.py tests/unit/domain/test_web_launch_contract.py
```
