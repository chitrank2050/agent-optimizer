# Development Setup

## Prerequisites

- Node.js 24 or newer
- pnpm 11 or newer
- Docker

## Local Setup

```bash
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm --filter @agent-optimizer/api db:migrate:dev
pnpm dev
```

## Verification

```bash
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm lint
```

Default local URLs:

- API health: `http://localhost:3000/api/v1/health`
- API docs: `http://localhost:3000/api/docs`
- Web app: `http://localhost:5173`

## Environment Notes

The monorepo uses one root `.env` file. The API config module resolves that file explicitly and validates it at boot with Nest Config plus `class-validator`.

`DATABASE_URL` points at the local Docker PostgreSQL container on host port `55432` by default to avoid clashing with a developer's existing Postgres on `5432`. HighLevel keys are required for sandbox sync. LLM keys are optional because the optimizer ships with deterministic analyzer, test-generation, and recommendation logic, then refines recommendations through structured outputs when `LLM_API_KEY` is present.

## HighLevel Sandbox Setup

Use the sandbox location private integration token:

```bash
GHL_LOCATION_ID=your_location_id
GHL_LOCATION_PIT=pit-your-location-token
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_GHL_LOCATION_ID=your_location_id
```

The API uses `GHL_LOCATION_PIT` for HighLevel requests. The web dashboard uses `VITE_GHL_LOCATION_ID` to tell the sync endpoint which location to import.

Optional LLM recommendation refinement:

```bash
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4.1-mini
LLM_RESPONSES_URL=https://your-llm-provider.example/v1/responses
```

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/integrations/highlevel/sync \
  --header 'content-type: application/json' \
  --data '{"locationId":"your_location_id"}'
```

## Transcript Analysis

After syncing a location with agents and call logs, run transcript analysis for a stored local agent ID:

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/analysis/agents/your_local_agent_id/run \
  --header 'x-correlation-id: local-analysis-test'
```

Read the persisted analysis results without rerunning the analyzer:

```bash
curl --request GET \
  --url http://localhost:3000/api/v1/analysis/agents/your_local_agent_id \
  --header 'x-correlation-id: local-analysis-read'
```

The Vue dashboard exposes the same flow: sync the HighLevel location, click `Run analysis` on a synced agent, then review recurring issues and missed criteria.

## Optimization Loop

Run the full optimization loop for a stored local agent ID:

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/optimization/agents/your_local_agent_id/run \
  --header 'x-correlation-id: local-optimization-test'
```

Read persisted generated tests, evaluations, and recommendations without rerunning:

```bash
curl --request GET \
  --url http://localhost:3000/api/v1/optimization/agents/your_local_agent_id \
  --header 'x-correlation-id: local-optimization-read'
```

The dashboard exposes this through `Run optimizer`. It reruns transcript analysis, generates happy-path and edge-case tests, evaluates the current agent configuration, and proposes changes without applying them to HighLevel.
