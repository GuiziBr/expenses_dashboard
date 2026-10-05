# Implementation Plan: Balance Breakdown

Spec: [balance-breakdown.md](../specs/balance-breakdown.md) · API: [balance.md](../APIs/balance.md#get-balancebreakdownyearmonth) · Design: `design.pen` → *[Section] Balance Breakdown*

The page is built in small vertical tasks, bottom-up. Each task is one commit (or one small PR) that can be reviewed and QA'd on its own before the next one starts.

Branch: `feature/balance-breakdown-page` (off `development`).

---

## Decisions

| Topic | Decision |
|---|---|
| Amount font (spec Q1) | **Roboto Slab**, for consistency with existing screens |
| Future months (spec Q2) | **Allowed**, no upper bound. The picker keeps `min="1900-01"` only |
| Loading / empty / error states | Follow the design system's existing patterns (skeleton `bg-muted animate-pulse`, inline error with `TriangleAlert` + Retry) |
| Drill-down, configurable threshold (Q3, Q4) | Out of v1. The 4% and 5-slice values are constants |
| Chart implementation | **Hand-rolled SVG** (see below) |

### Chart options

There is no chart library in `package.json`.

| Option | Pros | Cons |
|---|---|---|
| **Hand-rolled SVG (recommended)** | No new dependency. Full control of the 8px slice grow, 30% fade, 12 o'clock start and single-item full ring. Easy to keep `aria-hidden` with the legend as the accessible version. Small and easy to read in review. | We write the arc math ourselves (~40 lines, unit-testable). |
| `d3-shape` (arc/pie helpers only) | Well-tested arc path maths, tiny, no React coupling. | New dependency for something that is a few lines. Still need our own SVG and interactions. |
| Recharts | Batteries included, popular. | Heavy for one donut. Custom active-slice growth, centre label and outside-click behaviour fight the library. Extra bundle size and another dependency to keep updated. |

The donut needs only static arcs plus our own selection state, so a library adds cost without saving much. Start with hand-rolled SVG. `d3-shape` can be added later if the arc maths becomes a burden.

---

## Tasks

| # | Task | Covers | How to validate |
|---|---|---|---|
| 1 | **Grouping logic.** Types and the pure `buildBreakdownView(items)` (Other grouping, shares, top 3, null labels). | BR-10 to BR-18, BR-21, NFR-04 | Read the tests. They are the spec in code (AC-04, AC-05, AC-06 and the edge cases). No UI to QA. |
| 2 | **Data layer.** `useBalanceBreakdown` hook, API call, query key `["balance","breakdown",year,month,filterBy]`, stale time 60s. | Spec §6 | Hook tests (URL, params, key), then one manual call against the real API. |
| 3 | **Route and shell.** `/balanceBreakdown`, middleware, desktop and mobile nav link, translations, URL state for `groupBy` and `month`. | FR-01 to FR-03 | Link shows as active, page is protected when logged out, reload and back/forward restore the view. |
| 4 | **Controls.** Grouping tabs, month picker, ◀ / ▶, fetch on change. Data is shown as a temporary raw list. | FR-10 to FR-16, AC-02, AC-03 | Network tab: one request per change. Dec → Jan rollover. A cleared picker keeps the month. |
| 5 | **Summary cards and page states.** Cards, loading, empty, error with retry. | FR-20 to FR-23, spec §7, AC-12 | Force each state (throttle, `[]`, a 500). Labels change per tab. |
| 6 | **Legend (static).** Ranked rows, OTHER subheader, Show all / Show less, "No bank" in italic. | FR-35 to FR-38, AC-09, AC-10 | Compare with the design. Use a month with more than 10 items. |
| 7 | **Donut chart (static).** Slices, colours, centre total, insight or hint line. | FR-30 to FR-34, AC-04 to AC-06 | Compare slice order and colours with the design. Try single-item and all-under-4% cases. |
| 8 | **Selection.** Slice and row selection, Other, fade and grow, clear on Esc or outside click, desktop hover. | FR-40 to FR-45, AC-07, AC-08 | Walk through the AC-07 and AC-08 scenarios by hand. |
| 9 | **Responsive, sticky and a11y polish.** Mobile layout, sticky chart and tabs, roles, `aria-pressed`, `aria-live`. | Spec §8, §9 | Resize to mobile, tab through with the keyboard, final pass over all ACs. |

### Why this order

- **Tasks 1 and 2 have no UI.** The riskiest logic is reviewed while it is small, and the tests catch mistakes early.
- **Task 4 renders raw data on purpose.** Fetching and URL behaviour can be checked before any chart exists.
- **The legend (6) comes before the chart (7).** The legend is the accessible version of the chart and is simpler to review.
- **Selection (8) comes last.** It touches both the chart and the legend, so both should be stable first.

---

## Working agreement

- Each task ends with: tests passing, lint and type checks clean, and a short note of what to QA.
- Pause after each task for review before starting the next.
- Conventional commits, one per task.
