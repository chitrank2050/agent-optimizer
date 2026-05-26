<div align="center">
  <h1>Voice AI Agent Optimizer</h1>
  <p><strong>HighLevel Voice AI performance analysis, generated test cases, and evidence-linked optimization recommendations.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Posture-Principal_Grade-blueviolet?style=for-the-badge" alt="Posture">
    <img src="https://img.shields.io/badge/Frontend-Vue_3-42b883?style=for-the-badge" alt="Vue 3">
    <img src="https://img.shields.io/badge/API-NestJS-e0234e?style=for-the-badge" alt="NestJS">
    <img src="https://img.shields.io/badge/Monorepo-Turborepo-6366f1?style=for-the-badge" alt="Turborepo">
    <img src="https://img.shields.io/badge/Docs-MkDocs_Material-526cfe?style=for-the-badge" alt="MkDocs">
  </p>
</div>

---

## Documentation

Full guides live in [docs/](./docs) and are published with MkDocs:

- [**Documentation Portal**](./docs/index.md)
- [**Architecture**](./docs/architecture/overview.md)
- [**Development Setup**](./docs/development/setup.md)
- [**HighLevel Sandbox Setup**](./docs/highlevel-install.md)
- [**Deployment Guide**](./docs/deployment.md)
- [**Demo Script**](./docs/demo-script.md)
- [**QA and Scope**](./docs/qa-and-scope.md)

---

## Live Deployment

```text
┌────────────────────────────────────────────────────────────────────────────┐
│  Voice AI Agent Optimizer Review Deployment                                │
│                                                                            │
│  Dashboard: add Vercel URL after deploy                                    │
│  API Root:  add Render URL after deploy /api/v1                            │
│  API Docs:  add Render URL after deploy /api/docs                          │
│  Health:    add Render URL after deploy /api/v1/health                     │
│  Docs:      https://chitrank2050.github.io/agent-optimizer                 │
└────────────────────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> If the API is hosted on a free Render tier, the first request after inactivity can take 30-50 seconds.

---

## Architecture & Governance

The optimizer is a modular monolith plus embedded dashboard:

- **API (`apps/api`)**: NestJS modules for HighLevel sync, transcript analysis, generated tests, recommendations, Prisma, and health checks.
- **Web (`apps/web`)**: Vue 3 + Vite dashboard designed for HighLevel Marketplace Custom Page embedding.
- **AI Core (`packages/ai`)**: Deterministic transcript analyzer, pattern aggregator, test generator, evaluator, and recommendation engine.
- **Contracts (`packages/contracts`)**: Shared Zod schemas and TypeScript DTOs for API/web/AI boundaries.

> [!IMPORTANT]
> Recommendations are consent-gated. The system stores proposed prompt/config changes, but does not silently apply them to a live Voice AI agent.

---

## Shared Contract Governance

This monorepo uses `@agent-optimizer/contracts` as the shared boundary package.

> [!TIP]
> Keep API responses, dashboard types, and AI structured outputs synchronized through the contracts package. After changing shared schemas, run `pnpm build` from the repo root.

---

## Quick Start

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

---

## Operational Scripts

| Command             | Description                                          |
| :------------------ | :--------------------------------------------------- |
| `pnpm dev`          | Starts API and web apps in parallel watch mode.      |
| `pnpm build`        | Builds all apps and packages.                        |
| `pnpm typecheck`    | Runs strict TypeScript checks across the workspace.  |
| `pnpm test`         | Runs package and API tests.                          |
| `pnpm test:e2e`     | Runs Playwright dashboard QA.                        |
| `pnpm lint`         | Runs repository lint/type gates.                     |
| `pnpm format:check` | Checks code and docs formatting.                     |
| `pnpm docs:serve`   | Serves the MkDocs Material documentation locally.    |
| `pnpm docs:build`   | Builds the MkDocs site with strict link validation.  |
| `pnpm docker:up`    | Starts local PostgreSQL through Docker Compose.      |
| `pnpm docker:down`  | Stops local Docker services.                         |
| `pnpm db:generate`  | Regenerates the Prisma client.                       |
| `pnpm setup`        | Installs dependencies, generates Prisma, deploys DB. |

---

## Deployment

Recommended review deployment:

- PostgreSQL on Neon or Render
- API on Render
- Web dashboard on Vercel
- Docs on GitHub Pages
- HighLevel Marketplace Custom Page pointing to the deployed dashboard

See [docs/deployment.md](./docs/deployment.md) for exact environment variables and deployment settings.

---

<p align="center">
  Developed by <strong><a href="https://www.chitrankagnihotri.com">Chitrank Agnihotri</a></strong>
</p>
