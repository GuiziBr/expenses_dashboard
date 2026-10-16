// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import { useFilterValues } from "./use-filter-values"

vi.mock("@/lib/api", () => ({
	api: { get: vi.fn() }
}))

describe("useFilterValues", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("fetches the options for the given filter type", async () => {
		const options = [{ id: "1", description: "Groceries" }]
		vi.mocked(api.get).mockResolvedValue(options)
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useFilterValues("categories"), {
			wrapper
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(api.get).toHaveBeenCalledWith("categories")
		expect(result.current.data).toEqual(options)
	})

	it("does not fetch while no filter type is selected", () => {
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useFilterValues(undefined), {
			wrapper
		})

		expect(result.current.fetchStatus).toBe("idle")
		expect(api.get).not.toHaveBeenCalled()
	})

	it("exposes the error when the request fails", async () => {
		vi.mocked(api.get).mockRejectedValue(new Error("boom"))
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useFilterValues("banks"), { wrapper })

		await waitFor(() => expect(result.current.isError).toBe(true))
	})
})
