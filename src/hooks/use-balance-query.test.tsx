// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import { useBalance } from "./use-balance"

vi.mock("@/lib/api", () => ({
	api: { get: vi.fn() }
}))

describe("useBalance", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers({ toFake: ["Date"] })
		vi.setSystemTime(new Date(2026, 2, 15))
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it("fetches the balance using the filters as query params", async () => {
		const balance = { personalBalance: 10 }
		vi.mocked(api.get).mockResolvedValue(balance)
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(
			() =>
				useBalance({
					startDate: "2026-03-01",
					filterBy: "categories",
					filterValue: "cat-1"
				}),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		const [url] = vi.mocked(api.get).mock.calls[0]
		const qs = new URLSearchParams(url.split("?")[1])
		expect(url.startsWith("balance?")).toBe(true)
		expect(qs.get("startDate")).toBe("2026-03-01")
		expect(qs.get("endDate")).toBe("2026-03-31")
		expect(qs.get("filterBy")).toBe("category")
		expect(qs.get("filterValue")).toBe("cat-1")
		expect(result.current.data).toEqual(balance)
	})

	it("works without filters", async () => {
		vi.mocked(api.get).mockResolvedValue({})
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useBalance(), { wrapper })

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(api.get).toHaveBeenCalledWith("balance?endDate=2026-03-31")
	})

	it("exposes the error when the request fails", async () => {
		vi.mocked(api.get).mockRejectedValue(new Error("boom"))
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useBalance(), { wrapper })

		await waitFor(() => expect(result.current.isError).toBe(true))
	})
})
