/**
 * Balance Breakdown types.
 *
 * - `BreakdownItem` is the normalised API entry (see `GET /balance/breakdown`).
 * - `BreakdownView` is the UI-ready shape derived by `buildBreakdownView`.
 */

// ── API ────────────────────────────────────────────────────────────

/** Raw entry: `description` for category / payment type, `name` for bank / store. */
export interface RawBreakdownItem {
	id: string | null
	description?: string | null
	name?: string | null
	total: number // in cents
}

// ── Input ───────────────────────────────────────────────────────────

export interface BreakdownItem {
	id: string | null
	label: string | null // null → expenses without a bank / store
	total: number // in cents
}

// ── Derived View ────────────────────────────────────────────────────

export interface BreakdownRow extends BreakdownItem {
	rank: number // 1-based position in the API response
	share: number // 0–100, unrounded
	color: string // design token, e.g. "--orange"
	inOther: boolean // true when merged into the Other group
}

export type BreakdownSlice =
	| { kind: "item"; row: BreakdownRow }
	| {
			kind: "other"
			color: string
			count: number
			total: number
			share: number
	  }

export interface BreakdownView {
	monthTotal: number
	rows: BreakdownRow[] // every item, in ranked order
	slices: BreakdownSlice[] // donut slices, in draw order (Other last)
	top: BreakdownRow | null
	topThreeShare: number | null // null when fewer than 4 items
}

/** What the user selected: one ranked item, or the whole Other group. */
export type BreakdownSelection =
	| { kind: "item"; rank: number }
	| { kind: "other" }
