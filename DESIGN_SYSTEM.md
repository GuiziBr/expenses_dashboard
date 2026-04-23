# Design System Reference

This document is the single source of truth for the visual design of this application. It is intended to be provided to an AI assistant when building a new frontend that should match this application's look and feel.

---

## 1. Design Philosophy

This application uses a **dark-mode-only** aesthetic with a professional, data-dense layout suited for financial dashboards. There is no light mode — the HTML element always carries the `dark` class.

The visual language is built on three pillars:
- **Depth through layering**: a deep purple-grey page background (`#312e38`) with darker cards/containers (`#232129`) creates visual hierarchy without borders.
- **One primary accent**: orange (`#ff872c`) is the *only* action color. Every interactive element — buttons, focus rings, active nav links — uses it.
- **Legibility first**: high-contrast cream text (`#f4ede8`) on dark backgrounds, minimal decoration, clean typography.

---

## 2. Technology Stack

| Concern | Library / Tool |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme` in `globals.css`) |
| Component primitives | shadcn/ui + Radix UI |
| Component variants | Class Variance Authority (CVA) |
| Icons (primary) | lucide-react |
| Icons (secondary) | react-icons |
| Toasts | Sonner |
| Forms | react-hook-form + Zod |
| Data fetching | TanStack Query (React Query) |

---

## 3. Project Setup Instructions

When scaffolding a new project to match this design, follow these steps:

1. **Create a Next.js app** with the App Router.
2. **Init shadcn/ui** (`npx shadcn@latest init`). When prompted, choose "New York" style and accept defaults — the `globals.css` below will override the generated variables.
3. **Replace `globals.css`** with the exact content from [Section 4](#4-globalscss--design-tokens) below.
4. **Configure fonts** in `src/app/layout.tsx`:

```tsx
import { Roboto, Roboto_Slab } from "next/font/google"

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"]
})

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"]
})

// Apply to <html> and <body>:
<html lang="en" className="dark">
  <body className={`${robotoSlab.variable} ${roboto.variable} antialiased`}>
```

5. **Force dark mode**: the `<html>` element must always have `className="dark"`. This is not a toggle — it is always dark.
6. **Add Sonner** for toasts:

```tsx
import { Toaster } from "@/components/ui/sonner"
// Inside <body>:
<Toaster position="top-center" expand={true} richColors />
```

---

## 4. globals.css — Design Tokens

Copy this file verbatim into `src/app/globals.css`. It defines all color variables, radius tokens, and bridges them into Tailwind v4 utilities via `@theme`.

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;
  --background: #312e38;
  --container-background: #232129;
  --input-text: #f4ede8;

  --light-orange: #ff9000;
  --iron-gray: #666360;
  --red: #c53030;
  --white: #ffffff;
  --light-blue: #5636d3;
  --orange: #ff872c;
  --very-light-blue: #ebf8ff;
  --blue-sky: #3172b7;
  --cleared-blue: #e6fffa;

  --green-blue: #2e656a;
  --light-pink: #fddede;
  --light-gray: #969cb3;
  --blue-wood: #363f5f;
  --green: #12a454;
  --pink: #e83f5b;

  /* shadcn/ui variables adjusted for default dark background */
  --foreground: #f4ede8;
  --card: #232129;
  --card-foreground: #f4ede8;
  --popover: #232129;
  --popover-foreground: #f4ede8;
  --primary: #ff872c;
  --primary-foreground: #ffffff;
  --secondary: #3e3b47;
  --secondary-foreground: #f4ede8;
  --muted: #3e3b47;
  --muted-foreground: #969cb3;
  --accent: #3e3b47;
  --accent-foreground: #f4ede8;
  --destructive: #e83f5b;
  --destructive-foreground: #ffffff;
  --border: #3e3b47;
  --input: #232129;
  --ring: #ff872c;
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: #28262e;
  --sidebar-foreground: #f4ede8;
  --sidebar-primary: #ff872c;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #3e3b47;
  --sidebar-accent-foreground: #f4ede8;
  --sidebar-border: #3e3b47;
  --sidebar-ring: #ff872c;
}

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-serif: var(--font-roboto-slab);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  /* Custom Project Colors */
  --color-orange: var(--orange);
  --color-light-orange: var(--light-orange);
  --color-light-blue: var(--light-blue);
  --color-very-light-blue: var(--very-light-blue);
  --color-container-background: var(--container-background);
  --color-input-text: var(--input-text);
  --color-iron-gray: var(--iron-gray);
  --color-red: var(--red);
  --color-blue-sky: var(--blue-sky);
  --color-cleared-blue: var(--cleared-blue);
  --color-green-blue: var(--green-blue);
  --color-light-pink: var(--light-pink);
  --color-light-gray: var(--light-gray);
  --color-blue-wood: var(--blue-wood);
  --color-green: var(--green);
  --color-pink: var(--pink);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-roboto-slab), serif;
  }

  /* Prevent browser autofill from applying its own yellow/blue background */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-background-clip: text;
    -webkit-text-fill-color: var(--input-text);
    transition: background-color 5000s ease-in-out 0s;
    box-shadow: inset 0 0 20px 20px var(--container-background);
  }
}
```

---

## 5. Color Reference

Once the `globals.css` above is installed, all tokens below are available as Tailwind utilities (`bg-orange`, `text-iron-gray`, `border-red`, etc.).

### Project colors

| Token | Hex | Tailwind class | When to use |
|---|---|---|---|
| `--orange` | `#ff872c` | `bg-orange` / `text-orange` / `border-orange` | Primary actions, CTA buttons, focus rings, active nav states |
| `--light-orange` | `#ff9000` | `bg-light-orange` | Hover variant of orange |
| `--background` | `#312e38` | `bg-background` | Page background |
| `--container-background` | `#232129` | `bg-container-background` | Cards, inputs, modals, dropdowns |
| `--foreground` / `--input-text` | `#f4ede8` | `text-foreground` / `text-input-text` | All body text |
| `--iron-gray` | `#666360` | `text-iron-gray` | Muted icons, input placeholders, disabled text |
| `--light-gray` | `#969cb3` | `text-light-gray` / `text-muted-foreground` | Secondary labels, table column headers |
| `--light-blue` | `#5636d3` | `bg-light-blue` | Navigation/header background |
| `--blue-wood` | `#363f5f` | `text-blue-wood` | Text on light/white surfaces (balance cards) |
| `--red` | `#c53030` | `text-red` / `border-red` | Error text, error borders |
| `--pink` | `#e83f5b` | `bg-pink` / `text-pink` | Destructive button background (`--destructive`) |
| `--light-pink` | `#fddede` | `bg-light-pink` | Error state backgrounds |
| `--green` | `#12a454` | `text-green` | Success states |
| `--green-blue` | `#2e656a` | `bg-green-blue` | Alternate success/cleared states |
| `--cleared-blue` | `#e6fffa` | `bg-cleared-blue` | Cleared state indicator backgrounds |
| `--border` | `#3e3b47` | `border-border` | Default border on cards and dividers |

### shadcn/ui semantic tokens (auto-wired)

| Token | Maps to | Notes |
|---|---|---|
| `--primary` | `#ff872c` (orange) | Use on CTA buttons |
| `--destructive` | `#e83f5b` (pink) | Use on delete/danger buttons |
| `--secondary` | `#3e3b47` | Subtle button variant |
| `--muted` | `#3e3b47` | Subdued backgrounds |
| `--muted-foreground` | `#969cb3` | Hint/description text |
| `--card` | `#232129` | Card surfaces |
| `--border` | `#3e3b47` | Component borders |
| `--ring` | `#ff872c` | Focus ring color |

---

## 6. Typography

**Fonts must be loaded via `next/font/google`** — see Section 3.

| Role | Font | CSS var | Notes |
|---|---|---|---|
| Body / headings (default) | Roboto Slab | `--font-roboto-slab` | Applied globally on `body`. Serif, gives a professional financial feel. |
| Numeric displays, balance cards | Roboto | `--font-roboto` | Used where a more compact, modern look is needed. Apply with `font-[family-name:var(--font-roboto)]`. |

### Size conventions

| Usage | Class | Size |
|---|---|---|
| Dialog/card titles | `text-lg font-semibold` | 18px |
| Navigation links | `text-base font-medium` | 16px |
| Body / form labels | `text-base font-medium` or `text-sm` | 16px / 14px |
| Secondary/description text | `text-sm text-muted-foreground` | 14px |
| Table headers | `text-sm` (mobile) `text-xl` (desktop) | 14px / 20px |
| Balance card amount | `text-[2.25rem] font-normal leading-[3.5rem]` | 36px |
| Page title (mobile) | `text-lg font-bold` | 18px |

---

## 7. Spacing System

Tailwind's default 4px grid applies throughout. Do not invent custom spacing values unless strictly necessary.

| Use case | Class | Value |
|---|---|---|
| Flex/grid gap (tight) | `gap-2` | 8px |
| Flex/grid gap (standard) | `gap-4` | 16px |
| Flex/grid gap (loose) | `gap-8` | 32px |
| Card / section padding | `p-6` | 24px |
| Balance card padding | `px-8 py-6` | 32px / 24px |
| Dialog content padding | `p-6` | 24px |
| Section vertical rhythm | `mt-8`, `mb-8` | 32px |

---

## 8. Border Radius

Base token: `--radius: 0.625rem` (10px). All radii are derived from it.

| Token | Value | Tailwind class | Use on |
|---|---|---|---|
| sm | 6px | `rounded-sm` | Small chips, badges |
| md | 8px | `rounded-md` | Inputs, buttons, dropdowns |
| lg | 10px | `rounded-lg` | Cards, dialogs, modals |
| xl | 14px | `rounded-xl` | Larger panels |
| full | 50% | `rounded-full` | Icon-only circular buttons |
| custom | 4.8px | `rounded-[0.3rem]` | Balance cards and primary action buttons (project-specific choice) |

---

## 9. Component Patterns

### Button

Uses CVA. Install the button component from shadcn/ui and keep these variants unchanged.

```tsx
// Default (orange fill) — primary actions
<Button>Save</Button>

// Destructive (pink) — delete/danger
<Button variant="destructive">Delete</Button>

// Outline — cancel / secondary
<Button variant="outline">Cancel</Button>

// Ghost — navigation, inline actions
<Button variant="ghost">Menu item</Button>

// Icon-only
<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
```

Base classes (never override without reason):
```
inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium
transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
disabled:pointer-events-none disabled:opacity-50 cursor-pointer
```

shadcn default sizes: `h-8` (sm), `h-9` (default), `h-10` (lg). **This project overrides the default height to `h-12` (48px)** for primary, destructive, and outline buttons. Add `h-12` to the CVA size map for the project default:

```tsx
// In button.tsx CVA config
default: "h-12 px-6 py-2",
sm:      "h-8 px-3 text-xs",
lg:      "h-12 px-8",
icon:    "h-9 w-9",
```

Icon + text button (used for "Create Expense", "New" actions — not a shadcn variant, compose inline):

```tsx
<button className="inline-flex items-center gap-2 h-10 px-4 rounded-[0.3rem] bg-orange text-background text-sm font-medium">
  <Plus className="h-5 w-5" />
  Create Expense
</button>
```

Loading state: replace button text with `<Loader2 className="animate-spin" />` and set `disabled`.

---

### Input

A custom component that wraps a native `<input>` with a styled container. Key behaviors:
- **Focus**: the *container* gets `border-orange`, not the inner `<input>`.
- **Error**: container switches to `border-red text-red`; an `<AlertCircle>` tooltip appears on hover.
- **Currency**: automatic decimal/comma formatting when `isCurrency` prop is set.

```tsx
<Input
  icon={DollarSign}
  placeholder="Amount"
  isCurrency
  error={errors.amount?.message}
/>
```

Container classes:
```
flex h-12 w-full items-center rounded-md bg-container-background
border-2 border-container-background px-3 text-base shadow-sm
transition-colors focus-within:border-orange text-input-text
```

Inner `<input>` classes:
```
flex-1 bg-transparent border-none p-0 h-full w-full
text-input-text focus:outline-none focus:ring-0 placeholder:text-iron-gray
```

Icon: `mr-2 h-5 w-5 text-iron-gray shrink-0`

Error tooltip (absolute, appears above on hover):
```
absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2
bg-red text-white px-2 py-1 rounded text-xs whitespace-nowrap
opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg
```
The CSS triangle pointer under the tooltip: `border-[6px] border-t-red border-x-transparent border-b-transparent`

---

### Select

**Do not use a native `<select>`.** Use a custom component that matches the Input container visually — icon on the left, placeholder text, chevrons-up-down icon on the right. Build it by wrapping shadcn's `<Select>` primitive with the same container classes as Input:

```tsx
// Custom Select component — mirrors Input layout exactly
<div className="flex h-12 w-full items-center rounded-md bg-container-background border-2 border-container-background px-3 transition-colors focus-within:border-orange">
  <Icon className="mr-2 h-5 w-5 text-iron-gray shrink-0" />
  <Select onValueChange={onChange} value={value}>
    <SelectTrigger className="flex-1 bg-transparent border-none p-0 h-full text-base text-input-text focus:outline-none focus:ring-0 shadow-none">
      <SelectValue placeholder={<span className="text-iron-gray">{placeholder}</span>} />
    </SelectTrigger>
    <SelectContent className="bg-container-background border-border text-input-text">
      {options.map(opt => (
        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

The `<SelectTrigger>` built-in chevron should be hidden (`[&>svg]:hidden`) and replaced with a `ChevronsUpDown` icon inside the container if needed, or the default shadcn chevron can be kept at the right edge.

For simple filter dropdowns where no error state is needed, use the same shadcn `<Select>` primitive with a leaner container — omit the left icon and drop `border-2` to `border` if visual weight should be reduced. Never fall back to a native `<select>`.

---

### Card

```tsx
<div className="bg-card rounded-lg border border-border p-6 shadow-lg">
  {/* content */}
</div>
```

---

### Balance Card

Two variants: `default` (white bg, dark text) and `total` (orange bg, white text).

```tsx
<div className={cn(
  "px-8 py-6 rounded-[0.3rem] font-[family-name:var(--font-roboto)] flex flex-col items-center md:items-start",
  isTotal ? "bg-orange text-white" : "bg-white text-blue-wood"
)}>
  <header className="flex items-center justify-between w-full">
    <p className="text-base">{label}</p>
    <Icon className="w-8 h-8" strokeWidth={1.5} />
  </header>
  <p className="mt-4 text-[2.25rem] font-normal leading-[3.5rem] text-center md:text-left w-full">
    {value}
  </p>
</div>
```

---

### Table

```
border-separate border-spacing-y-2 table-fixed w-full
```

Header cells: `text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl`

Data rows use white background with rounded ends:
- First cell: `rounded-l-lg`
- Last cell: `rounded-r-lg`
- Individual cells: `py-3 px-1 md:px-4 text-sm md:text-base`

**Mobile column visibility** — hide columns progressively, always keeping the primary identifier and amount visible:

| Page | Always visible | Hidden on mobile (`hidden md:table-cell`) |
|---|---|---|
| Dashboard | Expense name, Amount | Category, Due Date, Purchase Date |
| Banks Management | Bank name | Updated At |
| Payment Types | Payment type, Has Statement | Created At, Updated At |

Row actions (edit/delete) use a `DropdownMenu` with `MoreVertical` icon trigger (`size="icon"` ghost button).

### Has Statement display

In the Payment Types table the "Has Statement" column renders differently based on value — never use a text boolean:

```tsx
// has_statement = true
<Check className="h-4 w-4 text-green" />

// has_statement = false
<span className="text-muted-foreground">—</span>
```

### Amount / value display

Monetary amounts are always color-coded by sign. Never show a plain number:

| Context | Color class | Example |
|---|---|---|
| Expense / debit (negative) | `text-pink` | `-$15.99` |
| Income / credit (positive) | `text-green` | `$1,200.00` |
| Neutral totals on dark bg | `text-foreground` | `$355.20` |
| Neutral totals on white bg | `text-blue-wood` | `$892.30` |
| Muted / secondary dates | `text-muted-foreground` | `Jan 15, 2025` |

Always format with two decimal places and a dollar sign prefix. Use a utility or `Intl.NumberFormat` — never `toFixed` directly in JSX.

---

### Dialog / Modal

Use shadcn/ui's Dialog component. Key styling points:
- Overlay: `bg-black/80 backdrop-blur-sm`
- Content: `bg-background border border-border rounded-lg shadow-lg`
- Animation: `data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200`
- Close button: absolute top-right, `opacity-70 hover:opacity-100`

Footer pattern (cancel + action):
```tsx
<DialogFooter>
  <Button variant="outline" onClick={onClose}>Cancel</Button>
  <Button disabled={isPending}>
    {isPending ? <Loader2 className="animate-spin" /> : "Confirm"}
  </Button>
</DialogFooter>
```

---

### Checkbox

Use shadcn/ui's `<Checkbox>` component paired with a `<label>`. The checkbox itself uses the default shadcn styling (border, checked fill via `--primary`). Always wrap the pair in a flex container:

```tsx
<div className="flex items-center gap-2">
  <Checkbox
    id="personal"
    checked={isPersonal}
    onCheckedChange={setIsPersonal}
    className="border-iron-gray data-[state=checked]:bg-orange data-[state=checked]:border-orange"
  />
  <label htmlFor="personal" className="text-sm text-foreground cursor-pointer select-none">
    Personal
  </label>
</div>
```

When multiple checkboxes are grouped (e.g. Personal / Split in the New Expense form), wrap them in a row container:

```tsx
<div className="flex items-center gap-4">
  <div className="flex items-center gap-2">...</div>
  <div className="flex items-center gap-2">...</div>
</div>
```

---

### Confirm Delete Modal

Used on all management pages (Banks, Payment Types). Always use this exact structure — do not invent a new layout for destructive confirmations:

```tsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Delete {entityName}</DialogTitle>
      <DialogDescription className="text-muted-foreground">
        Are you sure you want to delete <span className="font-semibold text-foreground">{name}</span>?
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="gap-2">
      <Button variant="outline" onClick={onClose} disabled={isPending}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Delete"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Pagination

Used on management pages (Banks, Payment Types) and the Dashboard table. Always render as a centered flex row:

```tsx
<div className="flex items-center justify-center gap-1 py-4">
  <button
    onClick={() => setPage(p => Math.max(1, p - 1))}
    disabled={page === 1}
    className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 disabled:opacity-40"
  >
    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
  </button>

  {pages.map(p => (
    <button
      key={p}
      onClick={() => setPage(p)}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-sm",
        p === page
          ? "bg-orange text-background font-bold"
          : "bg-white/5 text-muted-foreground"
      )}
    >
      {p}
    </button>
  ))}

  <button
    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
    disabled={page === totalPages}
    className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 disabled:opacity-40"
  >
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </button>
</div>
```

---

### Empty State

Used when a filtered table returns no results (Dashboard, management pages). Always centered inside the table container area:

```tsx
<div className="flex items-center justify-center rounded-lg bg-white/5 border border-white/10 py-12">
  <p className="text-sm text-muted-foreground text-center">
    No expenses found for this criteria.
  </p>
</div>
```

For pages that are empty because no data has been created yet (first-use state), add an icon above the text:

```tsx
<div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-white/5 border border-white/10 py-16">
  <Inbox className="h-10 w-10 text-muted-foreground/50" />
  <p className="text-sm text-muted-foreground">No records yet.</p>
</div>
```

---

### Navigation / Header

- Background: `bg-[var(--light-blue)]` (purple `#5636d3`)
- Container: `max-w-[1120px] mx-auto px-5`
- Links: `text-base font-medium transition-opacity duration-200`
- Active link: `text-orange`
- Inactive link: `text-white hover:text-orange/60`
- Mobile: hide nav with `hidden md:flex`, show hamburger `Menu` icon
- Dropdown on mobile: full-width `w-[calc(100vw-40px)]`, same `bg-[var(--light-blue)]` background

---

## 10. Page Layout Templates

These templates repeat across all pages. Never invent a new top-level layout — extend one of these.

### Management page layout (Banks, Payment Types)

Used for any CRUD management page. The blue band is the full-width page header; the white card overlaps it from below.

```
┌─────────────────────────── full viewport width ────────────────────────────┐
│  [Header / Nav]                                                             │
│  ┌─────────────────── bg-light-blue, h-[213px] desktop / h-[216px] mobile ─┐│
│  │                                                                          ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│    ┌──── max-w-[1120px] mx-auto, overlapping blue band by ~96px ──────────┐  │
│    │  createSection (card)                                                 │  │
│    │  tableSection (header row + data rows + pagination)                  │  │
│    └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

```tsx
// Page shell
<main className="min-h-screen bg-background">
  <Header />
  <div className="bg-light-blue h-[213px] md:h-[216px] w-full" />
  <div className="max-w-[1120px] mx-auto px-5 -mt-24 pb-16 flex flex-col gap-8">
    {/* createSection */}
    <section className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <Input ... />
        <Button className="w-32">Save</Button>
      </div>
    </section>

    {/* tableSection */}
    <div className="flex flex-col gap-2">
      <table className="border-separate border-spacing-y-2 table-fixed w-full">
        ...
      </table>
      <Pagination ... />
    </div>
  </div>
</main>
```

On mobile the create section stacks the input and button vertically (`flex-col`). The table collapses non-essential columns (see Section 9 — Table).

---

### Dashboard page layout

The blue band is taller (overlaps more) and the main content has three zones stacked vertically.

```tsx
<main className="min-h-screen bg-background">
  <Header />
  <div className="bg-light-blue h-[213px] w-full" />
  <div className="max-w-[1120px] mx-auto px-5 -mt-24 pb-16 flex flex-col gap-8">
    {/* Balance row — 3 cards in a grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <BalanceCard label="Incomes" value={incomes} icon={CircleArrowUp} />
      <BalanceCard label="Outcomes" value={outcomes} icon={CircleArrowDown} />
      <BalanceCard label="Balance" value={balance} icon={DollarSign} isTotal />
    </div>

    {/* Filter bar */}
    <FilterBar onSearch={handleSearch} />

    {/* Content: expense table or empty state */}
    {expenses.length === 0 ? <EmptyState /> : <ExpenseTable rows={expenses} />}
  </div>
</main>
```

### Dashboard filter bar pattern

The filter bar is always a flex row on desktop, a stacked column on mobile. The Create button is always on the left; all filter controls + Search are on the right.

```tsx
// Desktop: space-between row. Mobile: flex-col gap-4.
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  {/* Left */}
  <button className="inline-flex items-center gap-2 h-10 px-4 rounded-[0.3rem] bg-orange text-background text-sm font-medium">
    <Plus className="h-5 w-5" />
    Create Expense
  </button>

  {/* Right */}
  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
    <Select placeholder="Filter by" className="w-full md:w-36" />
    <Select placeholder="Select value" className="w-full md:w-44" />
    <Input icon={Calendar} placeholder="Start date" className="w-full md:w-44" />
    <Input icon={Calendar} placeholder="End date" className="w-full md:w-44" />
    <Button className="h-10 w-full md:w-auto px-4">Search</Button>
  </div>
</div>
```

### Consolidated Balance report tables

Used on Consolidated Balance pages. Two side-by-side tables (one per user), each grouped by payment type with subtotal rows:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {[requester, partner].map(user => (
    <div key={user.id} className="flex flex-col gap-2">
      {/* Table header */}
      <div className="flex items-center justify-center h-12 text-foreground font-semibold">
        {user.name}
      </div>

      {/* Payment type groups */}
      {user.groups.map(group => (
        <div key={group.type} className="flex flex-col gap-1">
          {/* Group header row — white bg, type label centered */}
          <div className="flex items-center justify-center h-11 rounded-lg bg-white text-blue-wood text-sm font-medium">
            {group.paymentType}
          </div>

          {/* Bank rows — striped light gray bg */}
          {group.banks.map(bank => (
            <div key={bank.id} className="flex items-center justify-between h-12 rounded-lg bg-slate-200 px-4 text-sm">
              <span className="text-blue-wood">{bank.name}</span>
              <span className="text-blue-wood font-medium">{formatCurrency(bank.amount)}</span>
            </div>
          ))}

          {/* Subtotal row — cleared-blue teal */}
          <div className="flex items-center justify-center h-11 rounded-lg bg-cleared-blue text-green-blue text-sm font-semibold">
            Total — {formatCurrency(group.total)}
          </div>
        </div>
      ))}
    </div>
  ))}
</div>
```

---

## 11. Layout System

| Property | Value | Notes |
|---|---|---|
| Max content width | `max-w-[1120px] mx-auto px-5` | Applied to page content wrappers |
| Modal max width — confirmation | `max-w-[500px]` | Confirm Delete and similar single-action dialogs |
| Modal max width — form | `max-w-[700px]` | Multi-field forms (e.g. New Expense) |
| Primary breakpoint | `md` (768px) | Most responsive switches happen here |
| Secondary breakpoints | `lg` (1024px), `xl` (1280px) | Used for fine-tuning column widths |

Common responsive pattern:
```
hidden md:flex          // hide on mobile, flex on desktop
flex-col md:flex-row    // stack on mobile, row on desktop
w-full md:w-[14rem]     // full width mobile, fixed on desktop
```

---

## 12. Interaction & Animation Patterns

| State | Pattern |
|---|---|
| Input focus | `focus-within:border-orange` on container (not `box-shadow`) |
| Button hover | `hover:bg-primary/90` (opacity reduction, not color change) |
| Navigation hover | `hover:text-orange/60` (opacity reduction) |
| Brightness hover | `hover:brightness-75` on images/colored elements |
| Disabled | `opacity-50 cursor-not-allowed pointer-events-none` |
| Loading | `<Loader2 className="animate-spin text-orange" />` replaces button text |

### Dialog animations
```
data-[state=open]:animate-in data-[state=closed]:animate-out
data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
duration-200
```

### Sheet / drawer animations (slide from right)
```
data-[state=open]:animate-in data-[state=closed]:animate-out
data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right
data-[state=open]:duration-500 data-[state=closed]:duration-300
```

---

## 13. Icon System

### Primary: lucide-react

Install: `npm install lucide-react`

Sizing conventions:
| Size | Class | Use |
|---|---|---|
| Compact | `h-4 w-4` | Inside small buttons, nav chevrons |
| Standard | `h-5 w-5` | Inline with text, input icons |
| Medium | `h-6 w-6` | Mobile header icons |
| Large | `h-8 w-8` | Balance card decorative icons |

Icon color for decorative/muted icons: `text-iron-gray`
Icon color for action icons in context: inherit from parent text color.

Common icons used: `ChevronDown`, `ChevronUp`, `ChevronLeft`, `ChevronRight`, `Menu`, `LogOut`, `Pencil`, `Trash2`, `AlertCircle`, `X`, `Loader2`, `DollarSign`, `Landmark`, `MoreVertical`, `CheckCircle2`, `XCircle`

### Secondary: react-icons

Install: `npm install react-icons`

Used for: `HiOutlineSelector` (custom select arrow), `HiPlus` (add buttons), `MdDateRange` (date input icon), `MdTitle` (text field icon), `IoMdCheckboxOutline` (checkbox icon in filters).

---

## 14. Toast / Notification Patterns

Uses Sonner. Always call `toast.success()` or `toast.error()`. Configure once in root layout:

```tsx
<Toaster position="top-center" expand={true} richColors />
```

Custom icon examples:
```tsx
toast.success("Saved successfully", {
  icon: <CheckCircle2 className="text-green" />
})
toast.error("Something went wrong", {
  icon: <XCircle className="text-red" />
})
```

Toaster appearance overrides (applied via `toastOptions` on `<Toaster>` if needed):
- Background: `bg-container-background`
- Text: `text-input-text`
- Border: `border border-iron-gray`
- Theme: `dark`

---

## 15. Form Patterns

Forms always use `react-hook-form` with Zod schema validation.

```tsx
const schema = z.object({
  amount: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
})

const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema)
})
```

- Always pass `error={errors.fieldName?.message}` to `Input` and `Select` components.
- Submit button shows `<Loader2 className="animate-spin" />` and is `disabled` while pending.
- Form fields use `gap-4` between them inside a `flex flex-col` container.

---

## 16. Loading & Skeleton States

### Page-level loading

When the entire page content is loading (e.g. initial data fetch), render a centered spinner inside the content area — not a full-screen overlay:

```tsx
<div className="flex items-center justify-center py-24">
  <Loader2 className="h-8 w-8 animate-spin text-orange" />
</div>
```

### Skeleton table rows

While table data is loading, render 3–5 skeleton rows at the same height as data rows to prevent layout shift:

```tsx
{Array.from({ length: 5 }).map((_, i) => (
  <tr key={i}>
    {columns.map((_, j) => (
      <td key={j} className="py-3 px-4">
        <div className="h-4 rounded-md bg-muted animate-pulse" />
      </td>
    ))}
  </tr>
))}
```

### Error state

When a data fetch fails, show an inline error message inside the content area (never a toast for page-level errors):

```tsx
<div className="flex flex-col items-center justify-center gap-3 py-16">
  <TriangleAlert className="h-8 w-8 text-pink" />
  <p className="text-sm text-muted-foreground">Failed to load data. Please try again.</p>
  <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
</div>
```

---

## 17. New Expense Modal

The modal is used on Dashboard pages. It has three variants: **Base** (create), **Current Month** (create with no-statement payment type selected), and **Edit**. All share the same form layout — only the title and footer change.

```tsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="max-w-[700px] bg-background border-border">
    <DialogHeader>
      <DialogTitle className="text-center text-2xl font-bold text-foreground">
        {isEdit ? "Edit Expense" : "Create Expense"}
      </DialogTitle>
    </DialogHeader>

    {/* Form — single column, gap-4 between rows */}
    <div className="flex flex-col gap-4">
      <Input icon={Type} placeholder="Expense description" />

      {/* Row: category + payment type */}
      <div className="flex gap-4">
        <Select placeholder="Select category" icon={ChevronsUpDown} className="flex-1" />
        <Select placeholder="Select payment type" icon={ChevronsUpDown} className="flex-1" />
      </div>

      {/* Row: bank + store */}
      <div className="flex gap-4">
        <Select placeholder="Select bank" icon={ChevronsUpDown} className="flex-1" />
        <Select placeholder="Select store" icon={ChevronsUpDown} className="flex-1" />
      </div>

      {/* Row: date + amount */}
      <div className="flex gap-4">
        <Input icon={Calendar} placeholder="yyyy-mm-dd" className="flex-1" />
        <Input icon={CircleDollarSign} placeholder="0.00" isCurrency className="flex-1" />
      </div>

      {/* Checkbox row */}
      <div className="flex items-center gap-4 bg-container-background rounded-md px-3 h-12">
        <SquareCheckBig className="h-5 w-5 text-iron-gray" />
        <div className="flex items-center gap-6">
          <Checkbox id="personal" label="Personal" />
          <Checkbox id="split" label="Split" />
        </div>
      </div>

      {/* Current Month checkbox — only when payment type has no statement */}
      {showCurrentMonth && (
        <div className="flex items-center gap-4 bg-container-background rounded-md px-3 h-12">
          <SquareCheckBig className="h-5 w-5 text-iron-gray" />
          <Checkbox id="currentMonth" label="Current Month" />
        </div>
      )}
    </div>

    <DialogFooter className="flex-col gap-3 sm:flex-row">
      {isEdit && (
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
      )}
      <Button className="flex-1" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

The **Current Month** checkbox is conditional — it appears only when the selected payment type has `has_statement = false`. Show a small annotation tooltip near the checkbox explaining this to the user (e.g. "Only shown when the selected payment type has no statement").

---

## 18. What NOT to Do

- **Do not add a light mode.** The design has no light mode. Do not add `dark:` class variants.
- **Do not use box-shadow for focus states.** Use `border-orange` (the Input focus pattern).
- **Do not use colors outside the token list** for UI elements. Only add a raw hex if it's a one-off decorative element with no semantic meaning.
- **Do not change the font.** Roboto Slab is the brand font.
- **Do not use `rounded-none` broadly.** Inputs, cards, and buttons always have radius.
- **Do not skip the `focus-visible:ring-1` on interactive elements** — it is required for accessibility.
