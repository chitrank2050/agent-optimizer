# Voice AI Agent Optimizer

Agent Optimizer is a HighLevel Voice AI companion app that turns call history into a repeatable improvement loop: analyze transcripts, generate realistic tests, evaluate the current agent configuration, and propose evidence-linked optimizations.

The product is built for the HighLevel sandbox assignment as a Marketplace Custom Page backed by a NestJS API. It focuses on the workflow teams normally do by hand: review transcripts, identify failures, write test scenarios, tune prompts/configuration, and rerun evaluations.

> [!IMPORTANT]
> The optimizer proposes recommendations for review. It does not silently apply prompt, model, tool, action, or guardrail changes to a live Voice AI agent.

## What It Does

| Loop                     | Implementation                                                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Analyze past performance | Syncs HighLevel Voice AI agents and call logs, imports transcript-like payloads when available, scores transcripts, and groups recurring failures. |
| Generate test cases      | Builds happy-path and edge-case scenarios from the agent prompt plus observed transcript patterns.                                                 |
| Recommend optimizations  | Evaluates generated tests against the current prompt/tools and proposes before/after changes with evidence IDs.                                    |

The recommendation engine is deterministic by default for reliable demos and tests. If `LLM_API_KEY` and `LLM_RESPONSES_URL` are configured, the API can refine recommendations through a provider-neutral structured-output LLM endpoint.

## Architecture

```mermaid
flowchart LR
  ghl["HighLevel Sandbox"] --> page["Marketplace Custom Page"]
  page --> web["Vue 3 + Vite Dashboard"]
  web --> api["NestJS API"]
  api --> db["PostgreSQL + Prisma"]
  api --> ghlApi["HighLevel Voice AI APIs"]
  api --> ai["Deterministic AI Core"]
  ai -. optional .-> llm["Structured-output LLM"]
```

## Repository Layout

```text
apps/
  api/        NestJS modular monolith, Prisma schema, API tests
  web/        Vue 3 + Vite dashboard for HighLevel Custom Page embedding
packages/
  ai/         Transcript analyzer, test generator, evaluator, recommender
  contracts/  Shared Zod schemas and TypeScript API contracts
docs/
  architecture/
  deployment.md
  development/
```

## Technical Specification

| Layer          | Choice                                          | Reason                                                                                         |
| -------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Monorepo       | Turborepo + pnpm workspaces                     | Fast local orchestration with explicit package boundaries.                                     |
| Backend        | NestJS                                          | Clear feature modules, dependency injection, Swagger, and production-friendly lifecycle hooks. |
| Frontend       | Vue 3 + Vite                                    | Matches the assignment and fits iframe-based HighLevel Custom Pages.                           |
| Database       | PostgreSQL + Prisma 7                           | Durable tenant/location/agent/transcript/test/recommendation storage.                          |
| Contracts      | Zod + TypeScript                                | Runtime validation at vendor, AI, API, and UI boundaries.                                      |
| Env validation | Nest Config + class-validator                   | Boot-time failure for malformed configuration.                                                 |
| AI loop        | Deterministic TypeScript + optional LLM adapter | Stable evaluation with a provider-neutral path for model-backed refinement.                    |
| Tests          | Vitest + SWC, Playwright                        | Fast logic/API coverage plus desktop/mobile browser QA.                                        |

## Safeguards

- Recommendations are stored as `PROPOSED`; apply/approval is intentionally separated.
- HighLevel tokens stay server-side; the Vue dashboard calls the local API only.
- Vendor responses are parsed at the boundary before persistence.
- Transcript analysis stores normalized findings, criteria, scores, and evidence separately.
- LLM refinement sends normalized findings/tests/evaluations, not raw transcript turns.
- Correlation IDs are attached to API requests for traceability.

## Quick Start

Prerequisites:

- Node.js 24+
- pnpm 11+
- Docker

```bash
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm --filter @agent-optimizer/api db:migrate:dev
pnpm dev
```

Local URLs:

- API health: `http://localhost:3000/api/v1/health`
- API docs: `http://localhost:3000/api/docs`
- Web dashboard: `http://localhost:5173`

## Required Environment

The repo uses one root `.env` file.

```bash
DATABASE_URL="postgresql://optimizer:optimizer_dev@localhost:55432/agent_optimizer?schema=public"
GHL_LOCATION_ID=your_highlevel_location_id
GHL_LOCATION_PIT=pit-your-location-token
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_GHL_LOCATION_ID=your_highlevel_location_id
```

Optional LLM refinement:

```bash
LLM_API_KEY=provider-key
LLM_MODEL=provider-model
LLM_RESPONSES_URL=https://your-llm-provider.example/v1/responses
```

## HighLevel Sandbox Flow

1. Create or open a HighLevel sandbox agency.
2. Create a sub-account/location with Voice AI enabled.
3. Create a location private integration token with location and Voice AI access.
4. Add or use an existing Voice AI agent.
5. Generate call logs with web calls if paid telephony is unavailable.
6. Run the app and click `Sync HighLevel`.
7. Run analysis, then run the optimizer for the synced agent.

For iframe setup, see [HighLevel sandbox installation](docs/highlevel-install.md).

## API Workflow

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/integrations/highlevel/sync \
  --header 'content-type: application/json' \
  --data '{"locationId":"your_location_id"}'
```

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/analysis/agents/your_local_agent_id/run \
  --header 'x-correlation-id: local-analysis-test'
```

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/optimization/agents/your_local_agent_id/run \
  --header 'x-correlation-id: local-optimization-test'
```

## Deployment

Recommended review deployment:

- Database: Neon or Render PostgreSQL
- API: Render Web Service
- Web: Vercel static deployment
- HighLevel: Marketplace Custom Page pointing to the deployed web URL

Detailed deployment steps are in [Deployment Guide](docs/deployment.md).

## Verification

```bash
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm lint
pnpm test:e2e
DATABASE_URL=postgresql://optimizer:optimizer_dev@localhost:55432/agent_optimizer?schema=public pnpm --filter @agent-optimizer/api exec prisma validate
```

CI runs Prisma validation, Prisma client generation, typecheck, tests, and build on pull requests and pushes to `main`.

## Functional Scope

Functional:

- HighLevel location, Voice AI agent, action, and call-log sync.
- Transcript-like payload import when HighLevel returns transcript/messages in call logs.
- Persisted transcript analysis, recurring issue aggregation, generated tests, evaluations, and recommendations.
- Vue dashboard for sync, analysis, generated tests, evaluations, and before/after recommendations.
- Optional provider-neutral LLM recommendation refinement.

Documented boundaries:

- Sandbox phone calls may require paid telephony/Stripe; web calls are the practical demo path.
- Marketplace signed user context is documented as the production auth hardening path.
- Applying approved recommendations back to HighLevel is intentionally not automatic.

## Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [Development Setup](docs/development/setup.md)
- [Deployment Guide](docs/deployment.md)
- [HighLevel Sandbox Installation](docs/highlevel-install.md)
- [Demo Script](docs/demo-script.md)
- [QA and Scope Notes](docs/qa-and-scope.md)

## Team of One Ownership

- Product: focused on the complete customer loop from transcript evidence to recommended changes.
- Design: built a single embedded dashboard with sync, analysis, optimizer, loading, error, and empty states.
- Engineering: kept a modular monolith API, shared contracts, durable persistence, isolated vendor integration, and deterministic AI core.
- QA: added focused package tests, API tests, browser QA, Prisma validation, and manual review notes.
- Communication: documented local setup, sandbox integration, deployment, demo flow, and production boundaries.

<p align="center">
  Developed by <strong><a href="https://www.chitrankagnihotri.com">Chitrank Agnihotri</a></strong>
</p>
