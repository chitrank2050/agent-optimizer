# Voice AI Agent Optimizer Documentation

Welcome to the documentation portal for the HighLevel Voice AI Agent Optimizer.

This project turns Voice AI call history into a repeatable optimization loop: analyze transcripts, generate realistic tests, evaluate the current prompt/configuration, and propose evidence-linked improvements.

## Quick Links

| Section                                       | What you will find                                                                        |
| :-------------------------------------------- | :---------------------------------------------------------------------------------------- |
| [Architecture](architecture/overview.md)      | Product loop, system boundaries, module responsibilities, data model, and governance.     |
| [Development](development/setup.md)           | Local setup, environment model, database commands, API workflows, and verification.       |
| [Quick Start](development/quick-start.md)     | Fast local bootstrap and next steps.                                                      |
| [Environment](development/environment.md)     | Root `.env`, HighLevel sandbox keys, and optional LLM settings.                           |
| [Operational Scripts](development/scripts.md) | Root workspace commands for development, QA, DB, and docs.                                |
| [HighLevel Sandbox](highlevel-install.md)     | Marketplace Custom Page setup, sandbox tokens, reviewer flow, and production auth path.   |
| [Deployment](deployment.md)                   | Render API, Vercel web, managed PostgreSQL, HighLevel Custom Page, and deployment checks. |
| [Demo Script](demo-script.md)                 | Recording checklist, flow, talking points, and sandbox caveat script.                     |
| [QA and Scope](qa-and-scope.md)               | Functional behavior, boundaries, verification commands, and demo data guidance.           |

## Product Summary

The optimizer supports three loops:

1. **Analyze past performance** by syncing HighLevel Voice AI agents and transcript-like call payloads, then scoring calls against business criteria.
2. **Generate test cases** from the agent prompt and recurring transcript patterns, including happy-path and edge-case scenarios.
3. **Recommend optimizations** with before/after reasoning, evidence IDs, and proposed changes for prompts, temperature, knowledge base, guardrails, and optional model/tool/action refinement.

## Safety Model

Recommendations are proposed for review. The app does not silently mutate live Voice AI agents.

Sensitive values stay server-side:

- HighLevel private integration token
- PostgreSQL connection string
- Optional LLM credentials

The Vue dashboard receives only public `VITE_*` configuration and calls the API for every sensitive operation.

## Local Start

Use [Quick Start](development/quick-start.md) for the local bootstrap path, [Environment](development/environment.md) for required variables, and [Operational Scripts](development/scripts.md) for command reference.

## Documentation Commands

```bash
python3 -m venv .venv-docs
source .venv-docs/bin/activate
python -m pip install -r requirements.txt
mkdocs serve
mkdocs build --strict
```

The GitHub Actions docs workflow builds the site on pull requests and deploys to GitHub Pages from `main`.
