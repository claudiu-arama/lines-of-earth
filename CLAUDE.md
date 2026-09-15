# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lines of Earth: search for a city and generate a stylized, printable map of its road network, pulled live from OpenStreetMap, rendered to a `<canvas>`, and exportable as SVG. It's a pnpm workspace with two packages: the root (React frontend) and `server/` (Express API).

## Commands

Node version is pinned in `.nvmrc` (`fnm use` / `nvm use`). Install with `pnpm install` (not npm/yarn — a different lockfile will conflict).

Frontend (run from repo root):

- `pnpm run dev` — Vite dev server
- `pnpm run build` — production build (type-unaware, esbuild)
- `pnpm run typecheck` — `tsc --build`, the real type-checking pass (separate from `build`)
- `pnpm run lint` — ESLint

Server (run from `server/`):

- `pnpm run dev` — `tsx watch src/server.ts`
- `pnpm run build` / `pnpm run start` — compile then run `dist/server.js`
- `pnpm run typecheck` — `tsc --noEmit`
- `pnpm run lint` — ESLint

Docker (from repo root, for the server + Redis):

- `pnpm run docker:up` / `docker:down` — full stack (server on `:3000`, Redis on `:6379`)
- `pnpm run docker:redis:up` / `docker:redis:down` — Redis only, for running the server locally against it

There is no test suite in either package currently.

## Architecture

### Frontend (`src/`)

Path aliases (`assets/*`, `components/*`, `constants/*`, `helpers/*`, `hooks/*` → `src/*`) are configured in both `tsconfig.json` and Vite — import from these, not relative paths.

```
components/   React components + co-located *.module.scss files
hooks/
  data/       Data-fetching hooks (Overpass roads, precalculated paths)
  ui/         Presentation/interaction hooks (canvas draw loop, camera, resize)
  helpers/    Small reusable hooks (e.g. useClickOutside)
helpers/      Pure functions: geometry/math, SVG export, API response shaping
constants/    Static config: API endpoints, layer/color presets
```

Data flow: `QueryForm` takes a city search → `nominatimService` geocodes it → once a city is selected, `useRoadsData` queries the server's `/api/roads` (via `overpassService`) for the road network within that city's boundary → `formatCityHelper`/`queryHelpers` reshape the response → `usePrecalculatePaths` converts geometry into `Path2D` objects (via `locationHelpers`/`mathHelpers` for projection and simplification) → `useDrawLogic` renders those paths onto `<canvas>` inside `MapViewport`, styled per the active layer/color preset (`constants/layerConfigs`) → `exportToSVG` can re-render the same processed data as a standalone SVG for export/printing.

**TypeScript migration is in progress and incremental** — `src/helpers/` is mostly converted; `src/components/` and `src/hooks/` are not. When touching a file, converting it (`.jsx`→`.tsx`, `.js`→`.ts`, then `pnpm run typecheck` to find what needs annotating) is welcome, but keep conversions as their own small change rather than bundling them into unrelated work.

### Server (`server/src/`)

Express app (`app.ts`) mounts routes under `/api` plus a `/health` check, with a single error-handling middleware (`common/middlewares/errorHandler.ts`) that expects errors to be `AppError` instances (`common/errors/AppError.ts`: `statusCode`, `errorCode`, `details`, `expose`).

Routes (`routes/`) are thin — they delegate to `services/` (`cities.service.ts`, `roads.service.ts`), which call into `providers/`:

- **`providers/geocoding/`** — `createGeocodingProvider()` is a factory that builds a `GeocodingProvider` (`search(query, limit)`) from a config object (base URL, search path, param builder, optional response parser). `nominatim.provider.ts` and `photon.provider.ts` are both built this way; add a new geocoding source by writing a new config for the factory rather than a bespoke client.
- **`providers/spatial-queries/`** — Overpass querying, built for resilience against flaky public mirrors (`config.ts` lists `OVERPASS_INSTANCES`):
  - `priority.ts` — probes each instance's `/status` endpoint for latency and caches a ranked instance-ID ordering in Redis (`overpass:latency:ranking`), refreshed under a short-lived Redis lock so only one process probes at a time.
  - `circuitBreaker.ts` — tracks per-instance failures in a Redis sorted set within a rolling window; once `failureThreshold` is hit within `failureWindowMs`, the instance is marked "open" (skipped) for `openStateTtlMs`.
  - `overpass.provider.ts` (`queryOverpass`) ties these together: order instances by rank, filter out circuit-open ones, then race requests in batches (`OVERPASS_CONFIG.raceSize` at a time via `Promise.any`) — the first successful response wins, losers are aborted, and a whole-batch failure records failures for every instance in it before moving to the next batch. Only throws once every instance across every batch has failed.
- **`common/http/osmFetch.ts`** — the shared fetch wrapper used by both provider families for talking to OSM-adjacent APIs.
- **`common/redis/redisClient.ts`** — the shared `ioredis` client used by the priority ranking and circuit breaker.

When adding a new spatial-query or geocoding provider, follow the existing pattern (config-driven factory for geocoding; rank + circuit-breaker + race for anything hitting multiple mirrors) rather than a one-off client, so behavior stays consistent across providers.

## Tooling conventions

- Imports are auto-sorted on save (external → internal-aliased → parent-relative → sibling → `.scss`) via `eslint-plugin-simple-import-sort` / `import-x`; unused imports are stripped automatically. Don't fight this — let ESLint's autofix (or the VS Code extensions below) handle ordering.
- Type-only imports must use `import type` (`@typescript-eslint/consistent-type-imports`, enforced as a warning).
- Prettier owns formatting; ESLint's stylistic rules are disabled to avoid conflicts.
- A Husky + `lint-staged` pre-commit hook Prettier-formats and lints staged files, blocking commits on lint **errors** (warnings pass through).
- Recommended VS Code extensions (`.vscode/extensions.json`) are required for format-on-save/lint-fix-on-save to work as configured: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`.
