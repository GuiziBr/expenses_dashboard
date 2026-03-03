"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatExpense } from "@/lib/format-expense"
import type {
	Expense,
	ExpenseQueryParams,
	FormattedExpense
} from "@/types/expenses"

interface UseExpensesResult {
	expenses: FormattedExpense[]
	totalCount: number
}

/**
 * Build a query-string from the expense params, omitting undefined values.
 */
function buildSearchParams(params: ExpenseQueryParams): string {
	const entries: [string, string][] = []

	if (params.startDate) entries.push(["startDate", params.startDate])
	if (params.endDate) entries.push(["endDate", params.endDate])
	if (params.filterBy) entries.push(["filterBy", params.filterBy])
	if (params.filterValue) entries.push(["filterValue", params.filterValue])
	if (params.orderBy) entries.push(["orderBy", params.orderBy])
	if (params.orderType) entries.push(["orderType", params.orderType])

	entries.push(["offset", String(params.offset)])
	entries.push(["limit", String(params.limit)])

	return new URLSearchParams(entries).toString()
}

/**
 * Fetch and format expenses using TanStack Query.
 *
 * @param variant "shared" uses `/expenses/shared`, "personal" uses `/expenses/personal`
 * @param params  Filters, pagination and sorting parameters
 *
 * @example
 * const { data, isLoading, error } = useExpenses("shared", {
 *   offset: 0,
 *   limit: 10,
 *   startDate: "2024-01-01",
 * })
 * // data.expenses  → FormattedExpense[]
 * // data.totalCount → number
 */
export function useExpenses(
	variant: "shared" | "personal",
	params: ExpenseQueryParams
) {
	return useQuery<UseExpensesResult>({
		queryKey: ["expenses", variant, params],
		queryFn: async () => {
			const endpoint =
				variant === "shared" ? "expenses/shared" : "expenses/personal"

			const qs = buildSearchParams(params)
			const { data, totalCount } = await api.getWithHeaders<Expense[]>(
				`${endpoint}?${qs}`
			)

			return {
				expenses: data.map((expense) => formatExpense(expense, variant)),
				totalCount
			}
		},
		placeholderData: keepPreviousData,
		staleTime: 30_000 // 30 seconds — tab switching reuses cache
	})
}
