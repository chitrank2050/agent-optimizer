# Operational Scripts

Root scripts are defined in `package.json` and orchestrated through pnpm workspaces plus Turborepo.

## Core & Hygiene

| Command             | Description                                          |
| :------------------ | :--------------------------------------------------- |
| `pnpm setup`        | Installs dependencies, generates Prisma, deploys DB. |
| `pnpm dev`          | Starts API and web apps in parallel watch mode.      |
| `pnpm build`        | Builds all apps and packages.                        |
| `pnpm typecheck`    | Runs strict TypeScript checks across the workspace.  |
| `pnpm lint`         | Runs repository lint/type gates.                     |
| `pnpm format`       | Formats code and documentation.                      |
| `pnpm format:check` | Checks formatting without writing files.             |

## Testing

| Command         | Description                   |
| :-------------- | :---------------------------- |
| `pnpm test`     | Runs package and API tests.   |
| `pnpm test:e2e` | Runs Playwright dashboard QA. |

## Database & Infrastructure

| Command             | Description                                     |
| :------------------ | :---------------------------------------------- |
| `pnpm db:generate`  | Regenerates the Prisma client.                  |
| `pnpm db:reset:dev` | Destructive local Prisma reset.                 |
| `pnpm docker:up`    | Starts local PostgreSQL through Docker Compose. |
| `pnpm docker:down`  | Stops local Docker services.                    |

## Documentation

| Command           | Description                                       |
| :---------------- | :------------------------------------------------ |
| `pnpm docs:serve` | Serves the MkDocs Material documentation locally. |
| `pnpm docs:build` | Builds the MkDocs site with strict validation.    |

## Recommended Verification Pass

```bash
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm lint
pnpm test:e2e
pnpm docs:build
```
