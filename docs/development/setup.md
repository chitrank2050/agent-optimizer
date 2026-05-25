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

`DATABASE_URL` points at the local Docker PostgreSQL container on host port `55432` by default to avoid clashing with a developer's existing Postgres on `5432`. HighLevel keys are required for sandbox sync. AI provider keys are intentionally optional while Phase 3 uses the deterministic analyzer core.

## HighLevel Sandbox Setup

Use the sandbox location private integration token for Phase 2:

```bash
LOCATION_ID=your_location_id
LOCATION_PIT=pit-your-location-token
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28
```

The sync endpoint uses `LOCATION_PIT` first and falls back to `GHL_PRIVATE_INTEGRATION_TOKEN`.

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/integrations/highlevel/sync \
  --header 'content-type: application/json' \
  --data '{"locationId":"your_location_id"}'
```

## Transcript Analysis

After syncing a location with agents and call logs, run the Phase 3 analysis loop for a stored local agent ID:

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
