# Voice AI Agent Optimizer

Agent Optimizer is a HighLevel Voice AI companion app that turns call history into a repeatable improvement loop: transcript analysis, generated test scenarios, and AI-backed optimization recommendations.

This repository is a Turborepo monorepo for the home task implementation. The current build covers the foundation, HighLevel sandbox sync, and the first optimizer loop: transcript analysis.

## Architecture

```text
apps/
  api/        NestJS API, Prisma, health endpoint
  web/        Vue 3 + Vite embedded dashboard target
packages/
  ai/         Analyzer core, evaluator contracts, promptable AI boundary
  contracts/  Shared Zod schemas and TypeScript DTOs
```

The intended HighLevel integration path is a Marketplace Custom Page rendered inside HighLevel as an iframe. The local build uses the sandbox location private integration token while the marketplace signed user context is documented as the production integration path.

## Tech Stack

| Layer     | Choice                      | Reason                                                                        |
| --------- | --------------------------- | ----------------------------------------------------------------------------- |
| Monorepo  | Turborepo + pnpm workspaces | Fast local orchestration with explicit package boundaries                     |
| Backend   | NestJS                      | Modular server structure with clear dependency injection boundaries           |
| Frontend  | Vue 3 + Vite                | Matches the task brief and does not require SSR                               |
| Contracts | Zod                         | Runtime validation plus shared TypeScript types                               |
| AI Core   | TypeScript package          | Pure analysis logic that can run deterministically or behind an LLM adapter   |
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
- API docs: `http://localhost:3000/api/docs`
- Web app: `http://localhost:5173`

## Current Status

Functional:

- Turborepo workspace with `api`, `web`, and `contracts`
- Shared contract package with health, HighLevel context, transcript, test case, and recommendation schemas
- NestJS API with env validation, correlation IDs, Prisma lifecycle wiring, and `/api/v1/health`
- Swagger/OpenAPI documentation for owned API responses at `/api/docs`
- Vue/Vite dashboard shell with API health check
- PostgreSQL Docker Compose service with health checks and resource limits
- GitHub Actions CI for install, generate, typecheck, test, and build
- HighLevel Voice AI sync endpoint for location, agent config/actions, call logs, and transcript-like call payloads
- Transcript analysis contracts, deterministic analyzer core, recurring pattern aggregation, and focused tests
- Persisted transcript analysis results with normalized findings and `POST /api/v1/analysis/agents/:agentId/run`
- Vue dashboard action to run analysis for a synced agent and inspect scores, recurring issues, and missed criteria

Not implemented yet:

- HighLevel marketplace OAuth and signed user-context verification
- LLM-backed transcript analysis provider; Phase 3 currently uses the deterministic analyzer against the same structured contract
- Test generation
- Recommendation approval/apply flow

Sandbox findings:

- Location API works with the sandbox location PIT.
- Voice AI agent listing works with the sandbox location PIT.
- Voice AI call-log listing works with `pageSize`; the earlier `limit` parameter is rejected.
- Real phone calls require paid telephony/Stripe, but the agent supports limited web calls for generating call logs.
- The `FrontDoor AI` template prompt references custom values/contact fields that must exist in the location; the sync endpoint flags those variables for review.

## Quality Bar

This project follows the same posture as the Meterplex reference: typed boundaries, explicit data model, correlation IDs, local docs, runnable verification, and honest mocked-vs-real notes.
