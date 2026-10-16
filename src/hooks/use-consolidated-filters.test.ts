// @vitest-environment jsdom
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
let search = ""

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
	usePathname: () => "/consolidatedBalance",
	useSearchParams: () => new URLSearchParams(search)
}))

import { useConsolidatedFilters } from "./use-consolidated-filters"

beforeEach(() => {
	push.mockClear()
	search = ""
})

describe("useConsolidatedFilters", () => {
	it("derives the period and type from the URL", () => {
		search = "month=2026-08&type=categories"
		const { result } = renderHook(() => useConsolidatedFilters())

		expect(result.current.period).toEqual({ year: 2026, month: 8 })
		expect(result.current.date).toBe("2026-08")
		expect(result.current.balanceType).toBe("categories")
	})

	it("has no period without a valid month", () => {
		const { result } = renderHook(() => useConsolidatedFilters())
		expect(result.current.period).toBeNull()
	})

	it("pushes the searched month and keeps the type", () => {
		search = "type=payments"
		const { result } = renderHook(() => useConsolidatedFilters())

		result.current.onSearch({ date: "2026-09" })

		expect(push).toHaveBeenCalledWith(
			"/consolidatedBalance?type=payments&month=2026-09",
			{ scroll: false }
		)
	})

	it("pushes the balance type and keeps the month", () => {
		search = "month=2026-09"
		const { result } = renderHook(() => useConsolidatedFilters())

		result.current.onBalanceTypeChange("payments")

		expect(push).toHaveBeenCalledWith(
			"/consolidatedBalance?month=2026-09&type=payments",
			{ scroll: false }
		)
	})
})
