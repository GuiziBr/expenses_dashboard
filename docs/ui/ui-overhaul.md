# UI Overhaul: Navigation Shell (Sidebar + Bottom Tabs)

| | |
|---|---|
| **Status** | Design mocked, not implemented |
| **Scope** | Header and menu. Content restyling is limited to the shared dashboard screen used as the mock |
| **Design** | Current UI: `design.pen`. New UI: `design_v2.pen` → *Dashboard / Desktop*, *Dashboard / Mobile* and their *(Dark)* versions |
| **Code today** | [`src/components/Header.tsx`](../../src/components/Header.tsx), rendered by each page |
| **Related** | [Design System](../../DESIGN_SYSTEM.md) · [Feature Specifications](../specs/features.md) |

---

## 1. Overview

Replace the full-width purple top bar with an app shell:

- **Desktop:** a left sidebar for navigation, plus a slim top bar inside the content area for the page title and page-level actions.
- **Mobile:** a bottom tab bar for the main destinations, plus a top bar with the page title and the user avatar.

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
| Primary action | One per page, in the top bar (*New expense*) | Floating button on desktop. |
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

Typography: **Inter** at 14px/500 for navigation and body, 26px/700 for the page title, 30px/600 for metric values. Radii: 8px for controls, 12px for cards. Orange is no longer used.

> **Differences from the current app.** [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) defines a **dark-only** UI with Roboto and Roboto Slab and orange as the only accent. The mock uses Inter and purple, and adds a light theme. The dark theme is the closest to today's look. See §11, questions 1 to 3.

## 7. Screens and components

Each screen exists in a light and a dark version in `design_v2.pen`, built from the same frames with the theme switched. Dark mock data and layout are identical.

### Desktop (1440px)

- **Sidebar (248px):** logo and app name, grouped nav items, user menu pinned to the bottom.
- **Top bar:** page title and subtitle, month picker, theme toggle, primary *New expense* button.
- **Content:** three metric cards (Balance highlighted), filter row (search, category, start and end date, *Search*), expenses table with category badges, pagination.

### Mobile (390px)

- **Top bar:** page title, month, avatar.
- **Content:** large Balance card, Incomes and Outcomes cards side by side, *Recent expenses* list with a *Filter* button.
- **Floating action button** (*New expense*) above the tab bar.
- **Bottom tab bar:** Shared, Personal, Balance, More.

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
| `< md` (below 768px) | Bottom tab bar and top bar. No sidebar |
| `md` to `lg` | Collapsed icon-rail sidebar (to be designed) |
| `≥ lg` | Full sidebar |

The current code switches at `md`, so the mobile and desktop split stays where it is.

## 9. Accessibility

- Text and icon contrast of at least 4.5:1 (3:1 for large text and UI borders). Check `muted` on `bg` and the white-on-`primary` balance card in both themes. The dark values have not been measured yet.
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
| 2 | **Tokens.** Add the new colours and the font to `globals.css`. | Depends on the theme decision (§11, Q1). |
| 3 | **`AppSidebar`.** Desktop sidebar built from the config, with active state via `usePathname`, `aria-current`, and the user menu using the existing `DropdownMenu`. | Reuse `signOut` from `useAuth`. |
| 4 | **`BottomTabBar` and More sheet.** | `src/components/ui/sheet.tsx` already exists. |
| 5 | **Shared layout.** A route-group layout (for example `src/app/(app)/layout.tsx`) that renders the shell once. Move the 8 pages under it and remove `<Header />` from each. | `/` and the login page stay outside the group. This is the riskiest step because it moves files. |
| 6 | **Top bar.** Page title from the existing `PAGE_TITLES` map, plus the slot for page actions. | |
| 7 | **Restyle the shared dashboard.** Metric cards, filters, table. | Then roll out to the other pages. |
| 8 | **Remove `Header.tsx`** and update tests. | Add tests for the active state, the nav config and logout. |

Existing tools: Tailwind v4, shadcn/ui with Radix, `lucide-react`, and `sheet.tsx` and `dropdown-menu.tsx` in `src/components/ui`.

## 11. Open questions

1. **Theme:** both themes are mocked. Keep dark-only (as `DESIGN_SYSTEM.md` states today), or support light and dark with a toggle? The toggle in the top bar is drawn, but the app has no theme switching now (the `<html>` element is always `dark`). Supporting both means a user preference and a persisted choice. `DESIGN_SYSTEM.md` needs updating either way.
2. **Fonts:** switch to Inter or keep Roboto and Roboto Slab for amounts, as the Balance Breakdown plan decided?
3. **Brand colour:** drop orange, or keep it as a secondary accent for the balance highlight?
4. **Mobile tab label:** *Balance* for Consolidated Balance, or use its full name?
5. **Tablet:** is the icon-rail sidebar worth building now?
6. **Sidebar collapse on desktop:** user-controlled or fixed?

## 12. Out of scope

The tablet rail, loading/empty/error states for the new screens, notification or search entries in the top bar, and the content of other pages beyond the shell.

## 13. Changelog

| Date | Change |
|---|---|
| 2026-10-08 | First draft from `design_v2.pen` mock |
| 2026-10-08 | Added dark theme tokens and dark screen mocks |
