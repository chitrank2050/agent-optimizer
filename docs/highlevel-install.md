# HighLevel Sandbox Installation

This project is designed to run inside a HighLevel account as a Marketplace Custom Page. For local review, run the API and web app locally, then point the Custom Page iframe to the deployed or tunnelled web URL.

## Sandbox Requirements

- HighLevel sandbox agency account.
- Sub-account/location with Voice AI enabled.
- Location private integration token with Voice AI and location read scopes.
- At least one Voice AI agent in the location.
- Call logs with transcript-like payloads. If paid telephony is blocked, use the Voice AI web-call option to create short test calls.

## Local Environment

Set these values in `.env`:

```bash
LOCATION_ID=your_highlevel_location_id
LOCATION_PIT=pit-your-location-token
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28
GHL_PRIVATE_INTEGRATION_TOKEN=pit-your-location-token
```

For the web app:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_GHL_LOCATION_ID=your_highlevel_location_id
```

Start locally:

```bash
pnpm docker:up
pnpm db:generate
pnpm --filter @agent-optimizer/api db:migrate:dev
pnpm dev
```

## Custom Page Setup

1. Open the HighLevel Marketplace developer dashboard.
2. Create or open the Agent Optimizer marketplace app.
3. Add a Custom Page for the sub-account distribution target.
4. Set the page URL to the hosted Vue app URL.
5. During local testing, expose `http://localhost:5173` through a secure tunnel and use that HTTPS URL.
6. Install the app into the sandbox sub-account.
7. Open the Custom Page inside HighLevel and verify the dashboard loads.

## Reviewer Flow

1. Click `Sync HighLevel`.
2. Confirm the synced agent appears with actions and unresolved prompt variables.
3. Click `Run analysis`.
4. Review transcript scores, recurring issues, and missed criteria.
5. Click `Run optimizer`.
6. Review generated test cases, evaluation status, and proposed before/after recommendations.

## Production Auth Path

The current sandbox implementation uses a location private integration token for API access. The intended marketplace production path is:

- HighLevel Custom Page renders the Vue app in an iframe.
- HighLevel signed user context is sent to the backend.
- Backend validates/decrypts the signed context with `GHL_APP_SHARED_SECRET`.
- Backend maps the HighLevel company/location to local tenant/location records.
- API calls use OAuth/private integration credentials scoped to the installed customer account.

This is documented as the production integration path but not fully wired in the local home-task build.
