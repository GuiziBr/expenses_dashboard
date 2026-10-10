import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
	getLastDayOfMonth,
	getMonthRange,
	getTodayString,
	isFullMonthRange
} from "./date-utils"

// Use the local-time constructor (year, month 0-indexed, day) to avoid
// timezone issues that arise when passing ISO strings (parsed as UTC).

describe("getLastDayOfMonth", () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it("returns the last day of a 31-day month", () => {
		vi.setSystemTime(new Date(2026, 2, 1)) // March 2026
		expect(getLastDayOfMonth()).toBe("2026-03-31")
	})

	it("returns the last day of a 30-day month", () => {
		vi.setSystemTime(new Date(2026, 3, 1)) // April 2026
		expect(getLastDayOfMonth()).toBe("2026-04-30")
	})

	it("returns Feb 28 on a non-leap year", () => {
		vi.setSystemTime(new Date(2025, 1, 1)) // Feb 2025
		expect(getLastDayOfMonth()).toBe("2025-02-28")
	})

	it("returns Feb 29 on a leap year", () => {
		vi.setSystemTime(new Date(2024, 1, 1)) // Feb 2024
		expect(getLastDayOfMonth()).toBe("2024-02-29")
	})
})

describe("getTodayString", () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it("returns today's date as yyyy-MM-dd", () => {
		vi.setSystemTime(new Date(2026, 2, 5)) // March 5 2026 local time
		expect(getTodayString()).toBe("2026-03-05")
	})
})

describe("getMonthRange", () => {
	it("returns the first and last day of a month", () => {
		expect(getMonthRange({ year: 2026, month: 9 })).toEqual({
			startDate: "2026-09-01",
			endDate: "2026-09-30"
		})
	})

	it("handles February in a leap year and a non-leap year", () => {
		expect(getMonthRange({ year: 2028, month: 2 }).endDate).toBe("2028-02-29")
		expect(getMonthRange({ year: 2027, month: 2 }).endDate).toBe("2027-02-28")
	})

	it("handles December", () => {
		expect(getMonthRange({ year: 2026, month: 12 })).toEqual({
			startDate: "2026-12-01",
			endDate: "2026-12-31"
		})
	})
})

describe("isFullMonthRange", () => {
	const month = { year: 2026, month: 9 }

	it("is true for exactly the whole month", () => {
		expect(isFullMonthRange("2026-09-01", "2026-09-30", month)).toBe(true)
	})

	it("is false for a partial range, another month or missing dates", () => {
		expect(isFullMonthRange("2026-09-05", "2026-09-30", month)).toBe(false)
		expect(isFullMonthRange("2026-09-01", "2026-09-29", month)).toBe(false)
		expect(isFullMonthRange("2026-08-01", "2026-08-31", month)).toBe(false)
		expect(isFullMonthRange(undefined, undefined, month)).toBe(false)
	})
})
