# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── benefit-finder/     # React+Vite Benefit Finder Chatbot (served at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/benefit-finder` (`@workspace/benefit-finder`)

React + Vite frontend for the Benefit Finder Chatbot. Served at `/`.

- Questionnaire flow with 10 questions covering filing status, dependents, income, household size, employment, housing, school enrollment, health insurance, childcare needs, and food security
- Results page shows matched federal benefits (EITC, CTC, CDCC, AOTC, PTC, Medicaid/CHIP, SNAP, Housing Voucher, Saver's Credit, LIHEAP)
- Uses React Query hooks from `@workspace/api-client-react`
- Animated chat-style UI with framer-motion, progress bar, warm civic design

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
  - `health.ts`: GET /api/healthz
  - `sessions.ts`: POST /api/sessions, GET /api/sessions/:id, POST /api/sessions/:id/answer, POST /api/sessions/:id/reset
- Eligibility logic: `src/lib/eligibility.ts` — computes matched benefits from questionnaire answers
- Questions: `src/lib/questions.ts` — all 10 chatbot questions defined here
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/schema/sessions.ts` — sessions table with session ID, status, answers (jsonb), current question index, and computed benefits (jsonb)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec. Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`.

## Additional Artifacts

### `artifacts/ntbee-flask` (Python/Flask — No-Touch Benefits Eligibility Engine)

Standalone Python 3.11 + Flask 3.x web application for benefits eligibility estimation. Served at `/ntbee/`. Not part of the pnpm workspace — has its own `requirements.txt`.

**Stack:** Flask 3, Flask-Login, Flask-WTF (CSRF), Flask-SQLAlchemy (SQLite), Bootstrap 5.3 CDN, Chart.js

**Key files:**
- `app.py` — Flask app factory, Blueprint at `/ntbee/`, all routes (auth, checker, results, admin, dashboard)
- `eligibility.py` — 10-program eligibility engine using 2024 FPL guidelines
- `models.py` — SQLAlchemy models: `User` (Flask-Login) + `EligibilityCheck`
- `forms.py` — Flask-WTF forms: `LoginForm`, `SignupForm`, `CheckerForm`
- `utils.py` — CSV export utility
- `ntbee.db` — SQLite database (auto-created; separate from old submissions.db)
- `templates/` — Bootstrap 5 Jinja2 templates: base, index, checker, results, login, signup, dashboard, admin, about, privacy, contact, 404, 403
- `static/style.css` — Bootstrap 5 overrides, government blue/green palette
- `static/app.js` — Multi-step form logic + language toggle (EN/ES, localStorage)
- Port: 5000 (set via `PORT` env var)

**10 Programs checked (2024 FPL):**
SNAP (130%), Medicaid/CHIP (138%/200%), LIHEAP (150%), WIC (185%), CCAP (250% proxy), Section 8 (150% proxy), SSI (disability/65+), Free School Meals (130%/185%), TANF (50% + dependents), Lifeline Internet (135%)

**Auth:** Flask-Login sessions; admin seeded as `admin@govbenefits.local` / `admin1234!` on first run

**Features:** Spanish/English toggle, multi-step form with progress bar, admin dashboard (Chart.js + CSV export), user dashboard for saved results, apply guidance accordions (documents, steps, phone, links), print CSS
