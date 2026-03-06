import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getFirstDayOfMonth, getLastDayOfMonth, getTodayString } from "./date-utils"

// Use the local-time constructor (year, month 0-indexed, day) to avoid
// timezone issues that arise when passing ISO strings (parsed as UTC).

describe("getFirstDayOfMonth", () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it("returns the first day of the current month", () => {
		vi.setSystemTime(new Date(2026, 2, 15)) // March 15 2026 local time
		expect(getFirstDayOfMonth()).toBe("2026-03-01")
	})

	it("handles January correctly", () => {
		vi.setSystemTime(new Date(2026, 0, 31)) // Jan 31 2026 local time
		expect(getFirstDayOfMonth()).toBe("2026-01-01")
	})
})

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
