// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import { useConsolidatedBalance } from "./use-consolidated-balance"

vi.mock("@/lib/api", () => ({
	api: { get: vi.fn() }
}))

describe("useConsolidatedBalance", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("fetches the consolidated balance for the year and month", async () => {
		const report = { total: 100 }
		vi.mocked(api.get).mockResolvedValue(report)
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useConsolidatedBalance(2026, 3), {
			wrapper
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(api.get).toHaveBeenCalledWith("balance/consolidated/2026/3")
		expect(result.current.data).toEqual(report)
	})

	it.each([
		[null, 3],
		[2026, null],
		[null, null]
	])("does not fetch when year=%s and month=%s", (year, month) => {
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useConsolidatedBalance(year, month), {
			wrapper
		})

		expect(result.current.fetchStatus).toBe("idle")
		expect(api.get).not.toHaveBeenCalled()
	})

	it("exposes the error when the request fails", async () => {
		vi.mocked(api.get).mockRejectedValue(new Error("boom"))
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useConsolidatedBalance(2026, 3), {
			wrapper
		})

		await waitFor(() => expect(result.current.isError).toBe(true))
	})
})
