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
pnpm typecheck
pnpm test
pnpm build
```

Default local URLs:

- API health: `http://localhost:3000/api/v1/health`
- API docs: `http://localhost:3000/api/docs`
- Web app: `http://localhost:5173`

## Environment Notes

`DATABASE_URL` points at the local Docker PostgreSQL container on host port `55432` by default to avoid clashing with a developer's existing Postgres on `5432`. HighLevel and AI provider keys are intentionally empty in Phase 1 and should be filled only when Phase 2 and Phase 3 work begins.

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
