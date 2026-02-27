"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { SharedReport } from "@/types/expenses"

/**
 * Fetch consolidated balance for a specific month and year.
 *
 * @param year   The year to fetch (e.g., 2026)
 * @param month  The month number (1 for January, ..., 12 for December)
 */
export function useConsolidatedBalance(year: number, month: number) {
	return useQuery<SharedReport>({
		queryKey: ["consolidated-balance", year, month],
		queryFn: async () => {
			return api.get<SharedReport>(`balance/consolidated/${year}/${month}`)
		},
		staleTime: 60_000, // 1 minute
		enabled: !!year && !!month
	})
}
