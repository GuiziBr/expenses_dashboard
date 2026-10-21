# Design System Reference

This document is the source of truth for the visual design of this application. It is intended to be provided to an AI assistant (or a new developer) building UI that should match the app's look and feel.

The tokens live in `src/app/globals.css`. When this document and that file disagree, the file wins. The history of the navigation, theming and restyle work is in [docs/ui/ui-overhaul.md](docs/ui/ui-overhaul.md).

A Pencil version of this system, with the tokens as variables, reusable components, templates and mapping tables, is in `design_V3.pen`. It uses generic names for the app's components: Stat Card is `BalanceCard`, Data Table is `ExpenseTable`, Select is `SelectMenu`, Chart set is `BreakdownChart` and `BreakdownLegend`. Section 15 lists the components that exist only there.

---

## 1. Design Philosophy

A professional, data-dense interface for financial dashboards, in **light and dark themes**. Dark is the default; users switch with the toggle.

- **Tokens, not colours.** Every colour in a component comes from a semantic token (`bg-card`, `text-muted-foreground`, `border-input`, `bg-primary`). Components never use raw hex values, Tailwind palette colours (`text-white`, `bg-slate-200`) or `dark:` variants. The theme changes by redefining the tokens under `.dark`.
- **One accent.** Purple (`--primary`) is the only action colour: primary buttons, the current page number, the active nav item, focus rings, the total card.
- **Layered surfaces.** A page background (`--background`), cards and inputs on `--card`, subtle borders (`--border`), and tinted fills for state (`*-soft`).
- **Legibility first.** The target is WCAG contrast (4.5:1 for text, 3:1 for control boundaries) in both themes, and every permitted component pairing meets it. There are two exceptions. The chart palette does not change with the theme. And `--input` on `--background` in dark is 2.6:1, so input-like controls and outline buttons sit on `--card`, never on `--background`. Section 5 has the measurements.

---

## 2. Technology Stack

| Concern | Library / Tool |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme` in `globals.css`) |
| Component primitives | shadcn/ui + Radix UI |
| Component variants | Class Variance Authority (CVA) |
| Icons | lucide-react (primary), react-icons (a few legacy form icons) |
| Toasts | Sonner |
| Forms | react-hook-form + Zod |
| Data fetching | TanStack Query (React Query) |

---

## 3. Project Setup

1. Create a Next.js app with the App Router and init shadcn/ui (New York style).
2. Copy `src/app/globals.css` from this repository. It defines the tokens (light in `:root`, dark in `.dark`), the radius scale and the Tailwind bridge (`@theme`).
3. Load the fonts and wire up the theme in `src/app/layout.tsx`:

```tsx
import { Roboto, Roboto_Slab } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { THEME_INIT_SCRIPT } from "@/lib/theme"
import { ThemeProvider } from "@/providers/theme-provider"

const robotoSlab = Roboto_Slab({ variable: "--font-roboto-slab", subsets: ["latin"] })
const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"] })

<html lang="en" className="dark" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
  </head>
  <body className={`${robotoSlab.variable} ${roboto.variable} antialiased`}>
    <ThemeProvider>
      {children}
      <Toaster position="top-center" expand={true} richColors />
    </ThemeProvider>
  </body>
</html>
```

- `className="dark"` is only the server default. The inline script (`THEME_INIT_SCRIPT`) runs before first paint and sets or removes the `dark` class from `localStorage["theme"]`, so a saved light choice never flashes dark. `suppressHydrationWarning` on `<html>` covers that class change.
- `ThemeProvider` exposes `useTheme()` (`theme`, `setTheme`, `toggleTheme`). Its first render uses the default so it matches the server, then a layout effect reads the saved choice before paint.
- `Toaster` reads the theme from `useTheme()`, so it must be inside `ThemeProvider`.

---

## 4. Theming

### How it works

`:root` holds the light values and `.dark` overrides them. Tailwind utilities read the variables through `@theme` (`--color-card: var(--card)` and so on). The custom variant `@custom-variant dark (&:is(.dark *))` exists, but components should not need it.

`color-scheme` is set per theme, so native controls (date and month pickers, scrollbars) follow the theme.

### Switching

- From `lg`: a **Theme** item in the sidebar user menu, above Log out. It keeps the menu open.
- Below `lg`: a **Theme** row in the More sheet of the bottom tab bar, above Log out. It does not close the sheet.
- The choice is stored in `localStorage` under `theme` (`"light"` or `"dark"`). Anything else means the default (dark). There is no "follow the system" option.

### Rules for components

1. Use semantic tokens only. Need a new colour? Add a token to both `:root` and `.dark` and bridge it in `@theme`.
2. **Input-like controls** (inputs, selects, date fields, checkbox groups, the month picker) use `border-input`, not `border-border`. `--input` is the border colour that meets 3:1 on `--card` in both themes. On `--background` it meets 3:1 in light (3.1:1) but not in dark (2.6:1), so keep input-like controls on `--card`.
3. **`primary` vs `primary-text`.** `bg-primary` is a fill that carries white text. For purple *text or icons* on a page or tinted surface use `text-primary-text`.
4. **`destructive` vs `danger`.** `bg-destructive` is a fill with `text-destructive-foreground`. For red *text, icons or borders* use `text-danger` / `border-danger`; it stays readable on dark cards.
5. State fills use the `*-soft` tokens (`bg-success-soft`, `bg-danger-soft`, `bg-primary-soft`) with the matching strong colour for text.
6. Check every new screen in **both** themes, on desktop and on a 390px-wide phone.

---

## 5. Colour Reference

### Semantic tokens

| Token | Tailwind | Light | Dark | Use |
|---|---|---|---|---|
| `--background` | `bg-background` | `#f6f6fa` | `#312e38` | Page background, table header tint, dialogs and sheets |
| `--card` | `bg-card` | `#ffffff` | `#232129` | Cards, inputs, the sidebar surface |
| `--foreground` | `text-foreground` | `#15152b` | `#f4ede8` | Primary text |
| `--muted-foreground` | `text-muted-foreground` | `#656579` | `#a3a9bf` | Secondary text, labels, inactive icons |
| `--border` | `border-border` | `#e6e6ef` | `#3e3b47` | Card edges, dividers |
| `--input` | `border-input` | `#8a8aa3` | `#6e6a80` | Border of input-like controls |
| `--primary` | `bg-primary` | `#5636d3` | `#6c4cf0` | The accent: primary buttons, current page, total card |
| `--primary-foreground` | `text-primary-foreground` | `#ffffff` | `#ffffff` | Text on `--primary` |
| `--primary-text` | `text-primary-text` | `#5636d3` | `#b9abff` | Purple text and icons (active nav, avatar initials) |
| `--primary-soft` | `bg-primary-soft` | `#eeeafc` | `#2f2760` | Active nav pill, avatar background, neutral icon chips |
| `--accent` | `bg-accent` | `#eeeafc` | `#3e3b47` | Hover fills |
| `--secondary` / `--muted` | `bg-secondary` / `bg-muted` | `#ececf3` | `#3e3b47` | Subtle buttons, skeletons |
| `--destructive` | `bg-destructive` | `#d23b3b` | `#d4344f` | Delete buttons and tooltip chips (white text) |
| `--success` / `--success-soft` | `text-success` / `bg-success-soft` | `#107a52` / `#e3f5ec` | `#3dd68c` / `#173a2b` | Incomes, positive amounts |
| `--danger` / `--danger-soft` | `text-danger` / `bg-danger-soft` | `#c43232` / `#fce9e9` | `#ff7d7d` / `#4a2226` | Outcomes, negative amounts, error text |
| `--ring` | `ring-ring` | `#5636d3` | `#b9abff` | Focus rings |
| `--sidebar*` | `bg-sidebar`, … | white surface | `#28262e` | Sidebar surface and its accent states |

### Not token-driven

- **Chart palette.** `--chart-1` to `--chart-5` (orange, blue, green, pink, purple) and `--chart-other` (grey, for the grouped remainder) colour the Balance Breakdown donut and legend. They are data colours, not the accent, and have the same value in both themes. Slices take them in order (`SLICE_COLORS` in `src/lib/balance-breakdown.ts`).
- **Toast colours.** With `richColors`, Sonner uses its own light and dark palettes for success and error toasts. The Toaster follows the app theme.

### Contrast

Measured with the current token values (WCAG 2.x):

- Text: every body and secondary text pair is at or above 4.5:1 in both themes. The tightest are `--danger` on `--danger-soft` in light (4.7:1), `--success` on `--success-soft` in light (4.7:1) and muted text on hover fills (4.7:1 in dark, 4.8:1 in light).
- Control boundaries: input borders are 3.4:1 on `--card` in light and 3.1:1 in dark. On `--background` they are 3.1:1 in light but 2.6:1 in dark, so inputs, selects and outline buttons use `bg-card`.
- Focus ring: 7.8:1 in dark, 7.3:1 in light, on `--card`.
- Charts: `--chart-*` are the same in both themes. Purple is 2.2:1 on the dark card and orange is 2.4:1 on the light card, so slices are also separated by position and the legend, not colour alone. This is accepted as is.

---

## 6. Typography

Fonts are loaded with `next/font/google` (Section 3).

| Role | Font | CSS var | Notes |
|---|---|---|---|
| Body, headings, tables | Roboto Slab | `--font-roboto-slab` | Applied on `body` |
| Metric values | Roboto | `--font-roboto` | `font-[family-name:var(--font-roboto)]` on the balance cards |

| Usage | Classes |
|---|---|
| Page title (`h1`, top bar) | `text-2xl font-bold tracking-tight` |
| Card and dialog titles | `text-lg font-semibold` |
| Navigation items | `text-sm font-medium` (sidebar), `text-base font-medium` (More sheet) |
| Sidebar and sheet section labels | `text-[11px] font-semibold uppercase tracking-wider text-muted-foreground` |
| Table headers | `text-xs md:text-[13px] font-semibold text-muted-foreground` (capitalised, not uppercase) |
| Table body | `text-[13px] md:text-sm` |
| Metric card value | `text-2xl md:text-3xl font-semibold tracking-tight` |
| Metric card label | `text-[13px] font-medium text-muted-foreground` |
| Secondary text | `text-sm text-muted-foreground` |

---

## 7. Spacing and Radius

Tailwind's 4px grid. Do not invent spacing values.

| Use | Class |
|---|---|
| Page column | `mx-auto max-w-[1120px] px-5` |
| Space between page sections | `gap-3` |
| Card padding | `p-4 md:p-5` (metric cards), `p-6` (form sections) |
| Space between a table and its pagination | `gap-4` |
| Control height | `h-10` (inputs, selects, buttons in rows), `h-9` (default `Button`) |

Base radius `--radius: 0.625rem` (10px).

| Class | Use |
|---|---|
| `rounded-lg` | Inputs, selects, buttons, nav items, icon chips, dropdown menus, tooltips, toasts |
| `rounded-xl` | Cards, table cards, dialog-like panels, the pagination bar |
| `rounded-full` | Avatars, badges, the floating action button |

---

## 8. App Shell and Layout

Every authenticated page lives in the `(app)` route group, whose layout renders the shell once.

| Breakpoint | Navigation |
|---|---|
| `< lg` (below 1024px) | Bottom tab bar (Shared, Personal, Balance, More). No sidebar |
| `≥ lg` | 248px sidebar on the left |

- **Sidebar** (`AppSidebar`): logo and name, groups Dashboards / Reports / Manage (Management is collapsible), user menu pinned to the bottom with the avatar or initials. The current page uses `bg-primary-soft text-primary-text` and `aria-current="page"`.
- **Bottom tab bar** (`BottomTabBar`): fixed, 44px-high targets, safe-area padding. **More** opens a bottom sheet with Balance Breakdown, the Management pages, **Theme** and **Logout**.
- **Top bar** (`TopBar`): the page title (`h1`), the month picker on month pages, and the page action (`New expense`; a floating button on phones).
- **Month picker**: the month lives in the URL (`?month=YYYY-MM`) and is shared by the Shared and Personal dashboards and Balance Breakdown. On phones it is sticky at the top of the Shared and Personal dashboards.
- **Scrolling**: from `lg` the page scrolls inside a fixed-height region beside the sidebar. On the dashboards and management lists the table card scrolls on its own with a pinned header, so the metric cards, filters and pagination stay in view. Below `lg` the whole page scrolls.
- **Pagination** is pinned to the bottom of the viewport on desktop, centred in the area beside the sidebar. On smaller screens it sits under the table.

Page content pattern:

```tsx
<main className="mx-auto flex max-w-[1120px] flex-col gap-3 px-5 lg:h-full">
  <section className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">{/* metric cards */}</section>
  <FilterForm />
  <div className="flex flex-col gap-4 lg:min-h-[12rem]">
    <ExpenseTable />
    <Pagination />
  </div>
</main>
```

| Property | Value |
|---|---|
| Modal max width, confirmation | `sm:max-w-[425px]` |
| Modal max width, form | `max-w-[700px]` |
| Primary breakpoints | `md` (768px), `lg` (1024px, shell switch), `xl` (1280px, extra table columns) |

---

## 9. Component Patterns

### Button (`ui/button.tsx`, CVA)

Use the variants. Do not recolour buttons per screen.

```tsx
<Button>Save</Button>                          {/* default: bg-primary */}
<Button variant="outline">Search</Button>      {/* border-input, bg-card */}
<Button variant="destructive">Delete</Button>  {/* bg-destructive, white text */}
<Button variant="ghost" size="icon" aria-label="…"><Icon /></Button>
```

Row buttons next to inputs use `className="h-10 font-semibold"`. While pending, show `<Loader2 className="size-4 animate-spin" />` in place of the label and set `disabled`.

### Input (`ui/input.tsx`)

A wrapper with the border and an inner transparent field:

```
flex h-10 w-full items-center rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-xs
focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30
error: border-danger text-danger
```

- Leading icon: `size-4 text-muted-foreground`.
- The `error` prop shows a `danger` border, an alert icon and a tooltip chip (`bg-destructive text-destructive-foreground`).
- Date and month fields reuse the same wrapper classes around a native `<input type="date|month">`.

### Select (`ui/select-menu.tsx`)

All selects use `SelectMenu`, a Radix Select with its own popover list, so the open menu follows the theme instead of the operating system's picker. Do not use a native `<select>`.

```tsx
<SelectMenu
  options={options}              // { id, description | name }[]
  value={value}
  onValueChange={setValue}       // receives the id
  placeholder="Select category"
  error={errors.category?.message}
  disabled={!ready}
  className="flex-1 lg:w-44"     // sizes the whole field
/>
```

- Trigger: the same box as the Input (`h-10`, `border-input`, `bg-card`, purple border and ring while open or focused) with a trailing `ChevronDown`. No leading icon.
- Menu: `bg-popover` card with a border and shadow, as wide as the trigger. The highlighted option uses `bg-accent`, the selected one a `text-primary-text` checkmark. It opens with the dialog fade and zoom animation.
- Keyboard: Enter, Space or the arrows open it, the arrows and type-ahead move, Escape closes.
- The `error` prop shows a `danger` border and an alert icon with a tooltip chip, like the Input.
- In react-hook-form, wrap it in a `Controller` and pass `field.value`, `field.onChange` and `field.onBlur`.
- There is no empty option. A field cannot be cleared once a value is chosen, as before with the native placeholder option.
- It works inside a dialog. For long, searchable lists use a combobox instead.

### Metric card (`BalanceCard`)

```
rounded-xl border p-4 md:p-5   +   bg-card border-border   |   bg-primary border-primary text-primary-foreground  (variant="total")
header: label (left) + 32px icon chip (right)   value below
chip tone: income  -> bg-success-soft text-success
           outcome -> bg-danger-soft  text-danger
           neutral -> bg-primary-soft text-primary-text
           total   -> bg-white/20
```

On phones the label stays left, the icon right and the value is centred. The Balance card comes first and spans two columns, with Incomes and Outcomes side by side below.

### Table (`ExpenseTable`, management tables)

A bordered card with a sticky header:

```
card:   w-full overflow-hidden rounded-xl border border-border bg-card  lg:overflow-y-auto
thead:  bg-card lg:sticky lg:top-0 lg:z-10;  th: bg-background/60 px-2 py-3 text-xs md:text-[13px] font-semibold text-muted-foreground
row:    border-t border-border hover:bg-accent/40
cell:   px-2 py-4 text-[13px] md:px-4 md:text-sm;  description font-medium text-foreground; others text-muted-foreground
amount: font-medium text-danger (outcome) / text-success (income)
category: rounded-full bg-background px-2.5 py-0.5 text-xs text-muted-foreground
```

- Sortable headers are real `<button>`s inside the `<th>`, with `aria-sort` and a chevron: `ChevronsUpDown` (dimmed) when unsorted, `ChevronUp` / `ChevronDown` for the active direction.
- Columns are hidden progressively (`hidden md:table-cell`, `lg:`, `xl:`) and use percentage widths with `table-fixed`.
- The card fits its rows (no minimum height). Do not add one.
- Row actions: a `DropdownMenu` on a ghost round button (`MoreVertical`), with `variant="destructive"` for Delete.

### Pagination

"Page X of N" and four icon buttons: first, previous, next, last (`ChevronsLeft`, `ChevronLeft`, `ChevronRight`, `ChevronsRight`), `size-8`, disabled at the ends, each with an `aria-label`. It renders nothing for a single page. The bar is a `nav` labelled "Pagination"; on `lg` it is `fixed` with `rounded-xl border border-border bg-card shadow-md`, with a spacer so the last rows are not covered.

### Dialog / Modal

Use the defaults of `ui/dialog.tsx` (background, border, radius). Do not override the surface colours.

```tsx
<DialogContent className="sm:max-w-[425px]">
  <DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>
  …
  <DialogFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>   {/* or variant="destructive" */}
  </DialogFooter>
</DialogContent>
```

The scrim is `bg-black/50`. Confirm-delete dialogs show the resource name in `font-medium italic text-foreground`.

### Sheet

The default `ui/sheet.tsx` is `bg-background`. The bottom **More** sheet in `BottomTabBar` overrides it with `bg-card rounded-t-2xl max-h-[85vh]` so it reads as one surface with the tab bar. Its rows are `h-12 rounded-lg px-3 text-base font-medium` with a `size-5` icon; the current page is `bg-primary-soft font-semibold text-primary-text`. Section labels use the sidebar label style.

### Checkbox group

A bordered `bg-card` row using the Input wrapper classes. The box is `size-5 rounded border-2`: checked `bg-primary border-primary` with a `text-primary-foreground` tick; unchecked `border-muted-foreground`.

### Badge / chip

`rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground`. State chips use the `*-soft` fills.

### Month picker (`MonthPicker`)

Previous and next buttons (`size-10 rounded-lg border border-input bg-card hover:bg-accent`) around a `h-10` field (`md:w-[190px]`, `border-input bg-card`, `focus-within:ring-2 focus-within:ring-ring`). The field shows a `Calendar` icon and the month label (or "Custom range"); a transparent native `type="month"` input sits over it. On phones the field fills the row.

### Filter form (`FilterForm`)

From `md`, `grid grid-cols-3 gap-5`: a pair of selects, a pair of date inputs, and a **Search** outline button (`h-10 font-semibold`, half width, right aligned). Below `md` the groups stack with `gap-3` and the button is full width.

### Chart set (`BreakdownChart`, `BreakdownLegend`)

- **Donut:** a 280 viewBox ring with an inner ratio of 0.72, a 2px `--card` stroke between slices, and the total in the centre. The selected slice grows 8px; the other slices drop to 30% opacity.
- **Legend row:** `h-12 rounded-lg border border-border bg-card hover:bg-accent/40`: a 10px dot (`--chart-*`), the label (14px, 15px from `md`, truncates), a share chip (`h-[22px] rounded-full bg-background px-2 text-[0.6875rem] text-muted-foreground`), the amount (`min-w-[110px]`, right aligned) and a drill chevron. The selected row gets `ring-2 ring-primary`; the others drop to 55% opacity.
- **Other:** a small header row (`text-xs`, dot, "OTHER", count) above the first grouped row, and a `h-11` **Show all N** button when there are more than ten rows.
- **Insight:** a `bg-background rounded-md` line with a `Sparkles` icon on desktop, and a `Pointer` hint on phones.

### Avatar (`UserAvatar`)

`size-[34px] rounded-full bg-primary-soft text-xs font-bold text-primary-text`. It shows the picture, or the initials when there is none or it fails to load.

### Empty, loading and error

- **Empty:** `rounded-xl border border-dashed border-border bg-card px-4 py-12 text-center text-muted-foreground`.
- **Loading (page):** a centred `Loader` (`text-primary-text`), not a full-screen overlay. Skeletons use `bg-muted animate-pulse`.
- **Error (page):** an inline message in `text-danger` (never only a toast), with a Retry button when the request can be repeated.

### Toasts

Sonner with `richColors`, position `top-center`. Use `toast.success()` and `toast.error()`. The Toaster passes the active theme, so toasts follow it. Do not hard-code a toast theme. The design file draws toasts with tokens instead (`bg-card`, `--success` and `--danger` icons); the app still uses `richColors`.

---

## 10. Interaction and Animation

| State | Pattern |
|---|---|
| Focus (inputs) | `focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30` on the wrapper |
| Focus (buttons, links, tabs) | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` |
| Hover | `hover:bg-accent` or `hover:bg-accent/40` on rows and ghost controls |
| Disabled | `disabled:pointer-events-none disabled:opacity-50` |

Dialog: `data-[state=open]:animate-in data-[state=closed]:animate-out` with `fade` and `zoom-95`. Sheet: `slide-in-from-*` with `duration-500` open and `duration-300` close. Both come with the shadcn components.

---

## 11. Icons

lucide-react, sized with `size-*`:

| Size | Class | Use |
|---|---|---|
| Compact | `size-3.5` / `size-4` | Sort chevrons, input icons, icon chips |
| Standard | `size-[18px]` / `size-5` | Navigation items, sheet rows |
| Large | `size-6` | Floating action button |

Decorative icons carry `aria-hidden="true"`. Icon-only buttons need an `aria-label`. Inactive and muted icons use `text-muted-foreground`; icons inside a coloured control inherit its text colour.

---

## 12. Form Patterns

Forms use `react-hook-form` with a Zod schema.

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema)
})
```

- Pass `error={errors.field?.message}` to `Input` and `SelectMenu` (inside a `Controller` for selects).
- The submit button shows a spinner and is `disabled` while pending.
- Fields sit in a `flex flex-col gap-4` container, two per row where they pair (category and payment type, bank and store, date and amount).
- The New Expense dialog has three variants that share one layout: create, create with **Current Month** (shown only when the selected payment type has no statement), and edit. Edit adds a Cancel button.

---

## 13. Accessibility

- Navigation landmarks are labelled (`Main`, `Primary`, `Pagination`). The current page has `aria-current="page"`.
- Sortable headers are keyboard-operable buttons with `aria-sort`.
- Every interactive element has a visible focus ring in both themes.
- Tab bar and sheet targets are at least 44px high.
- Do not rely on colour alone: expense amounts are also signed ("- $15.99").

---

## 14. What NOT to Do

- **Do not use raw colours.** No hex values, `text-white`, `bg-slate-*`, `text-green-500`, and no `dark:` variants. Use tokens (Section 5). The only exceptions are translucent white overlays on the primary fill (`bg-white/20`) and the `bg-black/50` scrims.
- **Do not use `border-border` on input-like controls.** Use `border-input` so the boundary is visible in light.
- **Do not use `bg-destructive` or `bg-primary` as a text colour.** Use `text-danger` and `text-primary-text`.
- **Do not recolour buttons** per screen; pick a `Button` variant.
- **Do not add a minimum height to a table card.** It leaves blank space under short lists.
- **Do not put the header back in each page.** The shell comes from the `(app)` layout.
- **Do not change the fonts** without updating the typography table and checking every table's column widths.
- **Do not skip the focus ring** on interactive elements.

---

## 15. Components in the design file only

These are defined in `design_V3.pen` so a new project has them. None of them exists in this app yet; add each with the shadcn component named on the file's **shadcn mapping** page and style it with the tokens.

| Component | Spec |
|---|---|
| Textarea | Same box as the Input (`border-input bg-card rounded-lg shadow-xs`), 96px high, `px-3 py-2`. |
| Switch | 36x20 pill. Off `bg-input`, on `bg-primary`, thumb 16px `bg-background`. |
| Radio | 16px circle, `border-primary`, 8px `bg-primary` dot. |
| Slider | 6px track `bg-secondary`, range `bg-primary`, 16px thumb with a `border-primary` edge on `bg-background`. |
| Tabs | List `bg-muted rounded-lg p-1` (36px). Active trigger `bg-background shadow` with `text-foreground`; inactive `text-muted-foreground`. |
| Breadcrumb, Separator | Items 14px `text-muted-foreground`, current page `font-medium text-foreground`, 14px chevron separators. Separator is 1px `bg-border`. |
| Accordion | Rows with a `border-b border-border`, 14px medium trigger with a chevron, 14px `text-muted-foreground` content. |
| Popover | `w-72 p-4 bg-popover rounded-lg border shadow-md`. |
| Command, Combobox | `bg-popover rounded-lg border shadow-md`; a 44px search row with a bottom border; items `rounded-md px-2 py-2`, highlighted `bg-accent`. Combobox is a Select trigger that opens a Command. |
| Card | `bg-card rounded-xl border`, no shadow, `p-6`, title `text-lg font-semibold`, description `text-sm text-muted-foreground`. |
| Calendar, Date picker | 36px day cells, `rounded-md`. Today `bg-accent`, selected `bg-primary text-primary-foreground`, range `bg-accent`, outside days 50%. The picker is an Input that opens the calendar in a Popover. |
| Progress | 8px track `bg-secondary rounded-full`, indicator `bg-primary`. |
| Skeleton, Scroll area | Skeleton `bg-muted` with a pulse; scrollbar thumb `bg-border rounded-full`. |
| Alert | Default `bg-card border`; destructive `bg-danger-soft border-danger text-danger`; success `bg-success-soft border-success text-success`. `rounded-lg p-4`, 16px icon. |
| Avatar group | Avatars overlapped by 8px with a 2px ring of the surface colour. |
| Tooltip (error chip) | `bg-destructive text-destructive-foreground rounded-lg px-3 py-1.5 text-xs`, the chip used above invalid fields. |

