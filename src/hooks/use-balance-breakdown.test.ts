import { describe, expect, it } from "vitest"
import { buildBreakdownPath, normalizeBreakdown } from "./use-balance-breakdown"

describe("buildBreakdownPath", () => {
	it("puts year and month in the route", () => {
		const path = buildBreakdownPath(2026, 9, "categories")
		expect(path.startsWith("balance/breakdown/2026/9?")).toBe(true)
	})

	it("keeps the month 1-indexed and unpadded", () => {
		expect(buildBreakdownPath(2026, 1, "banks")).toContain("/2026/1?")
		expect(buildBreakdownPath(2026, 12, "banks")).toContain("/2026/12?")
	})

	it.each([
		["categories", "category"],
		["paymentType", "payment_type"],
		["banks", "bank"],
		["stores", "store"]
	] as const)("maps groupBy '%s' to filterBy '%s'", (input, expected) => {
		const [, qs] = buildBreakdownPath(2026, 3, input).split("?")
		expect(new URLSearchParams(qs).get("filterBy")).toBe(expected)
	})
})

describe("normalizeBreakdown", () => {
	it("uses description as the label for category / payment type", () => {
		expect(
			normalizeBreakdown([{ id: "c1", description: "Groceries", total: 42000 }])
		).toEqual([{ id: "c1", label: "Groceries", total: 42000 }])
	})

	it("uses name as the label for bank / store", () => {
		expect(
			normalizeBreakdown([{ id: "b1", name: "Chase", total: 38000 }])
		).toEqual([{ id: "b1", label: "Chase", total: 38000 }])
	})

	it("keeps the null bank / store entry with a null label", () => {
		expect(
			normalizeBreakdown([{ id: null, name: null, total: 19000 }])
		).toEqual([{ id: null, label: null, total: 19000 }])
	})

	it("preserves the API order", () => {
		const result = normalizeBreakdown([
			{ id: "a", description: "A", total: 3 },
			{ id: "b", description: "B", total: 2 },
			{ id: "c", description: "C", total: 1 }
		])
		expect(result.map((item) => item.id)).toEqual(["a", "b", "c"])
	})

	it("returns an empty list for an empty response", () => {
		expect(normalizeBreakdown([])).toEqual([])
	})
})
