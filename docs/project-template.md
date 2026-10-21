# Starting a New Project from This Template

This guide explains how to start a new project that uses the same technologies, dependencies, tooling and folder structure as Expenses Dashboard. It describes what to copy as-is, what to replace, and what to leave behind.

The project is created as a fresh scaffold: a new Next.js app that brings over only the infrastructure. Sections 2 to 8 describe the steps and double as the reference for what that infrastructure is.

For the visual design side, see [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md).

---

## 1. Technology Stack

| Concern | Technology | Version in this repo |
|---|---|---|
| Runtime | Node.js | 26 (`.nvmrc`, `.node-version`, `engines: >=26`). This repo is still on 24 |
| Package manager | npm (`package-lock.json`, CI uses `npm ci`) | |
| Framework | Next.js, App Router, `src/` directory | 16.4.2 (pinned) |
| UI library | React | 19.3.1 (pinned) |
| Language | TypeScript, `strict` | 7.0.2 (pinned) |
| Styling | Tailwind CSS v4, CSS-first config (`@theme` in `globals.css`) | ^4 |
| Components | shadcn/ui (New York style, Radix UI primitives) | `radix-ui` ^1.8.1 |
| Variants | class-variance-authority, clsx, tailwind-merge | |
| Icons | lucide-react | |
| Toasts | sonner | |
| Server state | TanStack Query | ^5 |
| Forms | react-hook-form + Zod + `@hookform/resolvers` | zod ^4 |
| Auth storage | js-cookie | |
| Lint and format | Biome | 2.6.2 (pinned) |
| Tests | Vitest + Testing Library + jsdom, v8 coverage | vitest ^5 |
| CI | GitHub Actions, Dependabot | |
| Design file | Pencil (`design.pen`) | optional |

Pinned versions (Next, React, TypeScript, Biome) have no `^`, so upgrades are deliberate. Keep that convention.

---

## 2. Dependencies

Copy these blocks into the new `package.json`, then change `name`. Run `npm install` to regenerate the lockfile. Never copy `package-lock.json` from this repo.

```json
{
	"name": "<new-project-name>",
	"version": "1.0.0",
	"engines": { "node": ">=26" },
	"private": true,
	"scripts": {
		"dev": "next dev",
		"build": "next build",
		"start": "next start",
		"lint": "npx @biomejs/biome lint",
		"check": "npx @biomejs/biome check",
		"fix": "npx @biomejs/biome check --write",
		"format": "biome lint --write .",
		"test": "vitest",
		"test:run": "vitest run",
		"test:cov": "vitest run --coverage"
	},
	"dependencies": {
		"@hookform/resolvers": "^5.9.2",
		"@radix-ui/react-slot": "^1.5.0",
		"@tanstack/react-query": "^5.104.5",
		"class-variance-authority": "^0.7.1",
		"clsx": "^2.1.1",
		"js-cookie": "^3.0.8",
		"lucide-react": "^1.61.0",
		"next": "16.4.2",
		"radix-ui": "^1.8.1",
		"react": "19.3.1",
		"react-dom": "19.3.1",
		"react-hook-form": "^7.90.0",
		"sonner": "^2.0.8",
		"tailwind-merge": "^3.7.0",
		"zod": "^4.6.7"
	},
	"devDependencies": {
		"@biomejs/biome": "2.6.2",
		"@tailwindcss/postcss": "^4",
		"@testing-library/jest-dom": "^7.0.1",
		"@testing-library/react": "^16.3.3",
		"@testing-library/user-event": "^14.6.8",
		"@types/js-cookie": "^3.0.6",
		"@types/node": "^26.6.5",
		"@types/react": "^19",
		"@vitejs/plugin-react": "^6.1.2",
		"@vitest/coverage-v8": "^5.0.5",
		"jsdom": "^30.1.3",
		"tw-animate-css": "^1.4.0",
		"typescript": "7.0.2",
		"vitest": "^5.0.5",
		"vite": "^8.3.5"
	}
}
```

Notes:

- `tailwindcss` itself is not listed. It comes in through `@tailwindcss/postcss`. Keep it that way.
- Drop `js-cookie` and `@types/js-cookie` if the new project has no cookie auth. `react-icons` is deliberately left out: lucide-react is the only icon library. Here react-icons is used only by `NewExpenseModal.tsx`, so replace those icons with lucide equivalents if you copy that component.
- **Versions are the latest as of 2026-10-21**, checked with `npm view`. The existing repo is behind on a few. In a scratch copy of this repo, this exact set passed `tsc`, `next build`, and all unit tests with coverage above the thresholds. Re-run `npm view <pkg> version` when you start, and keep the rule: latest, unless it breaks a peer dependency.
- **Node 26 is intentional.** Every dependency here allows it (Next `>=20.9`, Vite 8 `>=22.12`, Vitest 5 and jsdom 30 `^22 || ^24 || >=26`, so Node 25 is the one version they skip). The full set passed `tsc`, `next build` and all unit tests on Node 26.12.0. Use an even-numbered (LTS) release and keep `.nvmrc`, `.node-version`, `engines` and the CI `node-version` in sync.
- **`vite` is listed explicitly.** `@vitejs/plugin-react` 6 and Vitest 5 both take `vite` as a peer dependency (plugin-react 6 needs `^8`), so nothing installs it for you. Without it Vitest fails at startup with `Cannot find package 'vite'`. Version 5 of the plugin used to pull it in.
- **`@hookform/resolvers` stays on `^5.9.2` on purpose.** Version 6.0.0 is out, but `npm install` fails with an `ERESOLVE` error on its optional peer dependencies (`effect`, `@typeschema/main`). It only installs with `--legacy-peer-deps`, which then also stops `@testing-library/dom` from installing. It works with react-hook-form 7.90 and Zod 4 otherwise, so move to 6 once the peer conflict is fixed upstream.
- **TypeScript 7 and plugin-react 6 are intentional.** This repo's Dependabot config ignores both, so remove the two `ignore` entries from `.github/dependabot.yml` when you copy it, otherwise the new project is held back to the old majors.
- **Biome 2.6 is stricter.** On this codebase it reports two new lint errors (`noComponentHookFactories`, `noIdenticalTestTitle`), both in test files. It also checks Markdown, so `npm run check` flags the docs folder. Fix those in the new project, or leave `docs/` out of Biome with `files.includes` in `biome.json`.

---

## 3. Folder Structure

```text
<project>/
├── .github/
│   ├── dependabot.yml
│   └── workflows/ci.yml
├── .vscode/settings.json
├── docs/                      # Project documentation (see section 7)
├── public/assets/images/      # Static assets (logo, backgrounds)
├── src/
│   ├── app/                   # App Router: layouts, pages, error boundaries
│   │   ├── (app)/             # Route group for authenticated pages (shared shell layout)
│   │   ├── globals.css        # Design tokens and Tailwind bridge
│   │   ├── layout.tsx         # Root layout: fonts, providers, Toaster
│   │   ├── page.tsx           # Public page (login)
│   │   ├── error.tsx
│   │   └── global-error.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives (generated, not linted)
│   │   └── *.tsx              # Feature components, tests next to the source
│   ├── constants/
│   │   └── translations.ts    # All UI strings, grouped by area
│   ├── contexts/              # React contexts (auth, page toolbar)
│   ├── hooks/                 # TanStack Query hooks, one file per entity
│   ├── lib/                   # API client, auth helpers, formatters, pure logic
│   │   └── schemas/           # Zod schemas
│   ├── providers/             # Query provider, theme provider
│   ├── test/                  # Vitest setup and shared test helpers
│   ├── types/                 # Shared TypeScript types
│   └── proxy.ts               # Route protection (Next 16 proxy, replaces middleware)
├── .env.example
├── .gitignore
├── .node-version
├── .nvmrc
├── biome.json
├── components.json            # shadcn/ui config
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.mjs        # Only read by the VS Code Tailwind extension
├── tsconfig.json
└── vitest.config.ts
```

Conventions that hold across the codebase:

- **Tests live next to the code** as `name.test.ts(x)`. Shared helpers are in `src/test/`.
- **One hook file per API entity** (`use-banks.ts`) with `useX` for lists, and `useCreateX`, `useUpdateX`, `useDeleteX` mutations that invalidate the entity's query key.
- **Pure logic goes in `src/lib/`**, with a high coverage bar (see section 5).
- **No hard-coded UI strings** in components. They come from `src/constants/translations.ts`.
- **Path alias** `@/*` maps to `src/*`. Always import through it.
- **File naming**: components are `PascalCase.tsx`, hooks and lib files are `kebab-case.ts`, shadcn primitives are lowercase `kebab-case.tsx`.
- **Style**: tabs, no semicolons, no trailing commas, double quotes (enforced by Biome).

---

## 4. Configuration Files

Copy these unchanged unless noted.

| File | Copy as-is? | What it does |
|---|---|---|
| `.nvmrc`, `.node-version` | Change to `26` | Node version for nvm, fnm, Vercel and similar |
| `biome.json` | Yes | Tabs, no semicolons, no trailing commas, recommended rules, organize imports, `src/components/ui/**` excluded. Update the `$schema` version if you change Biome's version |
| `tsconfig.json` | Yes | `strict`, bundler resolution, `@/*` alias, Next plugin |
| `next.config.ts` | Yes | Empty config; add options as needed |
| `postcss.config.mjs` | Yes | Only `@tailwindcss/postcss` |
| `tailwind.config.mjs` | Yes | Content glob for the editor extension only; Tailwind v4 does not read it for builds |
| `components.json` | Yes | shadcn: New York, RSC, neutral base, CSS variables, lucide icons, aliases to `@/components`, `@/lib`, `@/hooks` |
| `vitest.config.ts` | Adapt | See section 5 |
| `.gitignore` | Yes | Ignores `.env*`, `.next`, `coverage`, `*.tsbuildinfo`, `next-env.d.ts` |
| `.env.example` | Adapt | `NEXT_PUBLIC_API_URL=http://localhost:3000` |
| `.vscode/settings.json` | Yes | Biome as formatter, fix and organize imports on save, Tailwind language support for CSS |
| `.github/workflows/ci.yml` | Adapt | Set `node-version: 26`. Build, check, test with coverage on PRs to `development`. Change branch names if different |
| `.github/dependabot.yml` | Adapt | Daily npm and Actions updates, React packages grouped. Drop the `ignore` entries for plugin-react 6 and TypeScript 7 |

Not to copy: `.env` (local secrets), `.next/`, `coverage/`, `node_modules/`, `tsconfig.tsbuildinfo`, `next-env.d.ts` (all generated), and `.mcp.json` (local Pencil app path, machine-specific).

---

## 5. Testing Setup

- **Runner**: Vitest, default environment `node`. Component tests that need a DOM opt in per file with `// @vitest-environment jsdom`. Check an existing `*.test.tsx` for the exact header and copy it.
- **Setup file** `src/test/setup.ts` loads `@testing-library/jest-dom/vitest`, runs `cleanup` after each test, and polyfills browser APIs that jsdom lacks and Radix needs (`ResizeObserver`, pointer capture, `scrollIntoView`). Copy it as-is.
- **Query helper** `src/test/query-wrapper.tsx` creates an isolated `QueryClient` with retries off for each test. Copy it as-is.
- **Coverage** uses v8 with `text`, `html` and `lcov` reporters, writing to `coverage/`.
  - Exclusions are test files, type-only modules, constants, Next.js glue (`layout.tsx`, error boundaries, route `page.tsx`) and generated shadcn primitives.
  - Thresholds here are a **ratchet** (94/88/92/95 global, 90 for `src/lib/**`). They only go up. For a new project, start with the stated target (80 statements, 80 branches, 80 functions, 70 lines is the repo's own floor) and raise them as the project grows. Do not copy 94 on day one, or the first commits will fail CI.
  - Update the exclusion list so it only names files that exist in the new project.

---

## 6. Core Infrastructure to Carry Over

These files are domain-agnostic and form the reusable foundation. Copy them, then adapt the noted parts.

### Styling and design tokens

| File | Adapt |
|---|---|
| `src/app/globals.css` | Tokens (light in `:root`, dark in `.dark`), radius scale, `@theme` bridge. Change colour values for the new brand and keep the token names. Components rely on the names, never on raw colours |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge). Copy as-is |
| `src/providers/theme-provider.tsx`, `src/lib/theme.ts` | Light/dark switch, dark by default, `THEME_INIT_SCRIPT` prevents a flash on first paint. Copy as-is |
| `src/components/ui/*` | shadcn primitives. Prefer re-generating with `npx shadcn@latest add <component>` over copying. Then check the local edits listed in DESIGN_SYSTEM.md |
| `src/app/layout.tsx` | Replace the `metadata` title and description. Fonts are Roboto Slab and Roboto via `next/font/google`. Change them if the brand differs |

### Data layer

| File | Adapt |
|---|---|
| `src/lib/api.ts` | Fetch-based `ApiClient` with `get`, `getWithHeaders` (reads `x-total-count`), `post`, `put`, `patch`, `delete`. Adds the bearer token, throws a typed `ApiError`, handles 204, and calls a registered unauthorized handler on a 401 of an authenticated session. Copy as-is. It expects a REST API with JSON bodies and an `x-total-count` header on paginated lists |
| `src/lib/constants.ts` | Keep `COOKIE_NAME`, `API_BASE_URL`, `AUTH_COOKIE_OPTIONS`. Delete the expense-specific constants |
| `src/providers/query-provider.tsx` | `staleTime` 30 s, refetch on window focus. Copy as-is |
| `src/hooks/use-banks.ts` | Use as the **pattern** for every entity hook (query key per entity, `keepPreviousData`, mutations that invalidate). Do not copy the entity itself |
| `src/hooks/use-paged-list.ts` | Generic pagination and sort state for list pages. Check whether it is free of domain types, then copy |

### Authentication

Cookie-based and isomorphic. See [README.md](../README.md#authentication-architecture) for the flow.

| File | Adapt |
|---|---|
| `src/lib/auth-helpers.ts` | Reads and writes the token and user cookie on client and server. Copy as-is |
| `src/contexts/auth-context.tsx` | `signIn` and `signOut`, user state. Adapt the `POST /sessions` call and user shape to the new API |
| `src/proxy.ts` | Redirects unauthenticated users to `/?redirectTo=...` and authenticated users away from `/`. Adapt `isPublicRoute` if there are more public pages. It decodes the JWT `exp` claim without verifying the signature, so it is a UX gate, not a security boundary. The API must enforce auth |
| `src/lib/redirect.ts` | Open-redirect-safe `redirectTo` handling. Change `DEFAULT_AUTHENTICATED_PATH` to the new landing route |

If the new project does not need auth, leave out `proxy.ts`, `auth-context.tsx`, `auth-helpers.ts`, `redirect.ts`, `js-cookie`, and the unauthorized-handler code in `api.ts`.

### Shared UI shell

`AppSidebar`, `BottomTabBar` (mobile), `TopBar`, `UserAvatar`, `MonthPicker`, `Pagination`, `SortableHeader`, `ConfirmDeleteModal`, `EditModal` and the `page-toolbar-context` form the app shell and table/CRUD patterns. `src/app/(app)/layout.tsx` composes them. Copy the ones the new project needs, and remove the expenses-specific navigation entries from `src/lib/navigation.ts` and `translations.ts`.

---

## 7. Documentation to Carry Over

The `docs/` folder structure is part of the template:

| Path | Purpose | For the new project |
|---|---|---|
| `README.md` | Overview, stack, structure, scripts, auth | Rewrite for the new product |
| `DESIGN_SYSTEM.md` | Visual source of truth for UI work (and for AI assistants) | Keep, update tokens and brand |
| `docs/specs/` | Feature specs and business rules | Start empty, add per feature |
| `docs/plans/` | Implementation plans | Start empty |
| `docs/APIs/` | One file per backend resource | Start empty, mirror the new API |
| `docs/ui/` | UI change history | Start empty |
| `design.pen` | Pencil design file with tokens and components | Copy and rename if you use Pencil, otherwise skip |

---

## 8. Step-by-Step

1. **Create the repo**
   ```bash
   mkdir <new-project> && cd <new-project>
   git init
   nvm use 26   # or fnm use
   ```
2. **Add `package.json`** from section 2, then `npm install`.
3. **Copy the config files** from section 4 (`biome.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.mjs`, `components.json`, `vitest.config.ts`, `.gitignore`, `.nvmrc`, `.node-version`, `.vscode/`, `.github/`).
4. **Create the folders** from section 3 under `src/`.
5. **Copy the infrastructure** from section 6: `globals.css`, `utils.ts`, providers, `api.ts`, `constants.ts`, auth files if needed, `src/test/`.
6. **Create `src/app/layout.tsx` and a first `page.tsx`**, using this repo's root layout as the reference.
7. **Add shadcn primitives** you need: `npx shadcn@latest add button input dialog sheet dropdown-menu tooltip sonner`.
8. **Create `.env`** from `.env.example` and set `NEXT_PUBLIC_API_URL`.
9. **Verify the toolchain** before writing features:
   ```bash
   npm run check      # Biome lint, format, import order
   npm run build      # Next build and type-check
   npm run test:run   # Vitest
   ```
10. **Commit**, push, and confirm CI is green on the first PR.
11. **Rewrite `README.md`** and trim `DESIGN_SYSTEM.md` to the new product.

---

## 9. Things to Decide Per Project

| Decision | Default here | Revisit if |
|---|---|---|
| Backend | Separate REST API at `NEXT_PUBLIC_API_URL` | Using Next route handlers or server actions instead. `api.ts` and the auth flow need rework |
| Auth | JWT in a cookie set from the client (not `httpOnly`) | You need `httpOnly` cookies. Move login to a route handler or server action that sets the cookie |
| i18n | Single `translations.ts` object, English only | You need multiple locales. Adopt a library such as `next-intl` |
| Theme | Dark default, light switch | Brand requires one theme only |
| Fonts | Roboto Slab and Roboto | New brand typography |
| Default branch | `development` (CI triggers on it) | Different branching model. Update `ci.yml` and `dependabot.yml` |
| Linter | Biome only, no ESLint or Prettier | Team standard differs |

---

## 10. Known Quirks in the Template

Worth fixing in the new project rather than inheriting:

- `npm run format` runs `biome lint --write .`, which only applies lint fixes. Use `npm run fix` (`biome check --write`) for formatting and import ordering, or point `format` at `biome format --write .`.
- The README lists `npm run lint` and `format` but not `check` and `fix`, which CI and local workflow actually use.
- `tailwind.config.mjs` is only for editor tooling. Tailwind v4 reads its config from `globals.css`.
- `next.config.ts` still contains the scaffold placeholder comment.
- Some default fallbacks in `redirect.ts` (`/balance-breakdown`) and `constants.ts` (`http://localhost:3000`, the same port Next uses in dev) are specific to this app. Change both.
