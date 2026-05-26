# Voice AI Agent Optimizer

HighLevel Voice AI companion app for turning call transcripts into a repeatable optimization loop: analyze past performance, generate realistic test cases, and propose evidence-linked prompt/configuration improvements.

> [!IMPORTANT]
> Recommendations are proposed for review. The app does not silently apply changes to a live Voice AI agent.

## Product Loop

| Loop     | What happens                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| Analyze  | Sync HighLevel Voice AI agents and call logs, import transcript-like payloads, score calls, and group recurring failures. |
| Test     | Generate happy-path and edge-case scenarios from the agent prompt plus transcript patterns.                               |
| Optimize | Evaluate the current prompt/tools and propose before/after recommendations with evidence IDs.                             |

## Stack

- **API:** NestJS, Prisma 7, PostgreSQL
- **Web:** Vue 3, Vite, Tailwind CSS
- **Workspace:** Turborepo, pnpm workspaces
- **Contracts:** Shared Zod schemas and TypeScript types
- **AI loop:** Deterministic TypeScript core with optional provider-neutral LLM refinement
- **Docs:** MkDocs Material

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

## Documentation

Full docs live in `docs/` and are published with MkDocs.

- [Documentation Portal](docs/index.md)
- [Architecture](docs/architecture/overview.md)
- [Development Setup](docs/development/setup.md)
- [HighLevel Sandbox Setup](docs/highlevel-install.md)
- [Deployment Guide](docs/deployment.md)
- [Demo Script](docs/demo-script.md)
- [QA and Scope](docs/qa-and-scope.md)

Docs commands:

```bash
python3 -m venv .venv-docs
source .venv-docs/bin/activate
python -m pip install -r requirements.txt
mkdocs serve
mkdocs build --strict
```

## Verification

```bash
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm lint
pnpm test:e2e
pnpm docs:build
```

## Deployment

Recommended review deployment:

- PostgreSQL on Neon or Render
- API on Render
- Web dashboard on Vercel
- Docs on GitHub Pages
- HighLevel Marketplace Custom Page pointing to the deployed dashboard

See [docs/deployment.md](docs/deployment.md) for exact environment variables and deploy settings.

<p align="center">
  Developed by <strong><a href="https://www.chitrankagnihotri.com">Chitrank Agnihotri</a></strong>
</p>
