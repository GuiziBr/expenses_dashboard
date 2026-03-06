import { describe, expect, it } from "vitest"
import { formatCurrency } from "./format-currency"

describe("formatCurrency", () => {
	it("formats a typical value in cents as CAD currency", () => {
		expect(formatCurrency(150000)).toContain("1,500.00")
	})

	it("formats zero", () => {
		expect(formatCurrency(0)).toContain("0.00")
	})

	it("formats one cent correctly", () => {
		expect(formatCurrency(1)).toContain("0.01")
	})

	it("formats a value with no decimal remainder", () => {
		expect(formatCurrency(10000)).toContain("100.00")
	})
})
