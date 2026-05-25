# Demo Script

Target length: 2-5 minutes.

## Setup

- API running on `http://localhost:3000`.
- Web app running on `http://localhost:5173`.
- HighLevel sandbox location ID configured in `.env`.
- At least one synced Voice AI agent.
- If real call logs are unavailable, use short web-call transcripts or seeded transcript rows and state that clearly during the demo.

## Recording Flow

1. Open the optimizer dashboard.
2. Show API status and the three-loop product framing: analyze transcripts, generate tests, recommend fixes.
3. Click `Sync HighLevel`.
4. Show the synced `FrontDoor AI` agent, its actions, and unresolved prompt variable count.
5. Click `Run analysis`.
6. Show the analysis cards:
   - average score
   - failures
   - recurring patterns
   - missed criteria per transcript
7. Click `Run optimizer`.
8. Show generated happy-path and edge-case tests with success criteria.
9. Show evaluation statuses and scores.
10. Show recommendations with:
    - target type
    - evidence count
    - before text
    - after text
    - reasoning
11. Close by stating the governance boundary: recommendations are proposed, not auto-applied to a live Voice AI agent.

## Talking Points

- The optimizer turns transcript review into a repeatable loop.
- The data model keeps tenant, location, agent, transcript, analysis, tests, evaluations, and recommendations separate.
- Contracts are shared between API and web, with Zod validation at external/AI boundaries.
- The current AI loop is deterministic for stable review and tests; an LLM provider can replace the generator/judge while emitting the same contracts.
- HighLevel API integration is real for location, Voice AI agents, call logs, and agent config sync.
- Applying prompt/config changes back to HighLevel is intentionally behind an approval step.

## Browser QA Note

Browser screenshot automation was not available in the current coding session. Before final recording, run a browser pass across desktop and mobile widths and verify:

- no overlapping dashboard text
- buttons remain usable on narrow screens
- generated recommendations scroll inside their before/after boxes
- empty states are visible when no transcripts or optimization runs exist
