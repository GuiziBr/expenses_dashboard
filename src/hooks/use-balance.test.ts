import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { buildBalanceParams } from "./use-balance"

describe("buildBalanceParams", () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it("uses last day of current month as default endDate", () => {
		vi.setSystemTime(new Date(2026, 2, 15)) // March 2026
		const params = new URLSearchParams(buildBalanceParams({}))
		expect(params.get("endDate")).toBe("2026-03-31")
	})

	it("uses provided endDate when given", () => {
		vi.setSystemTime(new Date(2026, 2, 15))
		const params = new URLSearchParams(buildBalanceParams({ endDate: "2026-03-15" }))
		expect(params.get("endDate")).toBe("2026-03-15")
	})

	it("includes startDate when provided", () => {
		vi.setSystemTime(new Date(2026, 2, 15))
		const params = new URLSearchParams(buildBalanceParams({ startDate: "2026-03-01" }))
		expect(params.get("startDate")).toBe("2026-03-01")
	})

	it("omits startDate when not provided", () => {
		vi.setSystemTime(new Date(2026, 2, 15))
		const params = new URLSearchParams(buildBalanceParams({}))
		expect(params.get("startDate")).toBeNull()
	})

	it.each([
		["categories", "category"],
		["paymentType", "payment_type"],
		["banks", "bank"],
		["stores", "store"]
	] as const)("maps filterBy '%s' to '%s'", (input, expected) => {
		vi.setSystemTime(new Date(2026, 2, 15))
		const params = new URLSearchParams(
			buildBalanceParams({ filterBy: input, filterValue: "val-1" })
		)
		expect(params.get("filterBy")).toBe(expected)
		expect(params.get("filterValue")).toBe("val-1")
	})

	it("omits filterBy and filterValue when filterBy is not set", () => {
		vi.setSystemTime(new Date(2026, 2, 15))
		const params = new URLSearchParams(buildBalanceParams({ filterValue: "orphan" }))
		expect(params.get("filterBy")).toBeNull()
		expect(params.get("filterValue")).toBeNull()
	})

	it("omits filterValue when filterBy is set but filterValue is absent", () => {
		vi.setSystemTime(new Date(2026, 2, 15))
		const params = new URLSearchParams(buildBalanceParams({ filterBy: "banks" }))
		expect(params.get("filterBy")).toBe("bank")
		expect(params.get("filterValue")).toBeNull()
	})
})
