# QA and Scope Notes

## Product Scope

- Monorepo foundation with NestJS API, Vue 3/Vite web app, shared contracts, Prisma, and PostgreSQL.
- Vitest unit/integration tests configured with SWC transforms for the API and AI package.
- API health endpoint with correlation IDs.
- Swagger documentation for owned API responses.
- HighLevel sandbox sync for:
  - location record
  - Voice AI agents
  - agent prompt/config/actions
  - call-log listing
  - transcript-like call payload import when HighLevel returns messages/transcript content
- Persisted transcript analysis:
  - outcome
  - score
  - passed/missed criteria
  - normalized findings
  - recurring pattern aggregation
- Generated test cases:
  - happy path
  - edge cases from observed patterns
  - success criteria
- Test evaluation harness:
  - pass/fail/risk status
  - score
  - failed criteria
  - reasoning
- Optimization recommendations:
  - prompt updates
  - temperature suggestions
  - model/tool/action suggestions through optional LLM refinement
  - knowledge-base suggestions
  - guardrail suggestions
  - before/after reasoning
  - evidence IDs
  - proposed status
- Vue dashboard for sync, analysis, generated tests, evaluations, and recommendations.
- Playwright browser QA for the dashboard flow on desktop and mobile viewports.

## Production Boundaries

- The analyzer, test generator, evaluator, and baseline recommendation engine are deterministic TypeScript logic in `packages/ai`.
- LLM recommendation refinement is functional when `LLM_API_KEY` is configured. It uses structured JSON output and sends normalized findings/tests/evaluations rather than raw transcript turns.
- HighLevel Marketplace signed user context is documented as the production auth path.
- Applying recommendations back to HighLevel is not automatic.
- `PATCH /voice-ai/agents/:agentId` belongs behind an approval flow to avoid unsafe live-agent changes.
- Real phone-call generation may require paid telephony/Stripe in the sandbox. The project supports web-call or seeded transcript workflows for demo data.

## Verification Commands

```bash
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm lint
DATABASE_URL=postgresql://optimizer:optimizer_dev@localhost:55432/agent_optimizer?schema=public pnpm --filter @agent-optimizer/api exec prisma validate
```

## Manual Review Checklist

- Contracts are shared between API and web.
- Vendor/API payloads are parsed at the boundary.
- Prisma migrations are versioned and committed.
- Multi-step persistence uses transactions.
- Recommendations are proposed, not silently applied.
- UI has loading, error, and empty states for sync, analysis, and optimization.
- README and docs state the product scope and production boundaries.
- Browser screenshots render correctly on desktop and mobile without horizontal overflow.
