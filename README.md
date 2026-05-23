# Voice AI Agent Optimizer

Agent Optimizer is a HighLevel Voice AI companion app that turns call history into a repeatable improvement loop: transcript analysis, generated test scenarios, and AI-backed optimization recommendations.

This repository is a Turborepo monorepo for the home task implementation. Phase 1 establishes the foundation; HighLevel integration and AI loops land in later phases.

## Architecture

```text
apps/
  api/        NestJS API, Prisma, health endpoint
  web/        Vue 3 + Vite embedded dashboard target
packages/
  contracts/  Shared Zod schemas and TypeScript DTOs
```

The intended HighLevel integration path is a Marketplace Custom Page rendered inside HighLevel as an iframe. Signed HighLevel user context and Voice AI APIs will be wired in Phase 2.

## Tech Stack

| Layer     | Choice                      | Reason                                                                        |
| --------- | --------------------------- | ----------------------------------------------------------------------------- |
| Monorepo  | Turborepo + pnpm workspaces | Fast local orchestration with explicit package boundaries                     |
| Backend   | NestJS                      | Modular server structure with clear dependency injection boundaries           |
| Frontend  | Vue 3 + Vite                | Matches the task brief and does not require SSR                               |
| Contracts | Zod                         | Runtime validation plus shared TypeScript types                               |
| Database  | PostgreSQL + Prisma         | Durable storage for agents, transcripts, findings, tests, and recommendations |

## Quick Start

```bash
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm --filter @agent-optimizer/api db:migrate:dev
pnpm dev
```

Default local URLs:

- API health: `http://localhost:3000/api/v1/health`
- Web app: `http://localhost:5173`

## Phase 1 Status

Functional:

- Turborepo workspace with `api`, `web`, and `contracts`
- Shared contract package with health, HighLevel context, transcript, test case, and recommendation schemas
- NestJS API with env validation, correlation IDs, Prisma lifecycle wiring, and `/api/v1/health`
- Vue/Vite dashboard shell with API health check
- PostgreSQL Docker Compose service with health checks and resource limits
- GitHub Actions CI for install, generate, typecheck, test, and build

Not implemented yet:

- HighLevel OAuth/private integration setup
- Voice AI transcript ingestion
- AI transcript analysis
- Test generation
- Recommendation approval/apply flow

## Quality Bar

This project follows the same posture as the Meterplex reference: typed boundaries, explicit data model, correlation IDs, local docs, runnable verification, and honest mocked-vs-real notes.
