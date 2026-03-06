# Feature Specifications

This document describes each feature of the Expenses Dashboard application and its business rules.

---

## 1. Authentication

### What it does
Cookie-based login/logout system that works across both client components and server-side middleware.

### Rules
- Login requires **email** and **password** (`POST /sessions`).
- On success the API returns a `token` and `user` object. Both are stored in cookies.
- **Cookie settings**: name `auth_token`, expires in 7 days, path `/`, `secure: true` in production, `sameSite: lax`.
- **Route protection** (enforced by `middleware.ts`):
  - Authenticated user accessing `/` → redirect to `/sharedDashboard`.
  - Unauthenticated user accessing any other route → redirect to `/`.
- Logout clears all auth cookies and redirects to `/`.

---

## 2. Expense Creation

### What it does
A modal form that lets the user record a new expense with metadata linking it to a category, payment type, bank, and store.

### Fields

| Field | Required | Constraints |
|---|---|---|
| Description | Yes | Max 35 characters |
| Category | Yes | Must select from existing categories |
| Payment Type | Yes | Must select from existing payment types |
| Bank | Conditional | Required when the selected payment type has `has_statement: true` |
| Store | No | Optional |
| Date | Yes | ISO date |
| Amount | Yes | Decimal input (e.g. `99.99`), converted to cents before sending |
| Personal | No | Checkbox; marks expense as personal |
| Split | No | Checkbox; marks expense as split |

### Rules
- **Bank is mandatory** when the selected payment type has `has_statement: true`. The form validates this on submit with the error: *"Bank is required for this payment type"*.
- `Personal` and `Split` are mutually exclusive — at most one can be selected at a time.
- Amount is stored in cents: `Math.round(parseFloat(input) * 100)`.
- On success: the `expenses` and `balance` query caches are invalidated so all dashboard data refreshes automatically.

---

## 3. Personal Dashboard

### What it does
Displays the user's personal expenses alongside a single balance card.

### Rules
- Shows only expenses marked as **personal**.
- Default date range: first day → last day of the current month.
- Supports filtering, sorting, and pagination (see sections 6 and 7).
- Balance card shows a single total value.

---

## 4. Shared Dashboard

### What it does
Displays split/shared expenses alongside three balance cards: Incomes, Outcomes, and Total Balance.

### Rules
- Shows only expenses marked as **split**.
- Outcome amounts are prefixed with `"- "` to visually distinguish spending from income.
- Balance has three components returned by the API: `paying` (incomes), `payed` (outcomes), `total`.
- Supports the same filtering, sorting, and pagination as the personal dashboard.

---

## 5. Consolidated Balance Report

### What it does
A monthly report showing expenses broken down by requester and partner, with totals per payment type or category.

### Rules
- Requires selecting a **year** and **month**.
- Two view modes (toggle):
  - **By Payment Type**: shows each payment type with nested banks and their totals.
  - **By Category**: shows each category with its total.
- Displays three summary cards: requester total, partner total, and net balance.
- Requester and partner tables are shown side by side.

---

## 6. Expense Filtering

### What it does
A filter form on both dashboard pages that lets the user narrow the expense list by date range and entity type.

### Rules
- **Filter By** accepts one of: `category`, `payment type`, `bank`, `store`. Only one filter type can be active at a time.
- **Filter Value** is a dropdown populated from the API based on the selected filter type. It is disabled until a filter type is chosen.
- Changing the filter type resets the filter value.
- **Date constraints**: start date cannot be set after end date; end date cannot be set before start date. The inputs enforce this dynamically via `min`/`max` attributes.
- Submitting the filter form resets the table to **page 1**.
- UI filter names map to API field names:

  | UI | API |
  |---|---|
  | `categories` | `category` |
  | `paymentType` | `payment_type` |
  | `banks` | `bank` |
  | `stores` | `store` |

---

## 7. Expense Table & Sorting

### What it does
A paginated table listing expenses with support for column-based sorting and responsive column visibility.

### Columns
Description · Category · Amount · Payment Type · Due Date · Purchase Date · Bank · Store

### Sorting rules
- Clicking a column header sorts by that column ascending (`asc`).
- Clicking the same column again reverses to descending (`desc`).
- Clicking a different column resets to ascending on the new column.
- Sort indicators: `↑` (asc), `↓` (desc).

### Responsive visibility

| Breakpoint | Visible columns |
|---|---|
| Mobile (`< md`) | Description, Amount, Due Date, Purchase Date |
| Tablet (`md`) | + Category |
| Desktop (`lg`) | + Payment Type |
| Wide (`xl`) | All columns |

### Formatting
- Dates: `MM/DD/YYYY` on desktop, `MM/DD` on mobile.
- Amounts: formatted as Canadian Dollar (`en-CA` locale, e.g. `CA$150.99`).

### Pagination
- 8 items per page (offset/limit model).
- Page change: `offset = (page - 1) * 8`.

---

## 8. Management — Banks

### What it does
Full CRUD management for bank entities used to classify payment methods.

### Fields
- **Name** (string, required)

### Rules
- Banks appear in expense creation as an optional field (required only if the payment type has `has_statement: true`).
- Deleting a bank requires confirmation via a modal showing the bank name.
- Editing opens an inline modal pre-filled with the current name.
- Paginated list: 8 per page.
- API endpoints: `GET /banks`, `POST /banks`, `PATCH /banks/{id}`, `DELETE /banks/{id}`.

---

## 9. Management — Categories

### What it does
Full CRUD management for expense categories.

### Fields
- **Description** (string, required)

### Rules
- Same CRUD pattern as banks (create form, edit modal, delete confirmation).
- API endpoints: `GET /categories`, `POST /categories`, `PATCH /categories/{id}`, `DELETE /categories/{id}`.

---

## 10. Management — Payment Types

### What it does
Full CRUD management for payment type entities. Payment types carry a `has_statement` flag that influences expense creation behaviour.

### Fields
- **Description** (string, required)
- **Has Statement** (boolean, default `false`)

### Rules
- When `has_statement` is `true`, the **Bank** field becomes required on any new expense that uses this payment type.
- The edit modal exposes a checkbox to toggle `has_statement`.
- Deleting requires confirmation. Editing pre-fills both fields.
- API endpoints: `GET /paymentType`, `POST /paymentType`, `PATCH /paymentType/{id}`, `DELETE /paymentType/{id}`.

---

## 11. Management — Stores

### What it does
Full CRUD management for store entities that can be optionally linked to expenses.

### Fields
- **Name** (string, required)

### Rules
- Same CRUD pattern as banks.
- Store is always optional when creating an expense.
- API endpoints: `GET /stores`, `POST /stores`, `PATCH /stores/{id}`, `DELETE /stores/{id}`.

---

## 12. Data Formatting Rules

These rules apply globally across the application.

### Amounts
- **Storage**: integer cents (e.g. `15099` = $150.99).
- **Input**: decimal string from the user (e.g. `"150.99"`).
- **Conversion**: `Math.round(parseFloat(input) * 100)`.
- **Display**: Canadian Dollar format via `Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" })`.

### Dates
- **Storage**: ISO 8601 date string (e.g. `"2026-03-05"`).
- **Display (full)**: `MM/DD/YYYY` using `Intl.DateTimeFormat("en-US", { timeZone: "UTC" })`.
- **Display (short/mobile)**: `MM/DD`.

### Casing
- API responses use **snake_case** (e.g. `payment_type`, `created_at`).
- UI models use **camelCase** (e.g. `paymentType`, `createdAt`).
- Transformation happens in `src/lib/format-expense.ts` via entity-specific formatter functions.
