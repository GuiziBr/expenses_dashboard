import { describe, expect, it } from "vitest"
import {
	getPageMeta,
	getPageTitle,
	isManagementPath,
	isMonthRoute,
	isMoreTabActive,
	isNavItemActive,
	MAIN_NAV_ITEMS,
	MANAGEMENT_NAV_ITEMS,
	MOBILE_TAB_ITEMS,
	MORE_NAV_ITEMS,
	NAV_GROUPS
} from "./navigation"

describe("navigation config", () => {
	it("groups the dashboards and reports in order", () => {
		expect(NAV_GROUPS.map((group) => group.id)).toEqual([
			"dashboards",
			"reports"
		])
		expect(MAIN_NAV_ITEMS.map((item) => item.href)).toEqual([
			"/shared-dashboard",
			"/personal-dashboard",
			"/balance-breakdown",
			"/consolidated-balance"
		])
	})

	it("lists every management page, including stores", () => {
		expect(MANAGEMENT_NAV_ITEMS.map((item) => item.href)).toEqual([
			"/management/banks",
			"/management/categories",
			"/management/payment-types",
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
		expect(isNavItemActive("/shared-dashboard", "/shared-dashboard")).toBe(true)
		expect(isNavItemActive("/personal-dashboard", "/shared-dashboard")).toBe(
			false
		)
		expect(isNavItemActive(null, "/shared-dashboard")).toBe(false)
	})
})

describe("isManagementPath", () => {
	it("matches the management section and its pages", () => {
		expect(isManagementPath("/management")).toBe(true)
		expect(isManagementPath("/management/banks")).toBe(true)
	})

	it("does not match other paths", () => {
		expect(isManagementPath("/managementFoo")).toBe(false)
		expect(isManagementPath("/shared-dashboard")).toBe(false)
		expect(isManagementPath(null)).toBe(false)
	})
})

describe("getPageTitle", () => {
	it("returns the label of the matching main item", () => {
		expect(getPageTitle("/balance-breakdown")).toBe("Balance Breakdown")
		expect(getPageTitle("/shared-dashboard")).toBe("Shared Dashboard")
	})

	it("returns Management for management pages", () => {
		expect(getPageTitle("/management/stores")).toBe("Management")
	})

	it("falls back to Dashboard", () => {
		expect(getPageTitle("/unknown")).toBe("Dashboard")
		expect(getPageTitle(null)).toBe("Dashboard")
	})
})

describe("mobile tabs", () => {
	it("uses short labels for the three primary tabs", () => {
		expect(MOBILE_TAB_ITEMS.map((tab) => tab.label)).toEqual([
			"Personal",
			"Breakdown",
			"Consolidated"
		])
		expect(MOBILE_TAB_ITEMS.map((tab) => tab.href)).toEqual([
			"/personal-dashboard",
			"/balance-breakdown",
			"/consolidated-balance"
		])
	})

	it("moves the remaining main items into More", () => {
		expect(MORE_NAV_ITEMS.map((item) => item.href)).toEqual([
			"/shared-dashboard"
		])
	})

	it("flags More as active for its pages and management only", () => {
		expect(isMoreTabActive("/shared-dashboard")).toBe(true)
		expect(isMoreTabActive("/management/stores")).toBe(true)
		expect(isMoreTabActive("/balance-breakdown")).toBe(false)
		expect(isMoreTabActive(null)).toBe(false)
	})
})

describe("month pages", () => {
	it("follow the month only on the shared, personal and breakdown pages", () => {
		expect(isMonthRoute("/shared-dashboard")).toBe(true)
		expect(isMonthRoute("/personal-dashboard")).toBe(true)
		expect(isMonthRoute("/balance-breakdown")).toBe(true)
		expect(isMonthRoute("/consolidated-balance")).toBe(false)
		expect(isMonthRoute("/management/banks")).toBe(false)
		expect(isMonthRoute(null)).toBe(false)
	})
})

describe("getPageMeta", () => {
	it("describes the top bar for each kind of page", () => {
		expect(getPageMeta("/shared-dashboard")).toEqual({
			title: "Shared Dashboard",
			hasMonthPicker: true,
			hasStickyMonthPicker: true,
			canCreateExpense: true
		})
		expect(getPageMeta("/balance-breakdown")).toEqual({
			title: "Balance Breakdown",
			hasMonthPicker: true,
			hasStickyMonthPicker: false,
			canCreateExpense: true
		})
		expect(getPageMeta("/consolidated-balance")).toEqual({
			title: "Consolidated Balance",
			hasMonthPicker: false,
			hasStickyMonthPicker: false,
			canCreateExpense: false
		})
		expect(getPageMeta("/management/stores")).toEqual({
			title: "Management",
			hasMonthPicker: false,
			hasStickyMonthPicker: false,
			canCreateExpense: false
		})
	})
})
