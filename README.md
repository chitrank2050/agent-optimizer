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

Full guides live in [docs/](./docs) and are published with MkDocs at [chitrank2050.github.io/agent-optimizer](https://chitrank2050.github.io/agent-optimizer):

- [**Documentation Portal**](./docs/index.md) or [**Deployed Docs**](https://chitrank2050.github.io/agent-optimizer)
- [**Architecture**](./docs/architecture/overview.md)
- [**Development Setup**](./docs/development/setup.md)
- [**Environment Prerequisites**](./docs/development/environment.md)
- [**Operational Scripts**](./docs/development/scripts.md)
- [**Quick Start**](./docs/development/quick-start.md)
- [**HighLevel Sandbox Setup**](./docs/highlevel-install.md)
- [**Demo Script**](./docs/demo-script.md)
- [**QA and Scope**](./docs/qa-and-scope.md)

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

## Team Of One Ownership

This submission is scoped as a finished review product, not an open-ended prototype:

- **Product**: The workflow closes the loop from HighLevel transcripts to findings, generated tests, evaluations, and proposed optimizations.
- **Design**: The dashboard keeps sync status, transcript issues, test cases, and recommendations in one reviewer-friendly surface.
- **Engineering**: The backend uses modular NestJS boundaries, Prisma persistence, shared contracts, correlation IDs, and structured AI outputs.
- **QA**: Vitest covers the AI/API logic and Playwright verifies the dashboard flow across desktop and mobile.
- **Governance**: Recommendations are evidence-linked and consent-gated before any live agent change.

Functional scope and sandbox boundaries are documented in [QA and Scope](./docs/qa-and-scope.md).

---

## Shared Contract Governance

This monorepo uses `@agent-optimizer/contracts` as the shared boundary package.

> [!TIP]
> **Zero-Drift Enforcement**: API responses, dashboard types, and AI structured outputs must stay synchronized through the contracts package. After changing shared schemas, run `pnpm build` from the repo root.

---

## Documentation & CI/CD

This project uses **Material for MkDocs** for searchable documentation. CI and docs automation are intentionally separated:

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

<p align="center">
  Developed by <strong><a href="https://www.chitrankagnihotri.com">Chitrank Agnihotri</a></strong>
</p>
