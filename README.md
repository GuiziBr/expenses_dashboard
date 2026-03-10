# Expenses Dashboard

A modern expense management portal for tracking personal and shared expenses, built with Next.js and React.

## Features

- **Personal & Shared Expense Tracking** — filter by date range, category, payment type, bank, and store; sort by any column; paginated results
- **Balance Summaries** — personal balance and shared split view (paying/payed/total)
- **Monthly Consolidated Reports** — breakdown by payment type, bank, and category per month
- **Management Pages** — full CRUD for banks, categories, stores, and payment types
- **Isomorphic Authentication** — cookie-based auth that works across client and server; middleware protects all routes at the edge
- **Responsive Dark UI** — mobile-first dark theme built with Tailwind CSS v4
- **Type-safe Forms** — react-hook-form + Zod validation on all inputs
- **Smart Caching** — TanStack Query for server state management with automatic cache invalidation

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Library | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Data Fetching | [TanStack Query v5](https://tanstack.com/query/latest) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) (Radix UI) |
| Forms | [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons | [lucide-react](https://lucide.dev/) |
| Notifications | [sonner](https://sonner.emilkowal.ski/) |
| Linter / Formatter | [Biome](https://biomejs.dev/) |
| Auth Cookies | [js-cookie](https://github.com/js-cookie/js-cookie) |

## Project Structure

```text
src/
├── app/            # Next.js App Router (pages & layouts)
├── components/     # Feature & reusable UI components
│   └── ui/         # shadcn/ui base components
├── hooks/          # Custom React Query hooks (CRUD per entity)
├── contexts/       # React Contexts (Auth)
├── providers/      # TanStack Query provider setup
├── lib/            # API client, formatters, auth helpers, utils
├── types/          # TypeScript interfaces
└── constants/      # Centralized UI strings (i18n-ready)
```

## Routes

| Route | Description |
|---|---|
| `/` | Login |
| `/personalDashboard` | Personal expenses |
| `/sharedDashboard` | Shared / split expenses |
| `/consolidatedBalance` | Monthly consolidated report |
| `/management/banks` | Bank management |
| `/management/categories` | Category management |
| `/management/stores` | Store management |
| `/management/paymentTypes` | Payment type management |

All routes except `/` are protected by `middleware.ts`.

## Getting Started

### Prerequisites

- Node.js 24+
- npm / yarn / pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |

## Authentication Architecture

The project uses an isomorphic cookie-based approach:

- **Client Side**: `AuthContext` manages the global user state and provides `signIn`/`signOut` methods.
- **Server Side**: `middleware.ts` reads the `auth_token` cookie directly to handle redirects before the page renders.
- **Isomorphic Helpers**: `auth-helpers.ts` provides consistent access to the token and user data on both client and server.

On login, the API returns a token and user object that are stored in cookies (7-day expiry). On logout, cookies are cleared and the user is redirected to `/`.

---

Built with love
