// @vitest-environment jsdom
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
let search = ""

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
	usePathname: () => "/balance-breakdown",
	useSearchParams: () => new URLSearchParams(search)
}))

import { useSelectedMonth } from "./use-selected-month"

beforeEach(() => {
	push.mockClear()
	search = ""
})

describe("useSelectedMonth", () => {
	it("reads the month from the URL", () => {
		search = "month=2026-08"
		const { result } = renderHook(() => useSelectedMonth())
		expect(result.current.month).toEqual({ year: 2026, month: 8 })
	})

	it("falls back to the current month for a missing or invalid value", () => {
		const now = new Date()
		const current = { year: now.getFullYear(), month: now.getMonth() + 1 }

		expect(renderHook(() => useSelectedMonth()).result.current.month).toEqual(
			current
		)
		search = "month=2026-13"
		expect(renderHook(() => useSelectedMonth()).result.current.month).toEqual(
			current
		)
	})

	it("pushes the new month and keeps other params", () => {
		search = "groupBy=bank&month=2026-08"
		const { result } = renderHook(() => useSelectedMonth())

		result.current.setMonth({ year: 2027, month: 1 })

		expect(push).toHaveBeenCalledWith(
			"/balance-breakdown?groupBy=bank&month=2027-01",
			{ scroll: false }
		)
	})

	it("clears the custom range and the page on a month change", () => {
		search =
			"month=2026-08&startDate=2026-08-05&endDate=2026-08-10&page=2&filterBy=banks"
		const { result } = renderHook(() => useSelectedMonth())

		result.current.setMonth({ year: 2026, month: 9 })

		expect(push).toHaveBeenCalledWith(
			"/balance-breakdown?month=2026-09&filterBy=banks",
			{ scroll: false }
		)
	})

	it("shifts across a year boundary", () => {
		search = "month=2026-12"
		const { result } = renderHook(() => useSelectedMonth())

		result.current.shift(1)

		expect(push).toHaveBeenCalledWith("/balance-breakdown?month=2027-01", {
			scroll: false
		})
	})
})
