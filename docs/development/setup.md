# Development Setup

This guide is the local engineering runbook for the optimizer. It covers the root environment file, database setup, verification commands, and API workflows used during development.

For the shortest path, use [Quick Start](quick-start.md). For environment variables, use [Environment Prerequisites](environment.md). For command reference, use [Operational Scripts](scripts.md).

## Prerequisites

- Node.js 24 or newer
- pnpm 11 or newer
- Docker
- HighLevel sandbox location with Voice AI enabled

## Local Bootstrap

```bash
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm --filter @agent-optimizer/api db:migrate:dev
pnpm dev
```

Default local URLs:

- API health: `http://localhost:3000/health`
- API docs: `http://localhost:3000/api/docs`
- Web dashboard: `http://localhost:5173`

## Environment Model

The monorepo uses one root `.env` file. See [Environment Prerequisites](environment.md) for the full variable table and security notes.

## Database Commands

```bash
pnpm docker:up
pnpm db:generate
pnpm --filter @agent-optimizer/api db:migrate:dev
DATABASE_URL=postgresql://optimizer:optimizer_dev@localhost:55432/agent_optimizer?schema=public pnpm --filter @agent-optimizer/api exec prisma validate
```

Prisma 7 reads the datasource URL from `apps/api/prisma.config.ts`, not from `schema.prisma`.

## API Workflows

Sync HighLevel location, agents, actions, and call logs:

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/integrations/highlevel/sync \
  --header 'content-type: application/json' \
  --data '{"locationId":"your_location_id"}'
```

Run transcript analysis:

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/analysis/agents/your_local_agent_id/run \
  --header 'x-correlation-id: local-analysis-test'
```

Read persisted analysis:

```bash
curl --request GET \
  --url http://localhost:3000/api/v1/analysis/agents/your_local_agent_id \
  --header 'x-correlation-id: local-analysis-read'
```

Run optimization:

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/optimization/agents/your_local_agent_id/run \
  --header 'x-correlation-id: local-optimization-test'
```

Read persisted generated tests, evaluations, and recommendations:

```bash
curl --request GET \
  --url http://localhost:3000/api/v1/optimization/agents/your_local_agent_id \
  --header 'x-correlation-id: local-optimization-read'
```

## Verification

```bash
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm lint
pnpm test:e2e
```

Playwright starts the Vite app and drives the dashboard through sync, analysis, and optimizer flows on desktop and mobile widths.

## Development Notes

- Use `rg` first for code search.
- Keep API feature boundaries under `apps/api/src/modules`.
- Keep shared contracts in `packages/contracts`.
- Keep pure optimizer logic in `packages/ai`.
- Do not put secrets in the Vue app; only `VITE_*` values are exposed client-side.
