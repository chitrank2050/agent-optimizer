# Architecture Overview

## Product Loop

The optimizer closes three loops for a HighLevel Voice AI agent:

1. Analyze past call transcripts.
2. Generate realistic happy-path and edge-case tests.
3. Recommend prompt, model, temperature, tool, action, knowledge base, or guardrail changes.

Recommendations are proposed first. Applying changes to HighLevel is intentionally separated behind an approval step because prompt/config changes affect live customer conversations.

## System Boundaries

```text
HighLevel Custom Page
        |
        v
Vue Web App  --->  NestJS API  --->  PostgreSQL
                        |
                        v
                 HighLevel + AI APIs
```

Phase 1 builds the local web/API/database foundation. Phase 2 adds HighLevel identity and transcript ingestion. Phase 3 and Phase 4 add AI analysis, generated tests, and recommendation workflows.

## Data Model

The Prisma schema starts with durable entities that later phases can extend:

- `Tenant`: HighLevel agency/company context.
- `Location`: HighLevel sub-account context.
- `Agent`: Voice AI agent prompt/config snapshot.
- `Transcript`: call transcript payload and metadata.
- `TranscriptFinding`: normalized failures or missed opportunities.
- `GeneratedTestCase`: generated scenario and success criteria.
- `Recommendation`: proposed optimization with before/after reasoning and evidence.

This avoids rebuilding storage once real transcript ingestion starts.
