import { describe, expect, it } from "vitest"
import {
	getPageTitle,
	isManagementPath,
	isNavItemActive,
	MAIN_NAV_ITEMS,
	MANAGEMENT_NAV_ITEMS,
	NAV_GROUPS
} from "./navigation"

describe("navigation config", () => {
	it("groups the dashboards and reports in order", () => {
		expect(NAV_GROUPS.map((group) => group.id)).toEqual([
			"dashboards",
			"reports"
		])
		expect(MAIN_NAV_ITEMS.map((item) => item.href)).toEqual([
			"/sharedDashboard",
			"/personalDashboard",
			"/consolidatedBalance",
			"/balanceBreakdown"
		])
	})

	it("lists every management page, including stores", () => {
		expect(MANAGEMENT_NAV_ITEMS.map((item) => item.href)).toEqual([
			"/management/banks",
			"/management/categories",
			"/management/paymentTypes",
			"/management/stores"
		])
	})

	it("has a unique href and an icon for every item", () => {
		const items = [...MAIN_NAV_ITEMS, ...MANAGEMENT_NAV_ITEMS]
		expect(new Set(items.map((item) => item.href)).size).toBe(items.length)
		for (const item of items) {
			expect(item.label).not.toBe("")
			expect(item.icon).toBeDefined()
		}
	})
})

describe("isNavItemActive", () => {
	it("matches only the exact path", () => {
		expect(isNavItemActive("/sharedDashboard", "/sharedDashboard")).toBe(true)
		expect(isNavItemActive("/personalDashboard", "/sharedDashboard")).toBe(
			false
		)
		expect(isNavItemActive(null, "/sharedDashboard")).toBe(false)
	})
})

describe("isManagementPath", () => {
	it("matches the management section and its pages", () => {
		expect(isManagementPath("/management")).toBe(true)
		expect(isManagementPath("/management/banks")).toBe(true)
	})

	it("does not match other paths", () => {
		expect(isManagementPath("/managementFoo")).toBe(false)
		expect(isManagementPath("/sharedDashboard")).toBe(false)
		expect(isManagementPath(null)).toBe(false)
	})
})

describe("getPageTitle", () => {
	it("returns the label of the matching main item", () => {
		expect(getPageTitle("/balanceBreakdown")).toBe("Balance Breakdown")
		expect(getPageTitle("/sharedDashboard")).toBe("Shared Dashboard")
	})

	it("returns Management for management pages", () => {
		expect(getPageTitle("/management/stores")).toBe("Management")
	})

	it("falls back to Dashboard", () => {
		expect(getPageTitle("/unknown")).toBe("Dashboard")
		expect(getPageTitle(null)).toBe("Dashboard")
	})
})
