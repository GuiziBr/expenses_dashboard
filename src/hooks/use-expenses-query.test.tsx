// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import type { Expense, NewExpensePayload } from "@/types/expenses"
import {
	useCreateExpense,
	useDeleteExpense,
	useExpenses,
	useUpdateExpense
} from "./use-expenses"

vi.mock("@/lib/api", () => ({
	api: {
		getWithHeaders: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn()
	}
}))

const rawExpense: Expense = {
	id: "exp-1",
	owner_id: "user-1",
	description: "Groceries",
	category_id: "cat-1",
	payment_type_id: "pt-1",
	personal: false,
	split: true,
	category: { description: "Food" },
	amount: 1500,
	type: "outcome",
	date: "2026-03-10T12:00:00.000Z",
	payment_type: { description: "Credit card" }
}

const payload: NewExpensePayload = {
	description: "Groceries",
	category_id: "cat-1",
	payment_type_id: "pt-1",
	date: "2026-03-10",
	amount: 1500,
	personal: false,
	split: true
}

describe("useExpenses", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("fetches shared expenses and formats outcomes as negative with a type", async () => {
		vi.mocked(api.getWithHeaders).mockResolvedValue({
			data: [rawExpense],
			totalCount: 12
		})
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(
			() => useExpenses("shared", { offset: 0, limit: 10 }),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(api.getWithHeaders).toHaveBeenCalledWith(
			"expenses/shared?offset=0&limit=10"
		)
		expect(result.current.data?.totalCount).toBe(12)
		expect(result.current.data?.expenses[0]).toMatchObject({
			id: "exp-1",
			type: "outcome",
			category: "Food",
			paymentType: "Credit card"
		})
		expect(result.current.data?.expenses[0].formattedAmount).toMatch(/^- /)
	})

	it("fetches personal expenses with the filters in the query string", async () => {
		vi.mocked(api.getWithHeaders).mockResolvedValue({
			data: [rawExpense],
			totalCount: 1
		})
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(
			() =>
				useExpenses("personal", {
					offset: 5,
					limit: 5,
					startDate: "2026-03-01",
					filterBy: "category",
					filterValue: "cat-1"
				}),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		const [url] = vi.mocked(api.getWithHeaders).mock.calls[0]
		expect(url.startsWith("expenses/personal?")).toBe(true)
		const qs = new URLSearchParams(url.split("?")[1])
		expect(qs.get("startDate")).toBe("2026-03-01")
		expect(qs.get("filterBy")).toBe("category")
		expect(qs.get("filterValue")).toBe("cat-1")
		expect(qs.get("offset")).toBe("5")
		expect(result.current.data?.expenses[0]).not.toHaveProperty("type")
	})

	it("exposes the error when the request fails", async () => {
		vi.mocked(api.getWithHeaders).mockRejectedValue(new Error("boom"))
		const { wrapper } = createQueryWrapper()

		const { result } = renderHook(
			() => useExpenses("shared", { offset: 0, limit: 10 }),
			{ wrapper }
		)

		await waitFor(() => expect(result.current.isError).toBe(true))
		expect(result.current.error?.message).toBe("boom")
	})
})

describe("expense mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	function expectExpenseAndBalanceInvalidated(
		invalidate: ReturnType<typeof vi.spyOn>
	) {
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["expenses"] })
		expect(invalidate).toHaveBeenCalledWith({ queryKey: ["balance"] })
	}

	it("creates an expense and invalidates expenses and balance", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useCreateExpense(), { wrapper })
		await act(() => result.current.mutateAsync(payload))

		expect(api.post).toHaveBeenCalledWith("expenses", payload)
		expectExpenseAndBalanceInvalidated(invalidate)
	})

	it("updates an expense and invalidates expenses and balance", async () => {
		vi.mocked(api.put).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useUpdateExpense(), { wrapper })
		await act(() => result.current.mutateAsync({ id: "exp-1", payload }))

		expect(api.put).toHaveBeenCalledWith("expenses/exp-1", payload)
		expectExpenseAndBalanceInvalidated(invalidate)
	})

	it("deletes an expense and invalidates expenses and balance", async () => {
		vi.mocked(api.delete).mockResolvedValue({})
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useDeleteExpense(), { wrapper })
		await act(() => result.current.mutateAsync("exp-1"))

		expect(api.delete).toHaveBeenCalledWith("expenses/exp-1")
		expectExpenseAndBalanceInvalidated(invalidate)
	})

	it("does not invalidate when the mutation fails", async () => {
		vi.mocked(api.delete).mockRejectedValue(new Error("nope"))
		const { wrapper, queryClient } = createQueryWrapper()
		const invalidate = vi.spyOn(queryClient, "invalidateQueries")

		const { result } = renderHook(() => useDeleteExpense(), { wrapper })
		await act(async () => {
			await expect(result.current.mutateAsync("exp-1")).rejects.toThrow("nope")
		})

		expect(invalidate).not.toHaveBeenCalled()
	})
})
