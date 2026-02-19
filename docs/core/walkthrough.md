# Project Setup Walkthrough - Expenses Dashboard

I have successfully initialized the new refactored project. This document summarizes the technical setup and the tools configured.

## Project Information
- **Project Name**: `expenses_dashboard`
- **Location**: `/Users/guizi/Documents/Projects.tmp/expenses_dashboard`
- **Frontend Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn/ui
- **Linter/Formatter**: BiomeJS

## Key Configuration Actions

### 1. Next.js Initialization
The project was initialized with the following configuration:
- Use of the `src` directory for better code organization.
- Import alias `@/*` configured for clean path references.
- **ESLint and Prettier were excluded** in favor of BiomeJS.

### 2. BiomeJS Configuration
BiomeJS is set up as the unified tool for linting and formatting.
- `biome.json` has been initialized in the root.
- Scripts added to `package.json`:
    - `npm run lint`: Runs `biome check .`
    - `npm run format`: Runs `biome format --write .`

### 3. Shadcn/ui Integration
Shadcn/ui has been initialized with the following:
- Tailwind CSS v4 compatibility.
- CSS variables for theming in `src/app/globals.css`.
- Utility functions in `src/lib/utils.ts`.

## Next Steps
1. **Define API Layer**: Setup the native `fetch` client and TanStack Query.
2. **Define Auth Strategy**: Migrate the existing private route logic to Next.js Middleware.
3. **Mobile Optimization**: Ensure the application layout changes dynamically for small screens (stacking grids, modifying navigation).
4. **Start Component Migration**: Begin migrating the most critical components from the legacy React 17 project.
