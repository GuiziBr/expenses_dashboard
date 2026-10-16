// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import {
	useCategories,
	useCreateCategory,
	useDeleteCategory,
	useUpdateCategory
} from "./use-categories"

vi.mock("@/lib/api", () => ({
	api: {
		getWithHeaders: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn()
	}
}))

const rawCategory = {
	id: "cat-1",
	description: "Groceries",
	created_at: "2026-01-10T12:00:00.000Z",
	updated_at: null
}

const invalidatedKeys = [
	{ queryKey: ["categories-management"] },
	{ queryKey: ["categories"] }
]

describe("useCategories", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("requests the paged endpoint and maps categories with the total count", async () => {
		vi.mocked(api.getWithHeaders).mockResolvedValue({
			data: [rawCategory],
			totalCount: 3
		})
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(
			() => useCategories({ offset: 0, limit: 10 }),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(api.getWithHeaders).toHaveBeenCalledWith(
			"categories?offset=0&limit=10"
		)
		expect(result.current.data?.totalCount).toBe(3)
		expect(result.current.data?.categories[0]).toMatchObject({
			id: "cat-1",
			description: "Groceries"
		})
	})

	it("sends the sort column and direction when provided", async () => {
		vi.mocked(api.getWithHeaders).mockResolvedValue({ data: [], totalCount: 0 })
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(
			() =>
				useCategories({
					offset: 0,
					limit: 10,
					orderBy: "created_at",
					orderType: "desc"
				}),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(api.getWithHeaders).toHaveBeenCalledWith(
			"categories?offset=0&limit=10&orderBy=created_at&orderType=desc"
		)
	})

	it("exposes the error when the request fails", async () => {
		vi.mocked(api.getWithHeaders).mockRejectedValue(new Error("boom"))
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(
			() => useCategories({ offset: 0, limit: 10 }),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isError).toBe(true))
		expect(result.current.error?.message).toBe("boom")
	})
})

describe("category mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("creates a category and refreshes management and filter caches", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useCreateCategory(), { wrapper })
		await act(() => result.current.mutateAsync("Health"))

		expect(api.post).toHaveBeenCalledWith("categories", {
			description: "Health"
		})
		for (const key of invalidatedKeys) {
			expect(invalidate).toHaveBeenCalledWith(key)
		}
	})

	it("updates a category and refreshes management and filter caches", async () => {
		vi.mocked(api.patch).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useUpdateCategory(), { wrapper })
		await act(() =>
			result.current.mutateAsync({ id: "cat-1", description: "Food" })
		)

		expect(api.patch).toHaveBeenCalledWith("categories/cat-1", {
			description: "Food"
		})
		for (const key of invalidatedKeys) {
			expect(invalidate).toHaveBeenCalledWith(key)
		}
	})

	it("deletes a category and refreshes management and filter caches", async () => {
		vi.mocked(api.delete).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useDeleteCategory(), { wrapper })
		await act(() => result.current.mutateAsync("cat-1"))

		expect(api.delete).toHaveBeenCalledWith("categories/cat-1")
		for (const key of invalidatedKeys) {
			expect(invalidate).toHaveBeenCalledWith(key)
		}
	})
})
