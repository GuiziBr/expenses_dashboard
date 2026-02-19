# Implementation Plan - Expenses Portal Refactoring

Refactor the existing Expenses Portal from a React 17 SPA to a modern Next.js 15 application. This migration aims to improve performance, maintainability, and developer experience by leveraging modern tools like Tailwind CSS, Shadcn/ui, and Vercel's latest features.

## User Review Required

> [!IMPORTANT]
> **Proposed Architectural Shift: Next.js App Router**
> I recommend migrating from a pure React SPA (React Router) to **Next.js 15 (App Router)**. This is the most "Vercel-native" way to build React apps today and provides the best support for Shadcn/ui and modern React features like Server Components.

> [!WARNING]
> **Styling Paradigm Shift**
> Moving from **Styled Components** to **Tailwind CSS** is a significant manual effort. While tools exist to help, most components will need a rewrite to follow the utility-first approach and Shadcn/ui patterns.

> [!IMPORTANT]
> **Auth Migration: SessionStorage to Cookies**
> To support **Next.js Server Components**, we must migrate from `sessionStorage` (client-only) to **HTTP-only Cookies**. This allows the server to read the token on the initial request, enabling:
> 1. Protected routes via Middleware (redirecting before page load).
> 2. Data fetching in Server Components without client-side waterfalls.

## Proposed Changes

### 1. Framework & Infrastructure
- Initialize a new **Next.js 15** project with **TypeScript** and **Tailwind CSS**.
- Configure **Vercel** deployment settings for the new repository.
- Setup **BiomeJS** for high-performance linting and formatting (replacing ESLint and Prettier).

### 2. Styling & UI Components
- Setup **Shadcn/ui** using the CLI (`npx shadcn-ui@latest init`).
- Migrate **Styled Components** logic to **Tailwind CSS** classes.
- Replace custom UI elements (Inputs, Buttons, Tables) with **Shadcn** components.
- **Mobile-First Approach**: Design all components starting from mobile breakpoints (`sm`) and enhance for larger screens using Tailwind's `md`, `lg`, and `xl` prefixes.
- **Responsive Layouts**: Use CSS Grid and Flexbox to create stackable layouts that adapt to screen width (e.g., side-by-side on desktop, stacked on mobile).
- **Touch Targets**: Ensure all interactive elements (buttons, inputs, links) have a minimum touch target size of 44x44px for accessibility on touch devices.

### 3. Routing & Navigation
- Replicate **React Router** paths using the **Next.js App Router** directory structure (`/app/dashboard/page.tsx`, etc.).
- Transform "Private Routes" into **Next.js Middleware** for authentication checks.
- Replace `Link` and `useNavigate` from `react-router-dom` with `next/link` and `next/navigation`.
- **Mobile Navigation**: Implement a responsive navigation strategy, such as a collapsible sidebar (Hamburger menu) or a bottom navigation bar for mobile views, distinct from the desktop sidebar/topbar.

### 4. Data Fetching & API
- Use native **`fetch` API** for Server Components to leverage Next.js caching and revalidation.
- Implement **TanStack Query (React Query)** for client-side state management (caching, loading states, errors) if the app is highly interactive.

### 5. Authentication Layer [NEW]
- **Storage**: Migrate from `sessionStorage` to **Cookies**.
    - Use `js-cookie` for client-side token management.
    - Use `next/headers` (`cookies()`) for server-side token access.
- **AuthProvider**:
    - Keep the React Context pattern for Client Components (`useAuth` hook).
    - Initialize state essentially from the cookie existence, validating via a user profile fetch (`/me`).
- **Middleware**:
    - Update `src/proxy.ts` (or move to `middleware.ts`) to intercept requests and check for the auth cookie.
- **API Client**:
    - Create a isomorphic `fetch` wrapper that automatically attaches the `Authorization` header.
    - **Server**: Reads from `cookies()`.
    - **Client**: Reads from `document.cookie` (or `js-cookie`).

---

## Migration Strategy: Incremental Migration

We will follow a component-driven approach:
1.  **Project Shell**: Setup Layout, Navigation, and Auth Middleware.
2.  **Shared UI**: Migrate the Design System (Buttons, Inputs, Modals) to Shadcn.
3.  **Pages**: Migrate pages one by one, starting with the Login and Dashboard.
4.  **Legacy Cleanup**: Once all pages are migrated, remove old dependencies.

---

## Verification Plan

### Automated Tests
- **Linting & Formatting**: Run `npx @biomejs/biome check --apply .` to ensure code quality and formatting.
- **Build**: Run `npm run build` to verify Vercel deployment compatibility.
- **Unit Tests**: (To be defined) We can setup Vitest if unit testing for business logic is required.

### Manual Verification
- **Auth Flow**: Verify that private routes redirect to login and vice-versa.
- **CRUD Operations**: Test adding, editing, and deleting expenses.
- **Responsive Design**: Verify the UI on mobile (iOS Safari, Android Chrome), tablet, and desktop using browser dev tools.
    - Check for horizontal scrolling issues (overflow).
    - Verify that tap targets are easily clickable.
    - Ensure safe area insets are respected on notched devices (iPhone X+).

## Best Practices & Tips

- **Form Management**: Use **React Hook Form** with **Zod** for schema validation. This is the standard for Shadcn/ui and provides excellent type safety and performance.
- **Data Tables**: For the expenses list, leverage **TanStack Table** (built into Shadcn). It's incredibly powerful for filtering, sorting, and pagination.
- **Theme Sync**: Define your existing brand colors in `tailwind.config.js` to ensure visual consistency during the migration.
- **Iconography**: Use **Lucide React** for a modern, consistent look across the application.
- **API Wrapper**: Create a custom `api` client (Axios or Fetch) with interceptors to handle auth tokens and global error handling, keeping components clean.
- **Deployment**: Connect both the old and new repos to Vercel. You can use **Vercel Skew Protection** if you are deploying complex updates to ensure client-server compatibility.
