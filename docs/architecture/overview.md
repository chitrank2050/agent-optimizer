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

## Phase 2 Integration Path

The HighLevel adapter uses the sandbox location private integration token to:

- Fetch the active location.
- Fetch Voice AI agents for that location.
- Store agent prompt/config/actions in PostgreSQL.
- List Voice AI call logs with `pageSize` pagination.
- Import transcript-like call payloads when HighLevel includes transcript/messages in call-log responses.

If a sandbox has no call logs yet, the optimizer still syncs live agent configuration and shows an empty-call-log onboarding state. This matches the sandbox constraint where paid telephony may be required for phone calls, while web calls can be used for short test calls.

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
