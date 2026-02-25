# Dashboard API Implementation Plan

Implement a robust data-fetching layer for the Personal and Shared dashboards using TanStack Query. This replaces the legacy `useEffect` and `sessionStorage` approach with a modern, cached, and type-safe solution.

## User Review Required

> [!IMPORTANT]
> **TanStack Query Recommendation**: Even though these APIs are used in single pages, using a custom hook with TanStack Query is highly recommended. It provides built-in caching (great for switching between dashboards), automatic loading/error states, and keeps your UI components clean.

> [!NOTE]
> **Pagination**: The legacy code relies on a custom header for the total count. I propose updating the `ApiClient` to return both `data` and `headers` when needed, or specifically extracting the `X-Total-Count` (or equivalent).

## Proposed Changes

### Core Infrastructure

#### [MODIFY] [utils.ts](file:///Users/guizi/Documents/Projects.tmp/expenses_dashboard/src/lib/utils.ts)
Add `formatAmount` and `formatDate` utility functions to handle the display logic previously found in the assembler functions.

#### [MODIFY] [api.ts](file:///Users/guizi/Documents/Projects.tmp/expenses_dashboard/src/lib/api.ts)
Update `ApiClient` to optionally return the full response or a specific object containing both data and metadata (like total count from headers).

#### [NEW] [expenses.ts](file:///Users/guizi/Documents/Projects.tmp/expenses_dashboard/src/types/expenses.ts)
Define TypeScript interfaces for:
- `Expense` (API model)
- `FormattedExpense` (UI model)
- `ExpenseFilters` (Start date, end date, etc.)
- `ExpenseOrder` (Sorting params)

---

### Data Fetching Layer

#### [NEW] [expense-service.ts](file:///Users/guizi/Documents/Projects.tmp/expenses_dashboard/src/services/expense-service.ts)
Implement functions to interact with `/expenses/personal` and `/expenses/shared`. These will handle query parameter construction.

#### [NEW] [use-expenses.ts](file:///Users/guizi/Documents/Projects.tmp/expenses_dashboard/src/hooks/use-expenses.ts)
Create custom hooks:
- `usePersonalExpenses(filters, order)`
- `useSharedExpenses(filters, order)`
These hooks will use `useQuery` and include the "assembler" logic to transform API data into the formatted UI model.

---

### UI Integration

#### [MODIFY] [Dashboard Pages](file:///Users/guizi/Documents/Projects.tmp/expenses_dashboard/src/app/sharedDashboard/page.tsx)
Update `personalDashboard/page.tsx` and `sharedDashboard/page.tsx` to:
- Use the new hooks.
- Handle loading and error states using Shadcn UI components (if available) or simple placeholders.
- Manage pagination state.

## Verification Plan

### Automated Tests
- N/A (Manual verification via browser tool)

### Manual Verification
- **Fetch Test**: Navigate to Shared/Personal dashboards and verify that the list loads correctly with formatted amounts and dates.
- **Filter Test**: Change date ranges and verify the API is called with correct parameters.
- **Caching Test**: Navigate between Personal and Shared tabs; observe that the "loading" state is minimal or absent if data is already cached.
- **Pagination Test**: Verify that the total count is correctly received and used for pagination.
