import type {
	BreakdownItem,
	BreakdownRow,
	BreakdownSlice,
	BreakdownView
} from "@/types/balance-breakdown"

// ── Constants ───────────────────────────────────────────────────────

export const MAX_OWN_SLICES = 5
export const SMALL_SHARE_THRESHOLD = 4 // percent of the month
const INSIGHT_MIN_ITEMS = 4

export const SLICE_COLORS = [
	"--orange",
	"--blue-sky",
	"--green",
	"--pink",
	"--light-blue"
] as const
export const OTHER_COLOR = "--light-gray"

// ── Helpers ─────────────────────────────────────────────────────────

const EMPTY_VIEW: BreakdownView = {
	monthTotal: 0,
	rows: [],
	slices: [],
	top: null,
	topThreeShare: null
}

const toShare = (total: number, monthTotal: number) =>
	(total / monthTotal) * 100

/**
 * Number of leading items that get their own coloured slice.
 * Compared in integer cents to avoid float noise at the 4% boundary.
 */
function countOwnSlices(items: BreakdownItem[], monthTotal: number): number {
	let leading = 0
	for (const item of items.slice(0, MAX_OWN_SLICES)) {
		if (item.total * 100 < monthTotal * SMALL_SHARE_THRESHOLD) break
		leading++
	}
	return Math.max(1, leading)
}

// ── Public Helpers ──────────────────────────────────────────────────

/**
 * Group a ranked breakdown into donut slices, legend rows and totals.
 * Items must already be sorted by total, descending (BR-04).
 *
 * @example
 * buildBreakdownView([{ id: "a", label: "Groceries", total: 500 }]).top?.share → 100
 */
export function buildBreakdownView(items: BreakdownItem[]): BreakdownView {
	const monthTotal = items.reduce((sum, item) => sum + item.total, 0)
	if (items.length === 0 || monthTotal <= 0) return EMPTY_VIEW

	const ownCount = countOwnSlices(items, monthTotal)
	const singleLeftover = items.length - ownCount === 1
	const otherStart = singleLeftover ? items.length : ownCount

	const rows: BreakdownRow[] = items.map((item, index) => ({
		...item,
		rank: index + 1,
		share: toShare(item.total, monthTotal),
		color: index < ownCount ? (SLICE_COLORS[index] as string) : OTHER_COLOR,
		inOther: index >= otherStart
	}))

	const slices: BreakdownSlice[] = rows
		.filter((row) => !row.inOther)
		.map((row) => ({ kind: "item", row }))

	const otherRows = rows.filter((row) => row.inOther)
	if (otherRows.length > 0) {
		const total = otherRows.reduce((sum, row) => sum + row.total, 0)
		slices.push({
			kind: "other",
			color: OTHER_COLOR,
			count: otherRows.length,
			total,
			share: toShare(total, monthTotal)
		})
	}

	const topThreeTotal = rows
		.slice(0, 3)
		.reduce((sum, row) => sum + row.total, 0)

	return {
		monthTotal,
		rows,
		slices,
		top: rows[0],
		topThreeShare:
			items.length >= INSIGHT_MIN_ITEMS
				? toShare(topThreeTotal, monthTotal)
				: null
	}
}

/**
 * Format a share with one decimal. Tiny non-zero shares read "<0.1%".
 * @example formatShare(16.83) → "16.8%"
 */
export function formatShare(share: number): string {
	if (share > 0 && share < 0.1) return "<0.1%"
	return `${share.toFixed(1)}%`
}
