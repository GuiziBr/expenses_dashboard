// @vitest-environment jsdom
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
let search = ""

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
	usePathname: () => "/personalDashboard",
	useSearchParams: () => new URLSearchParams(search)
}))

vi.mock("@/contexts/page-toolbar-context", () => ({
	useCustomRangeIndicator: vi.fn()
}))

import { useExpenseFilters } from "./use-expense-filters"

const OPTIONS = { scroll: false }

beforeEach(() => {
	push.mockClear()
	search = "month=2026-02"
})

describe("useExpenseFilters", () => {
	it("derives the query params from the URL", () => {
		search =
			"month=2026-02&filterBy=banks&filterValue=b1&orderBy=amount&orderType=desc&page=3"
		const { result } = renderHook(() => useExpenseFilters())

		expect(result.current.params).toEqual({
			offset: 20,
			limit: 10,
			startDate: "2026-02-01",
			endDate: "2026-02-28",
			filterBy: "bank",
			filterValue: "b1",
			orderBy: "amount",
			orderType: "desc"
		})
		expect(result.current.filters.filterBy).toBe("banks")
		expect(result.current.currentPage).toBe(3)
	})

	it("pushes the submitted filters and resets the page", () => {
		search = "month=2026-02&page=3"
		const { result } = renderHook(() => useExpenseFilters())

		result.current.onSearch({
			filterBy: "categories",
			filterValue: "c1",
			startDate: "2026-02-05",
			endDate: "2026-02-10"
		})

		expect(push).toHaveBeenCalledWith(
			"/personalDashboard?month=2026-02&filterBy=categories&filterValue=c1&startDate=2026-02-05&endDate=2026-02-10",
			OPTIONS
		)
	})

	it("leaves the month's own range out of the URL", () => {
		const { result } = renderHook(() => useExpenseFilters())

		result.current.onSearch({
			startDate: "2026-02-01",
			endDate: "2026-02-28"
		})

		expect(push).toHaveBeenCalledWith(
			"/personalDashboard?month=2026-02",
			OPTIONS
		)
	})

	it("toggles the sort and resets the page", () => {
		search = "month=2026-02&page=2"
		const { result } = renderHook(() => useExpenseFilters())

		result.current.toggleSort("amount")
		expect(push).toHaveBeenLastCalledWith(
			"/personalDashboard?month=2026-02&orderBy=amount&orderType=asc",
			OPTIONS
		)

		search = "month=2026-02&orderBy=amount&orderType=asc"
		const again = renderHook(() => useExpenseFilters())
		again.result.current.toggleSort("amount")
		expect(push).toHaveBeenLastCalledWith(
			"/personalDashboard?month=2026-02&orderBy=amount&orderType=desc",
			OPTIONS
		)
		expect(again.result.current.getSortIndicator("amount")).toBe("↑")
		expect(again.result.current.getSortIndicator("date")).toBe("")
	})

	it("changes the page", () => {
		const { result } = renderHook(() => useExpenseFilters())

		result.current.setPage(2)
		expect(push).toHaveBeenLastCalledWith(
			"/personalDashboard?month=2026-02&page=2",
			OPTIONS
		)

		result.current.setPage(1)
		expect(push).toHaveBeenLastCalledWith(
			"/personalDashboard?month=2026-02",
			OPTIONS
		)
	})
})
