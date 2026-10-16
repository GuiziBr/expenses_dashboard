// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import {
	useCreateStore,
	useDeleteStore,
	useStores,
	useUpdateStore
} from "./use-stores"

vi.mock("@/lib/api", () => ({
	api: {
		getWithHeaders: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn()
	}
}))

const rawStore = {
	id: "store-1",
	name: "Carrefour",
	created_at: "2026-01-10T12:00:00.000Z",
	updated_at: null
}

describe("useStores", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("requests the paged endpoint and maps stores with the total count", async () => {
		vi.mocked(api.getWithHeaders).mockResolvedValue({
			data: [rawStore],
			totalCount: 7
		})
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useStores({ offset: 10, limit: 5 }), {
			wrapper
		})

		expect(result.current.isLoading).toBe(true)
		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(api.getWithHeaders).toHaveBeenCalledWith("stores?offset=10&limit=5")
		expect(result.current.data?.totalCount).toBe(7)
		expect(result.current.data?.stores).toHaveLength(1)
		expect(result.current.data?.stores[0]).toMatchObject({
			id: "store-1",
			name: "Carrefour",
			createdAt: rawStore.created_at
		})
	})

	it("exposes the error when the request fails", async () => {
		vi.mocked(api.getWithHeaders).mockRejectedValue(new Error("boom"))
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useStores({ offset: 0, limit: 10 }), {
			wrapper
		})

		await waitFor(() => expect(result.current.isError).toBe(true))
		expect(result.current.error?.message).toBe("boom")
	})
})

describe("store mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("creates a store and invalidates the stores cache", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useCreateStore(), { wrapper })
		await act(() => result.current.mutateAsync("Walmart"))

		expect(api.post).toHaveBeenCalledWith("stores", { name: "Walmart" })
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["stores"] })
	})

	it("updates a store and invalidates the stores cache", async () => {
		vi.mocked(api.patch).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useUpdateStore(), { wrapper })
		await act(() =>
			result.current.mutateAsync({ id: "store-1", name: "Costco" })
		)

		expect(api.patch).toHaveBeenCalledWith("stores/store-1", { name: "Costco" })
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["stores"] })
	})

	it("deletes a store and invalidates the stores cache", async () => {
		vi.mocked(api.delete).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useDeleteStore(), { wrapper })
		await act(() => result.current.mutateAsync("store-1"))

		expect(api.delete).toHaveBeenCalledWith("stores/store-1")
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["stores"] })
	})

	it("does not invalidate the cache when the mutation fails", async () => {
		vi.mocked(api.post).mockRejectedValue(new Error("nope"))
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useCreateStore(), { wrapper })
		await act(async () => {
			await expect(result.current.mutateAsync("Walmart")).rejects.toThrow(
				"nope"
			)
		})

		expect(invalidate).not.toHaveBeenCalled()
	})
})
