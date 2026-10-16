// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import {
	useCreatePaymentType,
	useDeletePaymentType,
	usePaymentTypes,
	useUpdatePaymentType
} from "./use-payment-types"

vi.mock("@/lib/api", () => ({
	api: {
		getWithHeaders: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn()
	}
}))

const rawPaymentType = {
	id: "pt-1",
	description: "Credit card",
	has_statement: true,
	created_at: "2026-01-10T12:00:00.000Z",
	updated_at: null
}

const invalidatedKeys = [
	{ queryKey: ["paymentTypes"] },
	{ queryKey: ["paymentType"] }
]

describe("usePaymentTypes", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("requests the paged endpoint and maps payment types with the total count", async () => {
		vi.mocked(api.getWithHeaders).mockResolvedValue({
			data: [rawPaymentType],
			totalCount: 2
		})
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(
			() => usePaymentTypes({ offset: 20, limit: 10 }),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(api.getWithHeaders).toHaveBeenCalledWith(
			"paymentType?offset=20&limit=10"
		)
		expect(result.current.data?.totalCount).toBe(2)
		expect(result.current.data?.paymentTypes[0]).toMatchObject({
			id: "pt-1",
			description: "Credit card",
			hasStatement: true
		})
	})

	it("exposes the error when the request fails", async () => {
		vi.mocked(api.getWithHeaders).mockRejectedValue(new Error("boom"))
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(
			() => usePaymentTypes({ offset: 0, limit: 10 }),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isError).toBe(true))
		expect(result.current.error?.message).toBe("boom")
	})
})

describe("payment type mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("creates a payment type and invalidates both caches", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useCreatePaymentType(), { wrapper })
		await act(() =>
			result.current.mutateAsync({ description: "Debit", hasStatement: false })
		)

		expect(api.post).toHaveBeenCalledWith("paymentType", {
			description: "Debit",
			hasStatement: false
		})
		for (const key of invalidatedKeys) {
			expect(invalidate).toHaveBeenCalledWith(key)
		}
	})

	it("updates a payment type and invalidates both caches", async () => {
		vi.mocked(api.patch).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useUpdatePaymentType(), { wrapper })
		await act(() =>
			result.current.mutateAsync({
				id: "pt-1",
				description: "Credit",
				hasStatement: true
			})
		)

		expect(api.patch).toHaveBeenCalledWith("paymentType/pt-1", {
			description: "Credit",
			hasStatement: true
		})
		for (const key of invalidatedKeys) {
			expect(invalidate).toHaveBeenCalledWith(key)
		}
	})

	it("deletes a payment type and invalidates both caches", async () => {
		vi.mocked(api.delete).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useDeletePaymentType(), { wrapper })
		await act(() => result.current.mutateAsync("pt-1"))

		expect(api.delete).toHaveBeenCalledWith("paymentType/pt-1")
		for (const key of invalidatedKeys) {
			expect(invalidate).toHaveBeenCalledWith(key)
		}
	})
})
