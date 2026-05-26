# Quick Start

Use this path when you want the full optimizer running locally against Docker PostgreSQL and a HighLevel sandbox location.

## Prerequisites

- Node.js 24 or newer
- pnpm 11 or newer
- Docker
- HighLevel sandbox location with Voice AI enabled

## Bootstrap

```bash
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm --filter @agent-optimizer/api db:migrate:dev
pnpm dev
```

## Local URLs

- API health: `http://localhost:3000/health`
- API docs: `http://localhost:3000/api/docs`
- Web dashboard: `http://localhost:5173`

## Next Steps

1. Add HighLevel sandbox values to `.env`.
2. Open the dashboard.
3. Click `Sync HighLevel`.
4. Run analysis for a synced agent.
5. Run the optimizer to generate tests and recommendations.
