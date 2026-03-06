import { describe, expect, it } from "vitest"
import { buildSearchParams } from "./use-expenses"

describe("buildSearchParams", () => {
	it("always includes offset and limit", () => {
		const qs = buildSearchParams({ offset: 0, limit: 10 })
		const params = new URLSearchParams(qs)
		expect(params.get("offset")).toBe("0")
		expect(params.get("limit")).toBe("10")
	})

	it("omits undefined optional filters", () => {
		const qs = buildSearchParams({ offset: 0, limit: 10 })
		expect(qs).not.toContain("startDate")
		expect(qs).not.toContain("endDate")
		expect(qs).not.toContain("filterBy")
		expect(qs).not.toContain("filterValue")
		expect(qs).not.toContain("orderBy")
		expect(qs).not.toContain("orderType")
	})

	it("includes all optional fields when provided", () => {
		const qs = buildSearchParams({
			offset: 5,
			limit: 20,
			startDate: "2026-01-01",
			endDate: "2026-01-31",
			filterBy: "category",
			filterValue: "cat-1",
			orderBy: "date",
			orderType: "desc"
		})
		const params = new URLSearchParams(qs)
		expect(params.get("startDate")).toBe("2026-01-01")
		expect(params.get("endDate")).toBe("2026-01-31")
		expect(params.get("filterBy")).toBe("category")
		expect(params.get("filterValue")).toBe("cat-1")
		expect(params.get("orderBy")).toBe("date")
		expect(params.get("orderType")).toBe("desc")
		expect(params.get("offset")).toBe("5")
		expect(params.get("limit")).toBe("20")
	})

	it("includes only provided optional fields", () => {
		const qs = buildSearchParams({
			offset: 0,
			limit: 10,
			startDate: "2026-03-01"
		})
		const params = new URLSearchParams(qs)
		expect(params.get("startDate")).toBe("2026-03-01")
		expect(params.get("endDate")).toBeNull()
	})
})
