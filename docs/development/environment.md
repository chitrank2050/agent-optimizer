# Environment Prerequisites

The optimizer uses one root `.env` file. The API loads and validates it at boot with Nest Config plus `class-validator`; the Vite dashboard reads browser-safe `VITE_*` values from the same root file.

Copy the example file:

```bash
cp .env.example .env
```

## Required Local Values

| Variable               | Description                            | Example                                                    |
| :--------------------- | :------------------------------------- | :--------------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string           | `postgresql://optimizer:optimizer_dev@localhost:55432/...` |
| `GHL_LOCATION_ID`      | HighLevel sandbox sub-account/location | `AXncyxV2i0xcXXV06w3x`                                     |
| `GHL_LOCATION_PIT`     | HighLevel location private token       | `pit-...`                                                  |
| `GHL_API_BASE_URL`     | LeadConnector API base URL             | `https://services.leadconnectorhq.com`                     |
| `GHL_API_VERSION`      | LeadConnector API version header       | `2021-07-28`                                               |
| `VITE_API_BASE_URL`    | Browser-facing API base URL            | `http://localhost:3000/api/v1`                             |
| `VITE_GHL_LOCATION_ID` | Browser-facing sandbox location ID     | `AXncyxV2i0xcXXV06w3x`                                     |

## Optional LLM Refinement

The optimizer runs without an LLM key. These values enable provider-neutral structured-output recommendation refinement:

| Variable            | Description                         | Example                                          |
| :------------------ | :---------------------------------- | :----------------------------------------------- |
| `LLM_API_KEY`       | Optional LLM provider key           | `provider-key`                                   |
| `LLM_MODEL`         | Optional LLM model name             | `provider-model`                                 |
| `LLM_RESPONSES_URL` | Optional structured-output endpoint | `https://your-llm-provider.example/v1/responses` |

## Sandbox Reference Values

`GHL_ACCOUNT_PIT` and `GHL_AGENT_ID` can be kept in `.env` for manual API checks, but runtime sync uses `GHL_LOCATION_PIT` and the dashboard location ID.

## Security Notes

- Keep `GHL_LOCATION_PIT`, `DATABASE_URL`, and `LLM_API_KEY` server-side.
- Only `VITE_*` values are exposed to the browser.
- Set `FRONTEND_ORIGIN` to the exact deployed web origin outside local development.
