# Next session prompt — ModaAI Phase 2D teammate-ready frontend

Copy/paste this into the next Hermes session.

```text
Продолжаем ModaAI / AI Fashion web launch integration.

Use these skills first:
- software-development/roman-development-pipeline
- software-development/ai-fashion-team-project

Repos:
- frontend: /home/roman/projects/ModaAi
- backend: /home/roman/projects/ai-fashion-content-generation-telegram-bot

Read first:
1. /home/roman/projects/ModaAi/docs/slices/phase-2d-teammate-test-slices.md
2. /home/roman/projects/ModaAi/docs/TEAMMATE_TEST_PLAN.md
3. backend .ai state:
   - /home/roman/projects/ai-fashion-content-generation-telegram-bot/.ai/queue-current.md
   - /home/roman/projects/ai-fashion-content-generation-telegram-bot/.ai/handoff.md
   - /home/roman/projects/ai-fashion-content-generation-telegram-bot/.ai/progress.md

Current merged baseline:
- Frontend main has:
  - D1 canonical launch payload builder
  - structured canonical blocked-state UI
  - pure B1/C1 multi-look helper with runtime cardinality guards
- Backend main has:
  - canonical /api/v1/web/launch validation
  - D1/streetwear mock-safe GenerationJob queueing
  - B1/C1 still blocked
  - no credit reserve/spend in mock-safe queue slice
  - no provider/orchestrator execution in web launch path

Mission:
Make the frontend teammate-testable for D1 mock-safe HTTP backend mode.

Active task list:
- [ ] p0-1-d1-accepted-ui. Render D1 launch accepted/queued state in-app with requestId/jobId/resultId/status.
- [ ] p0-2-d1-refresh-loop. Add result/workspace refresh or polling after accepted launch.
- [ ] p0-3-mock-completion-check. Verify whether backend mock queued jobs complete or remain pending; implement minimal mock-safe completion only if needed.
- [ ] p0-4-teammate-runbook-env-guard. Add teammate runbook and visible API mode/env guardrails.
- [ ] p1-1-b1-ui-wiring. Wire B1 wizard only after P0 and explicit scope confirmation.
- [ ] p1-2-c1-ui-wiring. Wire C1 wizard only after P0 and explicit scope confirmation.

Owner constraints / hard rules:
- Mock-safe only.
- No paid provider calls.
- No production deploy/restart.
- No .env secret edits.
- No fake success.
- No hidden demo fallback as substitute for HTTP backend path.
- B1/C1 full parity remains target, but D1 teammate-ready is first deliverable.
- Do not mark a slice complete without objective verification.
- For code slices: independent review before merge.
- Timeout is not approval.
- If a stacked PR conflicts, create clean replacement from origin/main; do not force-merge stale branches.

Recommended first slice:
P0.1 — D1 accepted/queued UI.

Start actions:
1. Verify live git state in both repos.
2. Inspect frontend launch success path around modaApi.launchProduction and canonical accepted response handling.
3. Inspect backend accepted response shape from /api/v1/web/launch.
4. Implement the smallest D1 accepted/queued UI state, keeping blocked-state UI intact.
5. Run:
   - npm run lint
   - npx tsx scripts/checkCanonicalLaunch.ts
   - npx tsx scripts/checkMultiLookLaunchDraft.ts
   - npm run build
   - git diff --check origin/main...HEAD
6. Push branch, open PR, request independent review.
7. After APPROVE, merge and continue to P0.2.

Stop conditions:
- Need paid provider/live production mode.
- Need secret not already available.
- Backend endpoint cannot be run/verified locally after reasonable attempts.
- Timebox 90 minutes on a single stuck slice.
- User product decision needed for B1/C1 UX or billing semantics.
```
