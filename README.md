# Lines of Earth

Search for a city and generate a stylized, printable map of its road network — pulled live from OpenStreetMap, rendered to a canvas, and exportable as SVG.

## Tech stack

- **[React 19](https://react.dev/)** — UI, function components + hooks only
- **[Vite](https://vite.dev/)** (with `@vitejs/plugin-react-swc`) — dev server and build
- **[TypeScript](https://www.typescriptlang.org/)** — migration in progress, see below
- **[TanStack Query](https://tanstack.com/query)** — fetching/caching for city search and road data
- **Sass (CSS Modules)** — component-scoped styles (`*.module.scss`)
- **Canvas 2D API** — the map itself is drawn to an HTML canvas, not SVG/DOM
- **[OpenStreetMap Nominatim](https://nominatim.org/)** — city search / geocoding
- **[Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)** — road/geometry data, queried against a rotating list of public mirrors for resilience
- **ESLint 9 (flat config) + Prettier** — linting and formatting, see [Tooling](#tooling)
- **pnpm** — package manager (see [Getting started](#getting-started))

## Architecture

```
src/
  components/   React components + their co-located *.module.scss files
  hooks/
    data/       Data-fetching hooks (Overpass roads, precalculated paths)
    ui/         Presentation/interaction hooks (canvas draw loop, camera, resize)
    helpers/    Small reusable hooks (e.g. useClickOutside)
  helpers/      Pure functions: geometry/math, SVG export, API response shaping
  constants/    Static config: API endpoints, layer/color presets, misc constants
  assets/       Static images (fallback/placeholder backgrounds)
```

**Data flow, roughly:**

1. `QueryForm` takes a city search input → `nominatimService` geocodes it.
2. Once a city is selected, `useRoadsData` queries the Overpass API (via `overpassService`, which fails over across multiple public mirrors) for the road network within that city's boundary.
3. `formatCityHelper`/`queryHelpers` reshape the raw Overpass response; `usePrecalculatePaths` converts geometry into drawable `Path2D` objects (via `locationHelpers`/`mathHelpers` for coordinate projection and path simplification).
4. `useDrawLogic` renders those paths onto `<canvas>` inside `MapViewport`, styled per the active layer/color preset (`constants/layerConfigs`).
5. `exportToSVG` can re-render the same processed data as a standalone SVG file for export/printing.

Path aliases are configured (see [Tooling](#tooling)) so imports read from the project root rather than relative depth — e.g. `import { MAP_PRESETS } from "constants/layerConfigs"` instead of `../../constants/layerConfigs`.

## TypeScript migration (in progress)

The project is being incrementally migrated from `.js`/`.jsx` to `.ts`/`.tsx`. All tooling is already in place — `tsconfig.json`, path aliases, ESLint, and Vite all understand TypeScript today — so files can be converted one at a time without breaking anything in between.

- **Converted:** most of `src/helpers/` (`mathHelpers.ts`, `utilities.ts`, `nominatimService.ts`, etc.)
- **Not yet converted:** all of `src/components/`, all of `src/hooks/`, and a few remaining files in `src/helpers/` and `src/constants/`

If you're converting a file, rename `.jsx` → `.tsx` (or `.js` → `.ts` for non-JSX files), then run `pnpm run typecheck` to see what needs annotating. Small, incremental PRs are preferred over large batch conversions.

## Getting started

**1. Use the right Node version.** This repo pins its version in `.nvmrc`. With [`fnm`](https://github.com/Schniz/fnm) (recommended, cross-platform including Windows) or [`nvm`](https://github.com/nvm-sh/nvm):

```bash
fnm use   # or: nvm use
```

**2. Install dependencies.** This project uses **pnpm**, not npm/yarn — installing with a different package manager will create a conflicting lockfile.

```bash
pnpm install
```

This also installs the project's git hooks automatically (see [Pre-commit hook](#pre-commit-hook)).

**3. Run the dev server:**

```bash
pnpm run dev
```

Then open the printed `localhost` URL.

## Scripts

| Script               | What it does                                                           |
| -------------------- | ---------------------------------------------------------------------- |
| `pnpm run dev`       | Start the Vite dev server                                              |
| `pnpm run build`     | Type-unaware production build (Vite/esbuild)                           |
| `pnpm run preview`   | Preview the production build locally                                   |
| `pnpm run lint`      | Run ESLint across the project                                          |
| `pnpm run typecheck` | Run `tsc --build` — the real type-checking pass, separate from `build` |

## Tooling

- **Path aliases** — `assets/*`, `components/*`, `constants/*`, `helpers/*`, `hooks/*` all resolve to their respective folders under `src/`, in both TypeScript (`tsconfig.json`) and Vite (`vite-tsconfig-paths`).
- **Import sorting** — imports are auto-sorted/grouped on save (external packages → aliased local imports → parent-relative `../` imports → same-folder `./` imports → `.scss` imports), via `eslint-plugin-simple-import-sort`.
- **Unused imports** — automatically stripped on save via `eslint-plugin-unused-imports`.
- **Formatting** — Prettier owns all formatting; ESLint's own stylistic rules are disabled via `eslint-config-prettier` to avoid the two fighting each other.

### Pre-commit hook

A Husky + `lint-staged` pre-commit hook runs automatically on `git commit` (installed for you via `pnpm install`): it Prettier-formats staged files and runs ESLint on staged JS/TS files, blocking the commit on lint **errors** (warnings are still allowed through).

### Recommended VS Code extensions

This repo recommends two extensions (`.vscode/extensions.json`) needed for format-on-save and lint-fix-on-save (configured in `.vscode/settings.json`) to actually work:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (`dbaeumer.vscode-eslint`)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (`esbenp.prettier-vscode`)

**To install:** open this folder in VS Code — a notification will prompt _"This workspace has extension recommendations"_ with an **Install All** button. If you miss it, open the Extensions panel (`⇧⌘X` / `Ctrl+Shift+X`), type `@recommended`, and install both from there.

Alternatively, from a terminal with the `code` CLI available:

```bash
code --install-extension dbaeumer.vscode-eslint --install-extension esbenp.prettier-vscode
```
