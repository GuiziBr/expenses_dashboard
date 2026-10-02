# Feature Spec: Balance Breakdown

| | |
|---|---|
| **Status** | Ready for development |
| **Route** | `/balanceBreakdown` |
| **API** | [`GET /balance/breakdown/:year/:month`](../APIs/balance.md#get-balancebreakdownyearmonth) |
| **Design** | `design.pen` → *[Section] Balance Breakdown*: *Balance Breakdown*, *Balance Breakdown (Mobile)*, *Balance Breakdown (Mobile) – Other Selected*, *Design Notes* |
| **Related** | [Feature Specifications](./features.md) · [Design System](../../DESIGN_SYSTEM.md) |

---

## 1. Overview

The Balance Breakdown page shows how the current user's **personal** spending for one month is split across a single grouping: **category**, **payment type**, **bank** or **store**. The page has three parts:

- summary cards
- a donut chart showing each item's share of the month
- a ranked legend with every item's amount and percentage

### Problem

Today the user can see a personal total (`GET /balance`) or filter the Personal Dashboard by one category, bank, etc. at a time. There is no way to answer *"where did my money go this month?"* at a glance without repeating the filter for every value.

### Goals

- Show the full split of a month's personal spending for one grouping, in a single request.
- Make the biggest spending areas obvious within seconds.
- Keep switching between groupings and months to a single tap.

### Non-goals

- Shared or partner expenses. These are covered by the Shared Dashboard and Consolidated Balance.
- Date ranges other than one calendar month.
- Comparing months (trends, month-over-month changes).
- Editing expenses from this page.

---

## 2. User Stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | user | see my personal spending for a month split by category | I know which categories cost me the most |
| US-02 | user | switch the grouping to payment type, bank or store | I can understand my spending from different angles |
| US-03 | user | move to the previous or next month, or pick any month | I can review past months or check upcoming dues |
| US-04 | user | tap a slice of the chart to see its exact amount and share | I get precise numbers without reading the whole list |
| US-05 | user | see every item, even small ones | no spending is hidden from me |

---

## 3. Page Anatomy

Listed top to bottom:

1. **Header**: the standard app header. The *Balance Breakdown* nav link is active (orange).
2. **Summary cards**: *Top {item}* · *{Items} count* · *Total spent* (orange).
3. **Controls**: grouping tabs (left) and month picker (right). On mobile they are stacked.
4. **Breakdown content**:
   - **Chart card**: donut chart, centre label, insight or hint line.
   - **Legend**: ranked rows, an *Other* group, and the *Show all* button.

---

## 4. Functional Requirements

Priority uses MoSCoW: **M** = Must, **S** = Should, **C** = Could.

### 4.1 Navigation

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Add a **Balance Breakdown** link to the desktop header after *Consolidated Balance*, and to the mobile menu. | M |
| FR-02 | The route `/balanceBreakdown` is protected by `middleware.ts` like every other authenticated route. | M |
| FR-03 | The selected grouping and month are stored in the URL (`?groupBy=category&month=2026-09`). Reloading, sharing the link, and back/forward all restore the same view. | S |

### 4.2 Controls

| ID | Requirement | Priority |
|---|---|---|
| FR-10 | Show four grouping tabs in this order: **Category**, **Payment type**, **Bank**, **Store**. On mobile the second tab label is shortened to **Payment**. | M |
| FR-11 | Exactly one tab is active at a time. The default is **Category**. | M |
| FR-12 | The month picker shows the selected month as `MMMM YYYY` (e.g. *September 2026*). The default is the **current month**. | M |
| FR-13 | Clicking the month field opens a native month picker (`<input type="month">`), the same control as Consolidated Balance. | M |
| FR-14 | The **◀ / ▶** buttons move the selection back or forward exactly one month and cross year boundaries correctly (Dec 2026 ▶ Jan 2027). | M |
| FR-15 | Changing the tab or the month **fetches the data immediately**. There is no Search button. | M |
| FR-16 | Changing the tab or the month clears any chart selection (see FR-40). | M |

### 4.3 Summary Cards

| ID | Requirement | Priority |
|---|---|---|
| FR-20 | **Top {item}** card shows the name of the rank-1 item, plus its amount and share. | M |
| FR-21 | **{Items}** card shows the number of items returned, with the subtitle *"with expenses this month"*. | M |
| FR-22 | **Total spent** card (orange) shows the sum of all returned totals, with the subtitle *"{Month YYYY} · personal expenses"*. | M |
| FR-23 | Card labels follow the active grouping (see BR-20). | M |

### 4.4 Donut Chart

| ID | Requirement | Priority |
|---|---|---|
| FR-30 | Render one slice per *own-slice* item plus at most one **Other** slice (see BR-10 to BR-14). | M |
| FR-31 | Slices start at 12 o'clock and run clockwise in ranked order. The *Other* slice is always last. | M |
| FR-32 | When nothing is selected, the centre shows **Total spent**, the formatted month total, and the month name. | M |
| FR-33 | Below the chart, desktop shows the insight line *"Top 3 {items} account for X% of the month"*. Mobile shows the hint *"Tap a slice to see its value"*. | S |
| FR-34 | The chart card has the title *"Share of month by {item}"*. | M |

### 4.5 Legend

| ID | Requirement | Priority |
|---|---|---|
| FR-35 | List **every** returned item in ranked order (highest total first). Each row shows a colour dot, the name, a percentage pill and the amount. | M |
| FR-36 | Own-slice rows use their slice colour. When an *Other* group exists, an **OTHER** subheader follows the own-slice rows, showing the item count, the group's share and its total. The remaining rows sit under it with light-gray dots. | M |
| FR-37 | Show at most **10 item rows** at first. If there are more than 10 items, show a **"Show all N {items}"** button that expands the list in place. Once expanded, it becomes **"Show less"**. | M |
| FR-38 | The expanded or collapsed state resets when the tab or month changes. | S |

### 4.6 Selection Interaction

| ID | Requirement | Priority |
|---|---|---|
| FR-40 | Tapping or clicking a **slice** or a **legend row** selects it. Only one selection is allowed at a time. | M |
| FR-41 | When something is selected:<ul><li>the selected slice grows outward by 8px</li><li>the other slices fade to 30% opacity</li><li>the centre shows the item **name**, **amount**, **share** and **rank** (e.g. *16.8% of the month · #2*)</li></ul> | M |
| FR-42 | Selecting the *Other* slice, the *OTHER* subheader, or any row inside the Other group selects **Other**. The centre then shows *Other*, the group total, its share and the item count, and every row in the group is highlighted. | M |
| FR-43 | The legend reflects the selection: the selected row(s) get an outline and the other rows fade to 55% opacity. | M |
| FR-44 | Tapping the selected slice or row again, tapping outside the chart and legend, or pressing **Esc** clears the selection. While something is selected, the hint reads *"Tap the slice again or tap outside to show the total"*. | M |
| FR-45 | Desktop only: hovering a slice or row previews its values in the centre. Clicking locks the selection. | C |

---

## 5. Business Rules

### 5.1 Data scope

| ID | Rule |
|---|---|
| BR-01 | Only **personal** expenses are included, using the same definition as `personalBalance` in `GET /balance`: the user's own personal or split expenses, plus other users' non-personal expenses. |
| BR-02 | An expense belongs to a month when its **due date** falls within that month (not its purchase date). |
| BR-03 | Items with no expenses in the month are **not returned** by the API and are never shown. The count card therefore reads *"with expenses this month"*. |
| BR-04 | The API returns items already **sorted by total, descending**. The client must not re-sort them. Rank = position in the response (1-based). |

### 5.2 Grouping into "Other"

| ID | Rule |
|---|---|
| BR-10 | Ranks **1–5** get their own slice and colour, with two exceptions: BR-11 and BR-12. |
| BR-11 | Rank 1 always gets its own slice. |
| BR-12 | A rank 2–5 item whose share is **below 4%** of the month goes into *Other*. Because the list is sorted, every item after it goes into *Other* too. |
| BR-13 | All remaining items are merged into a single **Other** slice. |
| BR-14 | *Other* is only created when it would contain **two or more** items. If exactly one item is left over, it gets its own light-gray slice labelled with its real name. |

In code terms: `ownSlices = ranks 1..k`, where `k = max(1, min(5, number of leading items with share ≥ 4%))`. If `count − k = 1`, the last item also gets its own slice.

### 5.3 Calculations

| ID | Rule |
|---|---|
| BR-15 | **Month total** = sum of all `total` values in the response. |
| BR-16 | **Share** = `item.total / monthTotal × 100`, shown with **one decimal** (e.g. `16.8%`). Shares above 0 but below 0.1% are shown as `<0.1%`. Rounded shares may not add up to exactly 100.0%, and that is acceptable. |
| BR-17 | **Other total** = sum of the grouped items' totals. **Other share** = `otherTotal / monthTotal × 100`. |
| BR-18 | The insight line's "Top 3" percentage = the sum of the rank 1–3 totals divided by the month total. It is only shown when there are **4 or more** items. |

### 5.4 Labels and naming

| ID | Rule |
|---|---|
| BR-20 | Labels depend on the active grouping: |

| Grouping (`filterBy`) | Tab label | Top card | Count card | Name field in API |
|---|---|---|---|---|
| `category` | Category | Top category | Categories | `description` |
| `payment_type` | Payment type (mobile: Payment) | Top payment type | Payment types | `description` |
| `bank` | Bank | Top bank | Banks | `name` |
| `store` | Store | Top store | Stores | `name` |

| ID | Rule |
|---|---|
| BR-21 | For `bank` and `store`, expenses without a bank or store come back as a single entry with `id: null` and `name: null`. Display it as **"No bank"** or **"No store"** in italic, using `text-iron-gray`. |
| BR-22 | The null entry behaves like any other item: it keeps its ranked position, counts towards the count card, can be the *Top* item, and can fall into *Other*. |

### 5.5 Colours

| ID | Rule |
|---|---|
| BR-30 | Own slices use these design tokens in rank order: `--orange`, `--blue-sky`, `--green`, `--pink`, `--light-blue`. |
| BR-31 | *Other*, and a single leftover item (BR-14), use `--light-gray`. |
| BR-32 | Colours are assigned by **rank**, not by item. The same category can have a different colour in different months. |

---

## 6. Data & API Integration

### Request

```
GET /balance/breakdown/{year}/{month}?filterBy={category|payment_type|bank|store}
```

- `month` is 1-indexed (January = `1`).
- Map UI grouping keys with the existing `FILTER_VALUES` table in [use-balance.ts](../../src/hooks/use-balance.ts) (`categories → category`, `paymentType → payment_type`, `banks → bank`, `stores → store`).

### Response (normalised in the client)

```ts
interface BreakdownItem {
  id: string | null
  label: string | null // from `description` (category, payment_type) or `name` (bank, store)
  total: number        // cents
}
```

### Query

| Aspect | Rule |
|---|---|
| Hook | `useBalanceBreakdown(year, month, filterBy)` in `src/hooks/`. |
| Query key | `["balance", "breakdown", year, month, filterBy]`. The `"balance"` prefix means the existing invalidation in [use-expenses.ts](../../src/hooks/use-expenses.ts) (create, edit, delete) automatically refreshes this page. |
| Stale time | `60_000` ms, matching `useConsolidatedBalance`. Going back to a tab or month already fetched reuses the cache. |
| Derived data | Grouping into Other, shares, counts and insight are computed in a **pure function** (e.g. `buildBreakdownView(items)`) so they can be unit-tested without React. |

### Formatting

- Amounts use the global `formatCurrency` from [format-currency.ts](../../src/lib/format-currency.ts) (`en-CA`, CAD). The mockups show `$` as a placeholder. See [Feature Specifications §12](./features.md#12-data-formatting-rules).
- All user-facing strings go in `src/constants/translations`.

---

## 7. UI States

| State | Trigger | Behaviour |
|---|---|---|
| **Loading** | First fetch, or a tab/month with no cache | Summary card values and legend rows show skeleton placeholders (`bg-muted animate-pulse`). The donut shows a gray ring. The controls stay usable. |
| **Refetching** | Cached data is being refreshed | Keep showing the cached data. No skeleton. |
| **Empty** | The API returns `[]` | Hide the chart card and legend and show the empty state: *"No personal expenses for {Month YYYY}."* The summary cards show `—`, and Total spent shows the formatted zero. |
| **Error** | Request fails (4xx/5xx or network) | Show the inline error state from the design system (`TriangleAlert`, *"Failed to load data. Please try again."*, **Retry** button). Never use a toast for page-level errors. |
| **Single item** | One item returned | The donut is a full ring in `--orange`. There is no Other group, no insight line, and no Show all button. |

Note: the loading, empty and error states are specified here but not yet drawn in `design.pen`.

---

## 8. Responsive & Scrolling Behaviour

| Area | Desktop (≥ `md`) | Mobile (< `md`) |
|---|---|---|
| Summary cards | Three in one row | Total spent full width, then Top and Count side by side |
| Controls | Tabs on the left, month picker on the right, one row | Tabs full width (icon above label), month picker full width below |
| Breakdown | Chart card (400px) on the left, legend filling the rest | Chart card full width, legend below |
| Sticky | The chart card sticks to the top while a long legend scrolls past it | The tabs and month strip stick under the header once the summary cards scroll away |
| Scrolling | Whole page | Whole page |

---

## 9. Accessibility

| ID | Requirement |
|---|---|
| A11Y-01 | The tabs use the `tablist`, `tab` and `tabpanel` roles with `aria-selected`, and support arrow-key navigation. |
| A11Y-02 | The ◀ / ▶ buttons have accessible names: *"Previous month"* and *"Next month"*. |
| A11Y-03 | The donut is decorative to screen readers (`aria-hidden`). The **legend is the accessible version of the chart**: each row is a `button` with `aria-pressed` that selects the item. |
| A11Y-04 | The centre label is an `aria-live="polite"` region, so selection changes are announced. |
| A11Y-05 | Every interactive element keeps the `focus-visible:ring-1 ring-ring` focus style (design system §18). |
| A11Y-06 | Colour is never the only signal. Each row always shows its name, percentage and amount as text. |

---

## 10. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | **One API call** per tab and month combination. No per-item requests. |
| NFR-02 | The chart and legend render smoothly with up to 100 items (the legend only shows 10 rows until expanded). |
| NFR-03 | Dark theme only, using design tokens only. No new raw hex colours (design system §18). |
| NFR-04 | Unit tests cover `buildBreakdownView` (BR-10 to BR-18, BR-21) and the hook's URL and parameters, following `use-balance.test.ts`. |

---

## 11. Acceptance Criteria

**AC-01: Default view**
- **Given** I am logged in
- **When** I open *Balance Breakdown*
- **Then** the *Category* tab is active, the month is the current month, and the page shows my personal spending by category.

**AC-02: Switching grouping**
- **Given** I am on the *Category* tab
- **When** I select *Bank*
- **Then** the data is fetched with `filterBy=bank` without pressing any button, and the labels read *Top bank* and *Banks*.

**AC-03: Month navigation**
- **Given** the selected month is *January 2027*
- **When** I press ◀
- **Then** the month becomes *December 2026* and the data for `2026/12` is loaded.

**AC-04: Other grouping**
- **Given** the response has 12 items and ranks 1–5 each have ≥ 4% share
- **When** the page renders
- **Then** the donut shows 5 coloured slices plus one light-gray *Other* slice, and the legend shows an *OTHER · 7 {items}* subheader.

**AC-05: Small-share rule**
- **Given** the rank-4 item has a 3.2% share
- **When** the page renders
- **Then**, if at least two items remain from rank 4 onward, rank 4 and all later ranks are grouped into *Other*. If rank 4 is the only leftover item, it gets its own light-gray slice with its real name.


**AC-06: Single leftover**
- **Given** 6 items are returned, all with share ≥ 4%
- **When** the page renders
- **Then** the 6th item gets its own light-gray slice with its real name, and there is no *Other* group.

**AC-07: Selecting a slice**
- **Given** no selection
- **When** I tap the *Restaurants* slice
- **Then** the centre shows *Restaurants*, its amount and *16.8% of the month · #2*, the other slices fade, and the *Restaurants* legend row is outlined.
- **When** I tap it again
- **Then** the centre goes back to *Total spent*.

**AC-08: Selecting Other from a row**
- **Given** *Pets* is inside the Other group
- **When** I tap the *Pets* row
- **Then** *Other* is selected and every row in the Other group is highlighted.

**AC-09: Long list**
- **Given** 14 items are returned
- **When** the page renders
- **Then** 10 rows are visible, followed by *Show all 14 categories*.
- **When** I press it
- **Then** all 14 rows are shown and the button reads *Show less*.

**AC-10: Null bank**
- **Given** the *Bank* tab and a response entry with `id: null`
- **When** the page renders
- **Then** that row reads *No bank* in italic gray, in its ranked position.

**AC-11: Cache refresh**
- **Given** I create an expense due this month
- **When** I come back to *Balance Breakdown*
- **Then** the totals include the new expense.

**AC-12: Empty month**
- **Given** the API returns `[]`
- **When** the page renders
- **Then** I see *"No personal expenses for {Month YYYY}."* and no chart.

---

## 12. Edge Cases

| Case | Expected behaviour |
|---|---|
| Month total is `0` but items are returned | Not expected from the API. Treat it as the Empty state and do not divide by zero. |
| All items below 4% | Rank 1 gets its own slice (BR-11). Everything else goes into *Other*. |
| Two items with the same total | Keep the API order. Ranks follow the response position. |
| Very long item names | Truncate with an ellipsis on one line. Show the full name in the centre label when selected. |
| The *Top* item is the null entry | The Top card shows *No bank* / *No store*. |
| Picker cleared (native input emptied) | Keep the previously selected month. Never send a request without a month. |
| Year below 1900 | Not selectable. The picker's `min` is `1900-01`, matching the API's minimum year. |

---

## 13. Out of Scope / Future Work

- **Drill-down**: clicking an item opens the Personal Dashboard filtered to that item and month.
- Month-over-month comparison per item.
- Custom date ranges.
- Exporting the breakdown (CSV / image).

---

## 14. Open Questions

| # | Question | Owner | Proposed default |
|---|---|---|---|
| Q1 | Should amounts use **Roboto** (per `DESIGN_SYSTEM.md` §6) or **Roboto Slab** (as in `design.pen`)? | Design | Roboto Slab, for consistency with existing screens |
| Q2 | Should the month picker allow **future months** (upcoming dues)? | Product | Yes, no upper bound |
| Q3 | Should the drill-down to the Personal Dashboard (§13) be part of v1? | Product | No, v2 |
| Q4 | Should the 4% small-share threshold and the 5-slice limit be configurable? | Product | No, keep them as constants |
| Q5 | Should the month field show a chevron to make it clearer that it opens a picker? | Design | Yes |
