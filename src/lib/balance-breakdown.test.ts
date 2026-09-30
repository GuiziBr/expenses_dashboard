import { describe, expect, it } from "vitest"
import type { BreakdownItem } from "@/types/balance-breakdown"
import {
	buildBreakdownView,
	formatShare,
	getItemLabel,
	OTHER_COLOR,
	SLICE_COLORS
} from "./balance-breakdown"

// Builds ranked items from totals (already sorted descending by the caller).
const toItems = (totals: number[]): BreakdownItem[] =>
	totals.map((total, index) => ({
		id: `id-${index + 1}`,
		label: `Item ${index + 1}`,
		total
	}))

const kinds = (totals: number[]) =>
	buildBreakdownView(toItems(totals)).slices.map((slice) => slice.kind)

// ── Empty / degenerate input ────────────────────────────────────────

describe("buildBreakdownView – empty input", () => {
	it("returns an empty view for no items", () => {
		const view = buildBreakdownView([])
		expect(view.rows).toEqual([])
		expect(view.slices).toEqual([])
		expect(view.top).toBeNull()
		expect(view.monthTotal).toBe(0)
	})

	it("treats a zero month total as empty without dividing by zero", () => {
		const view = buildBreakdownView(toItems([0, 0]))
		expect(view.slices).toEqual([])
		expect(view.top).toBeNull()
	})
})

// ── Totals and shares (BR-15, BR-16) ────────────────────────────────

describe("buildBreakdownView – totals and shares", () => {
	it("sums every item into the month total", () => {
		expect(buildBreakdownView(toItems([500, 300, 200])).monthTotal).toBe(1000)
	})

	it("computes each share from its total over the month total", () => {
		const { rows } = buildBreakdownView(toItems([500, 300, 200]))
		expect(rows.map((row) => row.share)).toEqual([50, 30, 20])
	})

	it("assigns ranks by response position, without re-sorting (BR-04)", () => {
		const { rows } = buildBreakdownView(toItems([100, 100, 100]))
		expect(rows.map((row) => row.id)).toEqual(["id-1", "id-2", "id-3"])
		expect(rows.map((row) => row.rank)).toEqual([1, 2, 3])
	})
})

// ── Own slices and colours (BR-10, BR-30, BR-32) ────────────────────

describe("buildBreakdownView – own slices", () => {
	it("gives ranks 1–5 their own slice, coloured by rank", () => {
		const { rows } = buildBreakdownView(toItems([20, 20, 20, 20, 20]))
		expect(rows.map((row) => row.color)).toEqual([...SLICE_COLORS])
		expect(rows.every((row) => !row.inOther)).toBe(true)
	})

	it("returns a single full slice for one item", () => {
		const view = buildBreakdownView(toItems([1234]))
		expect(view.slices).toHaveLength(1)
		expect(view.rows[0]).toMatchObject({
			share: 100,
			color: SLICE_COLORS[0],
			inOther: false
		})
	})
})

// ── Other grouping (BR-11 to BR-14, AC-04 to AC-06) ─────────────────

describe("buildBreakdownView – Other grouping", () => {
	it("AC-04: 12 items with ranks 1–5 ≥ 4% → 5 slices + Other of 7", () => {
		const totals = [14, 14, 14, 14, 14, 5, 5, 5, 5, 4, 3, 3]
		const view = buildBreakdownView(toItems(totals))

		expect(kinds(totals)).toEqual([
			"item",
			"item",
			"item",
			"item",
			"item",
			"other"
		])
		const other = view.slices.at(-1)
		expect(other).toMatchObject({ kind: "other", count: 7, total: 30 })
		expect(other?.kind === "other" && other.share).toBe(30)
		expect(view.rows.filter((row) => row.inOther)).toHaveLength(7)
	})

	it("AC-05: rank 4 under 4% with two or more left → rank 4+ go to Other", () => {
		// 4th item = 3.2%, plus a 5th item
		const totals = [400, 300, 250, 32, 18]
		const view = buildBreakdownView(toItems(totals))

		expect(view.rows.map((row) => row.inOther)).toEqual([
			false,
			false,
			false,
			true,
			true
		])
		expect(view.slices.at(-1)).toMatchObject({ kind: "other", count: 2 })
		expect(view.slices).toHaveLength(4)
	})

	it("AC-05: rank 4 under 4% and alone → own light-gray slice with its name", () => {
		const totals = [400, 300, 268, 32]
		const view = buildBreakdownView(toItems(totals))

		expect(view.slices.map((slice) => slice.kind)).toEqual([
			"item",
			"item",
			"item",
			"item"
		])
		expect(view.rows[3]).toMatchObject({
			label: "Item 4",
			color: OTHER_COLOR,
			inOther: false
		})
	})

	it("AC-06: 6 items all ≥ 4% → 6th gets its own light-gray slice, no Other", () => {
		const totals = [20, 20, 20, 15, 15, 10]
		const view = buildBreakdownView(toItems(totals))

		expect(view.slices).toHaveLength(6)
		expect(view.slices.some((slice) => slice.kind === "other")).toBe(false)
		expect(view.rows[5]).toMatchObject({
			label: "Item 6",
			color: OTHER_COLOR,
			inOther: false
		})
	})

	it("BR-11: rank 1 keeps its own slice even when all items are below 4%", () => {
		// 30 items at ~3.33%
		const totals = Array.from({ length: 30 }, () => 10)
		const view = buildBreakdownView(toItems(totals))

		expect(view.slices).toHaveLength(2)
		expect(view.slices[0]).toMatchObject({ kind: "item" })
		expect(view.slices[1]).toMatchObject({ kind: "other", count: 29 })
	})

	it("BR-12: a small item cuts the own slices even before rank 5", () => {
		const totals = [970, 30]
		const two = buildBreakdownView(toItems(totals))
		// exactly one leftover → own light-gray slice, not Other
		expect(two.rows[1]).toMatchObject({ color: OTHER_COLOR, inOther: false })

		const four = buildBreakdownView(toItems([940, 30, 20, 10]))
		expect(four.slices.map((slice) => slice.kind)).toEqual(["item", "other"])
		expect(four.slices[1]).toMatchObject({ kind: "other", count: 3 })
	})

	it("BR-12: exactly 4% still gets its own slice", () => {
		const view = buildBreakdownView(toItems([48, 48, 4]))
		expect(view.rows[2]).toMatchObject({
			color: SLICE_COLORS[2],
			inOther: false
		})
	})

	it("BR-12: just under 4% falls out (3.9%)", () => {
		const view = buildBreakdownView(toItems([490, 471, 39]))
		expect(view.rows[2]).toMatchObject({ color: OTHER_COLOR, inOther: false })
	})

	it("BR-17: Other total and share sum the grouped items", () => {
		const view = buildBreakdownView(toItems([60, 30, 3, 3, 2, 2]))
		const other = view.slices.at(-1)
		expect(other).toMatchObject({ kind: "other", count: 4, total: 10 })
		expect(other?.kind === "other" && other.share).toBe(10)
	})

	it("always places the Other slice last", () => {
		const view = buildBreakdownView(toItems([50, 20, 10, 5, 5, 4, 3, 3]))
		expect(view.slices.at(-1)?.kind).toBe("other")
		expect(view.slices.filter((slice) => slice.kind === "other")).toHaveLength(
			1
		)
	})

	it("keeps every item in rows, including those in Other", () => {
		const totals = [15, 15, 15, 15, 15, 5, 5, 5, 5, 5]
		expect(buildBreakdownView(toItems(totals)).rows).toHaveLength(10)
	})
})

// ── Top item and insight (BR-18) ────────────────────────────────────

describe("buildBreakdownView – top item and insight", () => {
	it("returns the rank 1 row as top", () => {
		expect(buildBreakdownView(toItems([700, 300])).top).toMatchObject({
			id: "id-1",
			rank: 1
		})
	})

	it("hides the top-3 share with fewer than 4 items", () => {
		expect(buildBreakdownView(toItems([50, 30, 20])).topThreeShare).toBeNull()
	})

	it("computes the top-3 share with 4 or more items", () => {
		const view = buildBreakdownView(toItems([40, 30, 20, 10]))
		expect(view.topThreeShare).toBe(90)
	})
})

// ── Null entries (BR-21, BR-22) ─────────────────────────────────────

describe("buildBreakdownView – null bank / store entry", () => {
	const nullEntry: BreakdownItem = { id: null, label: null, total: 400 }

	it("keeps the null entry in its ranked position", () => {
		const view = buildBreakdownView([
			{ id: "b1", label: "Chase", total: 500 },
			nullEntry,
			{ id: "b2", label: "TD", total: 100 }
		])
		expect(view.rows[1]).toMatchObject({ id: null, label: null, rank: 2 })
		expect(view.rows).toHaveLength(3)
	})

	it("can be the top item", () => {
		const view = buildBreakdownView([
			nullEntry,
			{ id: "b1", label: "Chase", total: 100 }
		])
		expect(view.top).toMatchObject({ id: null, label: null })
	})

	it("can fall into Other", () => {
		const view = buildBreakdownView([
			{ id: "b1", label: "A", total: 500 },
			{ id: "b2", label: "B", total: 400 },
			{ id: "b3", label: "C", total: 90 },
			{ id: null, label: null, total: 5 },
			{ id: "b4", label: "D", total: 5 }
		])
		const nullRow = view.rows.find((row) => row.id === null)
		expect(nullRow?.inOther).toBe(true)
	})
})

// ── formatShare (BR-16) ─────────────────────────────────────────────

describe("formatShare", () => {
	it("formats with one decimal", () => {
		expect(formatShare(16.83)).toBe("16.8%")
	})

	it("keeps a trailing zero", () => {
		expect(formatShare(50)).toBe("50.0%")
	})

	it("shows <0.1% for tiny non-zero shares", () => {
		expect(formatShare(0.04)).toBe("<0.1%")
	})

	it("shows 0.1% at the boundary", () => {
		expect(formatShare(0.1)).toBe("0.1%")
	})

	it("shows 0.0% for zero", () => {
		expect(formatShare(0)).toBe("0.0%")
	})
})

// ── getItemLabel (BR-21) ────────────────────────────────────────────

describe("getItemLabel", () => {
	it("returns a real label untouched", () => {
		expect(getItemLabel("Chase", "banks")).toEqual({
			text: "Chase",
			isPlaceholder: false
		})
	})

	it("reads 'No bank' for a null bank", () => {
		expect(getItemLabel(null, "banks")).toEqual({
			text: "No bank",
			isPlaceholder: true
		})
	})

	it("reads 'No store' for a null store", () => {
		expect(getItemLabel(null, "stores")).toEqual({
			text: "No store",
			isPlaceholder: true
		})
	})

	it("falls back to a dash for groupings that never return null", () => {
		expect(getItemLabel(null, "categories")).toMatchObject({ text: "—" })
	})
})
