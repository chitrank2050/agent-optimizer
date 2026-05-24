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

## Environment Notes

`DATABASE_URL` points at the local Docker PostgreSQL container on host port `55432` by default to avoid clashing with a developer's existing Postgres on `5432`. HighLevel and AI provider keys are intentionally empty in Phase 1 and should be filled only when Phase 2 and Phase 3 work begins.
