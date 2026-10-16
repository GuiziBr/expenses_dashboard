// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import {
	useBanks,
	useCreateBank,
	useDeleteBank,
	useUpdateBank
} from "./use-banks"

vi.mock("@/lib/api", () => ({
	api: {
		getWithHeaders: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn()
	}
}))

const rawBank = {
	id: "bank-1",
	name: "Nubank",
	created_at: "2026-01-10T12:00:00.000Z",
	updated_at: null
}

describe("useBanks", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("requests the paged endpoint and maps banks with the total count", async () => {
		vi.mocked(api.getWithHeaders).mockResolvedValue({
			data: [rawBank],
			totalCount: 7
		})
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useBanks({ offset: 10, limit: 5 }), {
			wrapper
		})

		expect(result.current.isLoading).toBe(true)
		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(api.getWithHeaders).toHaveBeenCalledWith("banks?offset=10&limit=5")
		expect(result.current.data?.totalCount).toBe(7)
		expect(result.current.data?.banks).toHaveLength(1)
		expect(result.current.data?.banks[0]).toMatchObject({
			id: "bank-1",
			name: "Nubank",
			createdAt: rawBank.created_at
		})
	})

	it("sends the sort column and direction when provided", async () => {
		vi.mocked(api.getWithHeaders).mockResolvedValue({ data: [], totalCount: 0 })
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(
			() =>
				useBanks({
					offset: 0,
					limit: 10,
					orderBy: "created_at",
					orderType: "desc"
				}),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(api.getWithHeaders).toHaveBeenCalledWith(
			"banks?offset=0&limit=10&orderBy=created_at&orderType=desc"
		)
	})

	it("exposes the error when the request fails", async () => {
		vi.mocked(api.getWithHeaders).mockRejectedValue(new Error("boom"))
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(() => useBanks({ offset: 0, limit: 10 }), {
			wrapper
		})

		await waitFor(() => expect(result.current.isError).toBe(true))
		expect(result.current.error?.message).toBe("boom")
	})
})

describe("bank mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("creates a bank and invalidates the banks cache", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useCreateBank(), { wrapper })
		await act(() => result.current.mutateAsync("Itau"))

		expect(api.post).toHaveBeenCalledWith("banks", { name: "Itau" })
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["banks"] })
	})

	it("updates a bank and invalidates the banks cache", async () => {
		vi.mocked(api.patch).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useUpdateBank(), { wrapper })
		await act(() => result.current.mutateAsync({ id: "bank-1", name: "Inter" }))

		expect(api.patch).toHaveBeenCalledWith("banks/bank-1", { name: "Inter" })
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["banks"] })
	})

	it("deletes a bank and invalidates the banks cache", async () => {
		vi.mocked(api.delete).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useDeleteBank(), { wrapper })
		await act(() => result.current.mutateAsync("bank-1"))

		expect(api.delete).toHaveBeenCalledWith("banks/bank-1")
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["banks"] })
	})

	it("does not invalidate the cache when the mutation fails", async () => {
		vi.mocked(api.post).mockRejectedValue(new Error("nope"))
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useCreateBank(), { wrapper })
		await act(async () => {
			await expect(result.current.mutateAsync("Itau")).rejects.toThrow("nope")
		})

		expect(invalidate).not.toHaveBeenCalled()
	})
})
