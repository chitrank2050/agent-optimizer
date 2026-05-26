# Demo Script

Target length: 2-5 minutes.

## Pre-Recording Checklist

- API is running locally or deployed.
- Web dashboard is running locally, deployed, or embedded in HighLevel.
- `VITE_GHL_LOCATION_ID` points to the sandbox location.
- At least one Voice AI agent is synced.
- At least one web-call transcript exists, or you are prepared to state that the sandbox has no call logs yet.

## Recording Flow

1. Open the optimizer dashboard inside HighLevel or from the deployed dashboard URL.
2. Show the health panel and the three-loop framing: analyze transcripts, generate tests, recommend fixes.
3. Click `Sync HighLevel`.
4. Show the synced Voice AI agent, actions, call-log count, and unresolved prompt variable warnings.
5. Click `Run analysis`.
6. Show transcript score, outcome, missed criteria, findings, and recurring patterns.
7. Click `Run optimizer`.
8. Show generated happy-path and edge-case tests with success criteria.
9. Show evaluation statuses and scores.
10. Show recommendations with target, evidence count, before text, after text, and reasoning.
11. Close with the governance boundary: recommendations are proposed for approval, not auto-applied.

## Talking Points

- The product removes repeated manual transcript review by converting calls into structured findings.
- Generated test cases make prompt quality measurable instead of opinion-based.
- Recommendations are evidence-linked to transcript IDs and generated test criteria.
- The HighLevel integration is real for location, Voice AI agents, actions, and call logs.
- The deterministic AI core keeps demos and tests repeatable; optional LLM refinement can improve recommendation copy and coverage.
- Applying changes to a live agent belongs behind a consent/approval workflow.

## Sandbox Caveat Script

Use this if call logs are empty:

```text
HighLevel sandbox telephony can require paid credits. This demo uses the same production sync path, and web-call transcripts are the intended sandbox data source. When call logs exist, the optimizer imports transcript-like payloads and runs the full analysis and recommendation loop.
```

## Browser QA

Browser QA is automated with Playwright:

```bash
pnpm test:e2e
```

The test drives the dashboard through sync, analysis, and optimizer actions on desktop and mobile widths. It checks for browser console errors, horizontal overflow, zero-size buttons, and saves full-page screenshots to `/tmp/agent-optimizer-desktop.png` and `/tmp/agent-optimizer-mobile.png`.
