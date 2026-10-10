# UI Overhaul: Navigation Shell (Sidebar + Bottom Tabs)

| | |
|---|---|
| **Status** | Implemented: all nine tasks done and the light/dark switch is live (see §10 and §12). Remaining follow-ups are in §12 |
| **Scope** | Header and menu, plus the restyle of the Shared and Personal dashboards (task 7). The other pages followed in task 8 |
| **Design** | Current UI: `design.pen`. New UI: `design_v2.pen` (on the `feature/theme` branch) → *Dashboard / Desktop*, *Dashboard / Mobile* and their *(Dark)* versions |
| **Code today** | Shell in `src/app/(app)/layout.tsx`. The old `Header.tsx` was removed in task 9 |
| **Related** | [Design System](../../DESIGN_SYSTEM.md) · [Feature Specifications](../specs/features.md) |

---

## 1. Overview

Replace the full-width purple top bar with an app shell:

- **Desktop:** a left sidebar for navigation, plus a slim top bar inside the content area for the page title and page-level actions.
- **Mobile:** a bottom tab bar for the main destinations, plus the same top bar with the page title and, on month pages, the month picker.

No routes, API calls or business logic change.

## 2. Motivation

Findings from reviewing `design.pen` and `Header.tsx`:

| # | Problem | Evidence |
|---|---|---|
| 1 | Weak active state | The active link is only recoloured orange (`#ff872c`) on purple (`#5636d3`), which has poor contrast. |
| 2 | Heavy header | A saturated full-width bar with 32px vertical padding competes with the content. |
| 3 | Flat navigation | Four equal links with no icons or grouping. Management is hidden in a dropdown. |
| 4 | No identity or user context | No logo, name or avatar. Logout is a top-level item that is easy to hit by accident. |
| 5 | Mobile needs a menu to move around | The hamburger hides all four dashboards behind a dropdown. |
| 6 | Duplicated markup | `Header.tsx` repeats the same link block for desktop and mobile, and the `<Header />` is rendered separately in 8 pages. |
| 7 | Inconsistent menus | The mobile menu omits **Stores**, which the desktop dropdown has. |

## 3. Goals and non-goals

**Goals**

- Make navigation scale when more pages are added.
- Show the current page clearly, with accessible contrast.
- Give the shell an identity (logo, user) and a safe place for Logout.
- Keep one navigation definition shared by desktop and mobile.
- Render the shell once in a layout, not once per page.

**Non-goals**

- Changing data fetching, forms, tables or the Balance Breakdown chart.
- Adding new pages.
- A full visual rebrand beyond the tokens in §6.

## 4. Decisions

| Topic | Decision | Alternatives considered |
|---|---|---|
| Desktop navigation | **Left sidebar** | **B**: a slim top bar with tabs (smaller change, but does not scale and keeps Management hidden). |
| Mobile navigation | **Bottom tab bar** with 4 tabs | Hamburger menu (today). Needs two taps to switch pages. |
| Overall approach | **Hybrid (C):** sidebar on desktop, bottom tabs on mobile | **A**: sidebar only, which would still need a mobile pattern. |
| Primary action | One per page, in the top bar (*New expense*); a floating button on mobile | Keeping the button inside the filter row, as before. |
| Month selection | A month picker in the top bar, shared by the Shared and Personal dashboards and Balance Breakdown, kept in the URL as `?month=YYYY-MM` | Dropping the picker and keeping only the date inputs (**A**). Replacing the date inputs with the picker (**C**). |
| Logout | Inside the user menu | Top-level button. |

Trade-off accepted: the sidebar takes about 248px of width on desktop.

## 5. Navigation structure

### Desktop sidebar

| Group | Item | Route | Icon (Lucide) |
|---|---|---|---|
| Dashboards | Shared Dashboard | `/sharedDashboard` | `users` |
| Dashboards | Personal Dashboard | `/personalDashboard` | `user` |
| Reports | Consolidated Balance | `/consolidatedBalance` | `scale` |
| Reports | Balance Breakdown | `/balanceBreakdown` | `chart-pie` |
| Manage | Management (expandable) | `/management/banks`, `/categories`, `/paymentTypes`, `/stores` | `settings-2` |

Bottom of the sidebar: user menu (avatar, name) containing **Log out**.

### Mobile bottom tabs

| Tab | Route | Icon |
|---|---|---|
| Shared | `/sharedDashboard` | `users` |
| Personal | `/personalDashboard` | `user` |
| Balance | `/consolidatedBalance` | `chart-pie` |
| More | opens a sheet | `ellipsis` |

The **More** sheet holds **Balance Breakdown**, the four **Management** pages and **Log out**. The tab labelled *Balance* points to Consolidated Balance. If that name confuses users next to *Balance Breakdown*, rename it during implementation (see §11).

### Month selection

Before the overhaul the dashboards had no month concept: they held a `startDate` and `endDate`, defaulting to the current month, edited with the two date inputs in the filter row. Balance Breakdown had its own month picker. The top bar now has one month picker for three pages.

| Page | Month picker | Behaviour |
|---|---|---|
| Shared Dashboard, Personal Dashboard | Yes | Picking a month sets the start and end date to the first and last day of that month and goes back to page 1. The date inputs in the filter row follow the picker. |
| Balance Breakdown | Yes | The picker that used to sit in the page's controls moved to the top bar. The group-by tabs stay in the page. |
| Consolidated Balance, Management | No | Consolidated Balance keeps its own required month field and *Search* button. |

How it works:

- **The URL is the source of truth.** The month lives in `?month=YYYY-MM`, read and written by `useSelectedMonth()`. It survives a refresh and back/forward (each change is a history push), and other query params such as `groupBy` are kept. A missing or invalid value means the current month.
- **The month is shared between pages.** The sidebar, the tab bar and the More sheet use `MonthAwareLink`. A link to Shared, Personal or Balance Breakdown keeps the current `?month=`, so the month stays the same when you switch between those pages.
- **Custom ranges still work.** If the user applies dates in the filter row that are not one whole calendar month, the picker shows **Custom range** instead of a month name. Picking another month (arrows or the month input) goes back to a whole month.
- **The page owns the range.** The dashboard keeps its `startDate` and `endDate` state and resets it when the month changes. It tells the top bar when the range is custom through `useCustomRangeIndicator`.

Known limits:

- The month is not remembered across Consolidated Balance or Management, because those pages do not use `?month=`. Coming back to a dashboard from them starts at the current month.
- Picking the same month that is already selected while a custom range is showing does nothing. Use an arrow to reset it.

## 6. Design tokens (from `design_v2.pen`)

Defined as variables in the design file with a `mode` theme (light and dark). The dark values keep the page and card colours from [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) (`#312e38` background, `#232129` cards, cream text).

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F6F6FA` | `#312E38` | Page background, table header row, badges |
| `surface` | `#FFFFFF` | `#232129` | Sidebar, cards, inputs |
| `border` | `#E6E6EF` | `#3C3946` | 1px borders and dividers |
| `ink` | `#15152B` | `#F4EDE8` | Primary text |
| `muted` | `#6B6B82` | `#A29DAE` | Secondary text, inactive icons |
| `primary` | `#5636D3` | `#6C4CF0` | Fills: primary button, balance card, current page number. The only accent |
| `primary-text` | `#5636D3` | `#B9ABFF` | Purple text and icons on light or tinted backgrounds (active nav item, avatar initials, active tab) |
| `primary-soft` | `#EEEAFC` | `#2F2760` | Active nav pill, avatar background |
| `success` / `success-soft` | `#12875A` / `#E3F5EC` | `#3DD68C` / `#173A2B` | Incomes, positive amounts |
| `danger` / `danger-soft` | `#D23B3B` / `#FCE9E9` | `#FF7D7D` / `#4A2226` | Outcomes, negative amounts |

`primary` and `primary-text` are separate because one purple cannot work both as a fill behind white text and as text on a dark surface.

### How the tokens map to code

The design tokens are CSS variables in `src/app/globals.css`: light values in `:root`, dark values in `.dark`. Names that already existed as shadcn variables are reused instead of duplicated.

| Design token | CSS variable | Tailwind utility |
|---|---|---|
| `bg` | `--background` | `bg-background` |
| `surface` | `--card` | `bg-card` |
| `border` | `--border` | `border-border` |
| `ink` | `--foreground` | `text-foreground` |
| `muted` | `--muted-foreground` | `text-muted-foreground` |
| `primary` | `--primary` | `bg-primary` |
| `primary-text` | `--primary-text` (new) | `text-primary-text` |
| `primary-soft` | `--primary-soft` (new) | `bg-primary-soft` |
| `success`, `success-soft` | `--success`, `--success-soft` (new) | `text-success`, `bg-success-soft` |
| `danger`, `danger-soft` | `--danger`, `--danger-soft` (new) | `text-danger`, `bg-danger-soft` |

**Applied with the dashboard restyle (task 7).** Dark `--primary` and `--ring` are now the mock's purple (`#6c4cf0`), so both themes share one accent. The restyled components use the semantic tokens (`bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`, and so on) instead of fixed colours.

**Still different from the mock.**

- The font stays Roboto and Roboto Slab (open question 2). Inter is not loaded yet.
- The Balance Breakdown chart keeps its categorical slice colours (`--orange`, `--blue-sky`, `--green`, `--pink`, `--light-blue`, `--light-gray`). They are data colours, not the accent, and they are the same in both themes. The purple slice (`--light-blue`) has low contrast on the dark card, see §12.
- The chart palette and the Sonner toast colours are not token-driven. Toasts use Sonner's own light and dark "rich" colours and are legible in both themes.

### Theme switching

The switch is live. Users choose Light or Dark and the choice is remembered.

- `src/lib/theme.ts` holds the theme helpers and the inline script that sets the `dark` class before first paint, so a stored light choice does not flash dark.
- `src/providers/theme-provider.tsx` exposes `useTheme()` (`theme`, `setTheme`, `toggleTheme`). The first render always uses the default (dark), so it matches the server. A layout effect then reads the stored choice before the browser paints, so the toggle icon and the toast theme are right on the first frame.
- From `lg` the switch is a **Theme** item in the sidebar user menu, above Log out. Below `lg` it is a **Theme** row in the More sheet, above Log out. Both stay open when used, so the change is visible straight away. It is in the same place on every page; the top bar no longer has a toggle, because its contents change per page.
- `src/components/ui/sonner.tsx` passes the active theme to Sonner, so toasts follow it.
- Default is dark. The choice is stored in `localStorage` under `theme`. There is no "follow the system" option.

Contrast fixes made when the switch went live:

- Light `--input` is a mid grey (`#8a8aa3`, 3.4:1 on white) and every input-like control uses `border-input`. Dark `--input` is the old dark border colour, so dark looks the same.
- Dark `--ring` is the light purple (`#b9abff`, 6.5:1). Dark `--destructive` is slightly darker (`#d4344f`, white text 4.8:1), and error text, icons and the Log out row use the `danger` token, which reads well on both themes.
- The total-card label is at 90% opacity. The login logo is inverted in dark.

Typography: **Inter** at 14px/500 for navigation and body, 26px/700 for the page title, 30px/600 for metric values. Radii: 8px for controls, 12px for cards. Orange is no longer used on the restyled screens.

> **Differences from the mock.** The mock uses Inter. The app keeps Roboto and Roboto Slab (§11, Q2). Light and dark both ship, with dark as the default.

## 7. Screens and components

Each screen exists in a light and a dark version in `design_v2.pen`, built from the same frames with the theme switched. Dark mock data and layout are identical.

### Desktop (1440px)

- **Sidebar (248px):** logo and app name, grouped nav items, user menu pinned to the bottom. The menu shows the user's picture from the API's `avatar` URL, or their initials when there is none or it fails to load.
- **Top bar:** page title, month picker, theme toggle, primary *New expense* button.
- **Scrolling:** from `lg` the page scrolls inside the content area beside the sidebar, not the whole window. On the dashboards and the four management lists the table card scrolls on its own, with the header row pinned, so the cards, filters and pagination stay in view. Below `lg` the whole page scrolls as usual.
- **Content:** three metric cards (Balance highlighted), filter row (search, category, start and end date, *Search*), expenses table with category badges, pagination.

### Mobile (390px)

- **Top bar:** page title and the month picker below it. The user menu is in the More sheet.
- **Content:** large Balance card, Incomes and Outcomes cards side by side, *Recent expenses* list with a *Filter* button.
- **Floating action button** (*New expense*) above the tab bar.
- **Bottom tab bar:** Shared, Personal, Balance, More.

### Differences between the build and the mock

- The mock has a subtitle under the page title ("October 2026 · Shared with 2 people"). It is not built: the month is in the picker and the app has no data for the number of people.
- The mock's month picker is a single "Oct 2026" chip. The build adds previous/next arrows and a native month input, reusing the Balance Breakdown picker's behaviour. On mobile it sits under the title, which the mobile mock does not show.
- The mock's mobile top bar has an avatar. The build has no avatar there, since the user menu is in the More sheet.
- The theme switch is a Theme item in the sidebar user menu (and a row in the More sheet below 1024px), not a button in the top bar.
- The *New expense* button moved out of the filter row into the top bar. On mobile it is the floating button.

- The mock's metric cards show a delta ("+8% vs last month"). It is not built, because the app has no previous-month figures.
- On mobile the mock shows the expenses as a two-line list. The build keeps the table with fewer columns (expense, amount, due, purchase).
- The mock uses Inter. The build keeps Roboto and Roboto Slab (§11, Q2).
- Icons on the cards follow the mock (arrow down-left for incomes, arrow up-right for outcomes, wallet for the balance).

### Reusable components in the design file

| Component | Purpose | States |
|---|---|---|
| Nav Item | Sidebar link | Default |
| Nav Item / Active | Current page | Active (tinted pill, primary text) |
| Metric Card | Income, outcome and balance figures | Icon chip, label, value, delta |

States not yet designed: hover, focus, pressed, expanded Management, open user menu, open More sheet, loading, empty, error, collapsed icon rail (tablet).

## 8. Responsive behaviour

| Breakpoint | Navigation |
|---|---|
| `< md` (below 768px) | Bottom tab bar. No sidebar |
| `md` to `lg` | Bottom tab bar, same as mobile, until the icon-rail sidebar is designed |
| `≥ lg` (1024px and up) | Full sidebar |

The old header switched at `md`. The shell switches at `lg` instead, so tablets in portrait keep a usable content width.

## 9. Accessibility

- Text and icon contrast of at least 4.5:1 (3:1 for large text and UI borders). Check `muted` on `bg` and the white-on-`primary` balance card in both themes. The contrast of both themes was measured against these targets when the switch went live, and the fixes are listed in §6. Known exceptions: dark input borders (about 1.5:1), the chart palette, and muted text on `accent` hover states in light (about 4.4:1).
- Wrap navigation in `<nav aria-label="Main">` and mark the current page with `aria-current="page"`. Today the active link has no programmatic marker.
- Visible focus ring on all nav items, tabs and buttons.
- Keyboard: tab through items in order, Enter or Space opens the user menu and the More sheet, Esc closes them.
- Tab bar targets of at least 44×44px.
- Do not rely on colour alone for income and expense: amounts carry a `+` or `-` sign.

## 10. Implementation plan

Suggested order, one small PR each. Branch off `development`.

| # | Task | Notes |
|---|---|---|
| 1 | **Navigation config.** A single typed list of groups and items (label from `translations`, route, icon). | Removes the duplicated markup in `Header.tsx` and fixes the missing Stores entry on mobile. |
| 2 | **Tokens and theme switching.** Light and dark tokens in `globals.css`, a theme provider, a no-flash script and a theme switch. Done, see §6. | The toggle was first shown disabled with a "Coming soon" tooltip. It was enabled in a follow-up, see §12. The font change waits for §11, Q2. |
| 3 | **`AppSidebar`.** Desktop sidebar built from the config, with active state via `usePathname`, `aria-current`, and the user menu using the existing `DropdownMenu`. Done: `src/components/AppSidebar.tsx`. | Not mounted yet. Task 5 puts it in the shared layout, and it is hidden below `lg` there. Reuses `signOut` from `useAuth`. The Management section is collapsed unless the current page is under `/management`. |
| 4 | **`BottomTabBar` and More sheet.** Done: `src/components/BottomTabBar.tsx`, tab and More config in `src/lib/navigation.ts`. | Uses `src/components/ui/sheet.tsx` as a bottom sheet. Not mounted yet. Task 5 renders it below `md`. The tab labelled *Balance* still points to Consolidated Balance (§11, Q4). |
| 5 | **Shared layout.** Done: `src/app/(app)/layout.tsx` renders the shell once. The 8 pages moved under the `(app)` route group (URLs unchanged), and `<Header />`, the purple band and the `-mt-24` overlap were removed from each. | `/` (login) stays outside the group. The sidebar shows from `lg`, the tab bar below `lg`. `Header.tsx` was left unused and is removed in task 9. |
| 6 | **Top bar and month selection.** Done. `src/components/TopBar.tsx` shows the page title (`h1`), the month picker, the theme toggle and the *New expense* action. Month state is in the URL (`src/hooks/use-selected-month.ts`) and shared by the Shared and Personal dashboards and Balance Breakdown, see §5. | `MonthPicker`, `NewExpenseAction`, `MonthAwareLink` and a small page-toolbar context are new. `FilterForm` lost its *New expense* button and now follows the month. Balance Breakdown's own month controls were removed. |
| 7 | **Restyle the dashboards.** Done. `BalanceCard` (icon chip, tones, mobile order), `ExpenseTable` (card, uppercase header, category badge, keyboard-sortable headers with `aria-sort`), `Pagination`, the filter row and the shared `Input`/`Select`. The dashboards use the semantic tokens and the dark accent is now purple, see §6. | Shared and Personal get it through the shared components. `ui/input.tsx` and `ui/select.tsx` are restyled for the whole app, so forms and modals pick up the new look too. `BalanceCard`'s `iconClassName` prop became `tone`. |
| 8 | **Roll out to the other pages.** Done, in five commits: Consolidated Balance (filters and report cards), Balance Breakdown (summary cards, chart panel, legend, group-by tabs), the four management pages (tables, forms, edit and confirm-delete dialogs), the new-expense dialog with the checkbox group, toasts and loader, and the login form. Every fixed colour (`bg-orange`, `text-white`, `text-light-gray`, `container-background`, and so on) outside the old `Header.tsx` and the chart palette was replaced with a token. | The app now has one accent (purple). Buttons use the default and outline variants instead of per-button colours. Checked visually in dark on desktop with fake data for each group. Light mode was only checked on the dashboards (task 7). |
| 9 | **Remove `Header.tsx`** and update tests. Done: the file is deleted, and `getFirstDayOfMonth`, which the month selection made unused, went with it. | The tests the plan asked for already exist from the earlier tasks: active state and logout in `AppSidebar.test.tsx` and `BottomTabBar.test.tsx`, and the nav config in `navigation.test.ts`. No new tests were needed. |

Existing tools: Tailwind v4, shadcn/ui with Radix, `lucide-react`, and `sheet.tsx` and `dropdown-menu.tsx` in `src/components/ui`.

## 11. Open questions

1. ~~**Theme.**~~ **Decided:** light and dark with a toggle, dark by default. `DESIGN_SYSTEM.md` still describes a dark-only app and needs updating when the restyle lands.
2. **Fonts:** switch to Inter or keep Roboto and Roboto Slab for amounts, as the Balance Breakdown plan decided?
3. ~~**Brand colour.**~~ **Done in task 8:** orange is gone from every screen except the chart palette. Say so if you want it back as a secondary accent.
4. **Mobile tab label:** *Balance* for Consolidated Balance, or use its full name?
5. **Tablet:** is the icon-rail sidebar worth building now?
6. **Sidebar collapse on desktop:** user-controlled or fixed?
7. **Month on other pages:** should Consolidated Balance and Management also carry the selected month, so it survives a visit to them?

## 12. Pending items

### Theme switching (done) and what is left

The switch is live (see §6). The steps that were pending are done:

- Light mode was checked visually on the dashboards, Consolidated Balance, Balance Breakdown, the management pages, the dialogs, toasts and the login page.
- Contrast was measured and the fixes are in §6.
- The switch is in the sidebar user menu (desktop) and the More sheet (below 1024px), and the disabled state and "Coming soon" tooltip are gone.
- `DESIGN_SYSTEM.md` was updated.

Still open, none of it blocks the switch:

1. **Chart palette.** The slice colours (`--orange`, `--blue-sky`, `--green`, `--pink`, `--light-blue`, `--light-gray`) are the same in both themes. The purple slice is about 2.2:1 on the dark card and orange about 2.4:1 on the light card. Move to theme-aware `--chart-*` tokens.
2. **Login photo.** The same bright photo is used in both themes. A themed overlay would settle it.
3. **`global-error.tsx`** renders its own `<html className="dark">` without the init script, so a light user who hits a root error sees dark.
4. **Overlays.** The dialog and sheet scrims use a literal `bg-black/50`. A token would be cleaner.
5. **Cross-tab sync.** Changing the theme in one tab does not update other open tabs until they reload.
6. **Dead variables.** The legacy colour variables and `@theme` aliases in `globals.css` that no component uses can be deleted.
7. **"Follow the system theme".** Not planned. It would add a third choice and a `prefers-color-scheme` listener.
8. **Muted text on hover.** `text-muted-foreground` on `accent` hover states in light is about 4.4:1.

### Other pending items

- Inter font (§11, Q2).
- Tablet icon-rail sidebar (§11, Q5).
- Designs for the states listed at the end of §7.
- Updating `design_v2.pen` to match the top bar as built (see *Differences between the build and the mock* in §7).

## 13. Out of scope

The tablet rail, loading/empty/error states for the new screens, notification or search entries in the top bar, and the content of other pages beyond the shell.

## 14. Changelog

| Date | Change |
|---|---|
| 2026-10-08 | First draft from `design_v2.pen` mock |
| 2026-10-08 | Added dark theme tokens and dark screen mocks |
| 2026-10-08 | Theme toggle mounted disabled with a "Coming soon" tooltip; added Pending items section |
| 2026-10-09 | The theme switch moved from the top bar to the sidebar user menu so it stays in one place |
| 2026-10-09 | Light/dark switch enabled: toggle works on desktop and mobile, first-render flicker fixed, light input borders and dark focus/error contrast improved, logo visible in dark |
| 2026-10-09 | The user menu shows the API avatar picture, with initials as the fallback |
| 2026-10-09 | On desktop the list tables scroll inside their card instead of the whole page |
| 2026-10-09 | Task 9 implemented: `Header.tsx` removed. All nine tasks are done |
| 2026-10-09 | Task 8 (rollout) implemented in five commits: Consolidated Balance, Balance Breakdown, management, dialogs and toasts, login |
| 2026-10-09 | Task 7 (dashboard restyle) implemented; dark accent switched to purple; the rollout to other pages became task 8 and removing `Header.tsx` became task 9 |
| 2026-10-08 | Task 6 (top bar and month selection) implemented; month picker shared by the dashboards and Balance Breakdown |
| 2026-10-08 | Task 5 (shared layout) implemented; sidebar and tab bar are now live |
| 2026-10-08 | Task 4 (`BottomTabBar` and More sheet) implemented, not yet mounted |
| 2026-10-08 | Task 3 (`AppSidebar`) implemented, not yet mounted |
| 2026-10-08 | Task 1 (navigation config) and task 2 (tokens and theme switching) implemented; theme question decided |
