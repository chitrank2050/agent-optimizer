<div align="center">
  <h1>Voice AI Agent Optimizer</h1>
  <p><strong>HighLevel Voice AI performance analysis, generated test cases, and evidence-linked optimization recommendations.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Posture-Principal_Grade-blueviolet?style=for-the-badge" alt="Posture">
    <img src="https://img.shields.io/badge/Safety-Consent_Gated-black?style=for-the-badge" alt="Safety">
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

- **Systems Grade (`apps/api`)**: NestJS modules for HighLevel sync, transcript analysis, generated tests, recommendations, Prisma, and health checks.
- **UX Grade (`apps/web`)**: Vue 3 + Vite dashboard designed for HighLevel Marketplace Custom Page embedding.
- **AI Core (`packages/ai`)**: Deterministic transcript analyzer, pattern aggregator, test generator, evaluator, and recommendation engine.
- **Contract Grade (`packages/contracts`)**: Shared Zod schemas and TypeScript DTOs for API/web/AI boundaries.

> [!IMPORTANT]
> **Consent Handshake**: Recommendations are stored as proposed changes. The system does not silently apply prompt, model, tool, action, or guardrail updates to a live Voice AI agent.

---

## Shared Contract Governance

This monorepo uses `@agent-optimizer/contracts` as the shared boundary package.

> [!TIP]
> **Zero-Drift Enforcement**: API responses, dashboard types, and AI structured outputs must stay synchronized through the contracts package. After changing shared schemas, run `pnpm build` from the repo root.

---

## Environment Prerequisites

Create a root `.env` file from [.env.example](./.env.example). Runtime config is intentionally centralized at the repository root.

| Variable               | Description                            | Example                                                    |
| :--------------------- | :------------------------------------- | :--------------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string           | `postgresql://optimizer:optimizer_dev@localhost:55432/...` |
| `GHL_LOCATION_ID`      | HighLevel sandbox sub-account/location | `AXncyxV2i0xcXXV06w3x`                                     |
| `GHL_LOCATION_PIT`     | HighLevel location private token       | `pit-...`                                                  |
| `GHL_API_BASE_URL`     | LeadConnector API base URL             | `https://services.leadconnectorhq.com`                     |
| `GHL_API_VERSION`      | LeadConnector API version header       | `2021-07-28`                                               |
| `VITE_API_BASE_URL`    | Browser-facing API base URL            | `http://localhost:3000/api/v1`                             |
| `VITE_GHL_LOCATION_ID` | Browser-facing sandbox location ID     | `AXncyxV2i0xcXXV06w3x`                                     |
| `LLM_API_KEY`          | Optional LLM provider key              | `provider-key`                                             |
| `LLM_MODEL`            | Optional LLM model name                | `provider-model`                                           |
| `LLM_RESPONSES_URL`    | Optional structured-output endpoint    | `https://your-llm-provider.example/v1/responses`           |

---

## Operational Scripts

### Core & Hygiene

| Command             | Description                                          |
| :------------------ | :--------------------------------------------------- |
| `pnpm setup`        | Installs dependencies, generates Prisma, deploys DB. |
| `pnpm dev`          | Starts API and web apps in parallel watch mode.      |
| `pnpm build`        | Builds all apps and packages.                        |
| `pnpm typecheck`    | Runs strict TypeScript checks across the workspace.  |
| `pnpm lint`         | Runs repository lint/type gates.                     |
| `pnpm format`       | Formats code and documentation.                      |
| `pnpm format:check` | Checks formatting without writing files.             |

### Testing

| Command         | Description                   |
| :-------------- | :---------------------------- |
| `pnpm test`     | Runs package and API tests.   |
| `pnpm test:e2e` | Runs Playwright dashboard QA. |

### Database & Infrastructure

| Command             | Description                                     |
| :------------------ | :---------------------------------------------- |
| `pnpm db:generate`  | Regenerates the Prisma client.                  |
| `pnpm db:reset:dev` | Destructive local Prisma reset.                 |
| `pnpm docker:up`    | Starts local PostgreSQL through Docker Compose. |
| `pnpm docker:down`  | Stops local Docker services.                    |

### Documentation

| Command           | Description                                       |
| :---------------- | :------------------------------------------------ |
| `pnpm docs:serve` | Serves the MkDocs Material documentation locally. |
| `pnpm docs:build` | Builds the MkDocs site with strict validation.    |

---

## Documentation & CI/CD

This project uses **Material for MkDocs** for searchable documentation. See [docs/deployment.md](./docs/deployment.md) for GitHub Pages setup and deployment settings.

- **Docs source**: [docs/](./docs)
- **MkDocs config**: [mkdocs.yml](./mkdocs.yml)
- **Docs workflow**: [.github/workflows/docs.yml](./.github/workflows/docs.yml)
- **CI workflow**: [.github/workflows/ci.yml](./.github/workflows/ci.yml)

---

## Automation Pipelines

| Workflow        | File                         | Purpose                                                            | Trigger                                 |
| :-------------- | :--------------------------- | :----------------------------------------------------------------- | :-------------------------------------- |
| **CI**          | `.github/workflows/ci.yml`   | Prisma validation, Prisma generation, typecheck, tests, and build. | Pull requests and pushes to `main`.     |
| **Docs Deploy** | `.github/workflows/docs.yml` | Builds MkDocs on PRs and deploys GitHub Pages from `main`.         | Docs/config changes or manual dispatch. |

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
