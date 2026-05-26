# QA and Scope Notes

This document separates functional behavior from sandbox or production boundaries. It is written for reviewers and maintainers who need to understand what is real, what is intentionally constrained, and how the project was verified.

## Functional

- HighLevel sandbox sync for location, Voice AI agents, agent prompt/config/actions, and call-log summaries.
- Transcript-like payload import when HighLevel call logs include `transcript` or `messages` arrays.
- Persisted transcript analysis with outcome, score, passed criteria, missed criteria, normalized findings, and recurring pattern aggregation.
- Generated happy-path and edge-case test cases with success criteria.
- Evaluation harness with pass/fail/risk status, score, failed criteria, and reasoning.
- Optimization recommendations for prompt, temperature, knowledge base, guardrails, and optional model/tool/action refinement through a structured-output LLM endpoint.
- Vue dashboard for sync, analysis, generated tests, evaluations, and before/after recommendations.
- Playwright browser QA across desktop and mobile dashboard viewports.

## Boundaries

- The baseline analyzer, test generator, evaluator, and recommendation engine are deterministic TypeScript logic in `packages/ai`.
- LLM recommendation refinement is optional and only runs when `LLM_API_KEY` and `LLM_RESPONSES_URL` are configured.
- Marketplace signed user context is documented as the production auth path, while sandbox review uses `GHL_LOCATION_PIT`.
- Applying recommendations back to HighLevel is not automatic.
- Real phone-call generation may require paid telephony/Stripe. Web calls are the recommended sandbox demo path.

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
- Deployment instructions keep server secrets out of the Vue app.
- Browser QA checks for console errors, horizontal overflow, and zero-size buttons.

## Demo Data Guidance

If HighLevel returns empty call logs, create short Voice AI web calls in the sandbox before recording the demo. The app will still sync the live agent configuration without call logs, but analysis and optimization need transcript rows to show the complete loop.
