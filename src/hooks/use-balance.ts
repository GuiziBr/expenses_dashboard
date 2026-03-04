"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { getLastDayOfMonth } from "@/lib/date-utils"
import type { BalanceFilters, GetBalanceResponse } from "@/types/expenses"

const FILTER_VALUES: Record<string, string> = {
	categories: "category",
	paymentType: "payment_type",
	banks: "bank",
	stores: "store"
}

function buildBalanceParams(filters: BalanceFilters): string {
	const lastDayOfMonth = getLastDayOfMonth()
	const params = new URLSearchParams()

	if (filters.startDate) params.set("startDate", filters.startDate)
	params.set("endDate", filters.endDate ?? lastDayOfMonth)

	if (filters.filterBy) {
		params.set("filterBy", FILTER_VALUES[filters.filterBy] ?? filters.filterBy)
		if (filters.filterValue) params.set("filterValue", filters.filterValue)
	}

	return params.toString()
}

/**
 * Fetch personal and shared balance using TanStack Query.
 *
 * @param filters  Optional date range and filter parameters
 *
 * @example
 * const { data, isLoading, error } = useBalance({ startDate: "2026-01-01" })
 * // data.personalBalance  → number
 * // data.sharedBalance    → { paying, payed, total }
 */
export function useBalance(filters: BalanceFilters = {}) {
	return useQuery<GetBalanceResponse>({
		queryKey: ["balance", filters],
		queryFn: async () => {
			const qs = buildBalanceParams(filters)
			return api.get<GetBalanceResponse>(`balance?${qs}`)
		},
		staleTime: 30_000 // 30 seconds — tab switching reuses cache
	})
}
