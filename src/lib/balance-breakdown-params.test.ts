import { describe, expect, it } from "vitest"
import {
	buildBreakdownQuery,
	formatMonthParam,
	getCurrentMonth,
	parseGroupBy,
	parseMonth
} from "./balance-breakdown-params"

const NOW = new Date(2026, 8, 29) // September 2026

describe("parseGroupBy", () => {
	it.each([
		["category", "categories"],
		["payment_type", "paymentType"],
		["bank", "banks"],
		["store", "stores"]
	] as const)("maps '%s' to '%s'", (param, expected) => {
		expect(parseGroupBy(param)).toBe(expected)
	})

	it.each([[null], [undefined], [""], ["nope"], ["categories"], ["toString"]])(
		"falls back to categories for %j",
		(value) => {
			expect(parseGroupBy(value)).toBe("categories")
		}
	)
})

describe("parseMonth", () => {
	it("parses a valid YYYY-MM value", () => {
		expect(parseMonth("2026-09", NOW)).toEqual({ year: 2026, month: 9 })
	})

	it("allows future months", () => {
		expect(parseMonth("2031-01", NOW)).toEqual({ year: 2031, month: 1 })
	})

	it("accepts the minimum year", () => {
		expect(parseMonth("1900-01", NOW)).toEqual({ year: 1900, month: 1 })
	})

	it("defaults to the current month when missing", () => {
		expect(parseMonth(null, NOW)).toEqual({ year: 2026, month: 9 })
		expect(parseMonth(undefined, NOW)).toEqual({ year: 2026, month: 9 })
	})

	it.each([
		[""],
		["2026"],
		["2026-9"],
		["2026-13"],
		["2026-00"],
		["abcd-ef"],
		["2026-09-01"],
		["1899-12"]
	])("falls back to the current month for %j", (value) => {
		expect(parseMonth(value, NOW)).toEqual({ year: 2026, month: 9 })
	})
})

describe("formatMonthParam", () => {
	it("pads the month to two digits", () => {
		expect(formatMonthParam({ year: 2026, month: 3 })).toBe("2026-03")
	})

	it("keeps two-digit months as they are", () => {
		expect(formatMonthParam({ year: 2026, month: 12 })).toBe("2026-12")
	})

	it("round-trips with parseMonth", () => {
		const month = { year: 2027, month: 1 }
		expect(parseMonth(formatMonthParam(month), NOW)).toEqual(month)
	})
})

describe("buildBreakdownQuery", () => {
	it("serialises the grouping and month", () => {
		expect(buildBreakdownQuery("categories", { year: 2026, month: 9 })).toBe(
			"groupBy=category&month=2026-09"
		)
	})

	it.each([
		["categories", "category"],
		["paymentType", "payment_type"],
		["banks", "bank"],
		["stores", "store"]
	] as const)("writes '%s' as groupBy=%s", (key, expected) => {
		const query = buildBreakdownQuery(key, { year: 2026, month: 1 })
		expect(new URLSearchParams(query).get("groupBy")).toBe(expected)
	})

	it("round-trips with parseGroupBy", () => {
		const query = buildBreakdownQuery("paymentType", { year: 2026, month: 5 })
		expect(parseGroupBy(new URLSearchParams(query).get("groupBy"))).toBe(
			"paymentType"
		)
	})
})

describe("getCurrentMonth", () => {
	it("returns a 1-indexed month", () => {
		expect(getCurrentMonth(new Date(2026, 0, 15))).toEqual({
			year: 2026,
			month: 1
		})
	})
})
