"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { BreakdownItem, RawBreakdownItem } from "@/types/balance-breakdown"
import type { BalanceFilterKey } from "@/types/expenses"
import { FILTER_VALUES } from "./use-balance"

export function buildBreakdownPath(
	year: number,
	month: number,
	groupBy: BalanceFilterKey
): string {
	const params = new URLSearchParams({ filterBy: FILTER_VALUES[groupBy] })
	return `balance/breakdown/${year}/${month}?${params.toString()}`
}

/** Map the raw API entries to a single `label` field (order is preserved). */
export function normalizeBreakdown(raw: RawBreakdownItem[]): BreakdownItem[] {
	return raw.map((item) => ({
		id: item.id,
		label: item.description ?? item.name ?? null,
		total: item.total
	}))
}

/**
 * Fetch the personal spending breakdown for one month, grouped by one filter.
 *
 * @param year     The year to fetch (e.g., 2026)
 * @param month    The month number (1 for January, ..., 12 for December)
 * @param groupBy  Grouping key, mapped to the API's `filterBy` value
 *
 * @example
 * const { data } = useBalanceBreakdown(2026, 9, "categories")
 * // data → [{ id, label: "Groceries", total: 42000 }, ...] sorted by total desc
 */
export function useBalanceBreakdown(
	year: number | null,
	month: number | null,
	groupBy: BalanceFilterKey
) {
	return useQuery<BreakdownItem[]>({
		queryKey: ["balance", "breakdown", year, month, groupBy],
		queryFn: async () => {
			const raw = await api.get<RawBreakdownItem[]>(
				buildBreakdownPath(year as number, month as number, groupBy)
			)
			return normalizeBreakdown(raw)
		},
		staleTime: 60_000, // 1 minute — tab/month switching reuses cache
		enabled: !!year && !!month
	})
}
