"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import {
	parseConsolidatedUrlState,
	serializeConsolidatedParams
} from "@/lib/consolidated-filter-params"

/**
 * Month and balance type of the consolidated balance page, kept in the URL so
 * a result can be shared or bookmarked. Changes are pushed so back/forward
 * restore the previous view; unrelated params are preserved.
 */
export function useConsolidatedFilters() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const query = searchParams.toString()
	const state = useMemo(
		() => parseConsolidatedUrlState(new URLSearchParams(query)),
		[query]
	)

	const update = useCallback(
		(patch: { month?: string; type?: string }) => {
			const next = serializeConsolidatedParams(
				new URLSearchParams(query),
				patch
			)
			const qs = next.toString()
			router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
		},
		[router, pathname, query]
	)

	const onSearch = useCallback(
		({ date }: { date: string }) => update({ month: date }),
		[update]
	)

	const onBalanceTypeChange = useCallback(
		(type: string) => update({ type }),
		[update]
	)

	return {
		period: state.period,
		date: state.date,
		balanceType: state.balanceType,
		onSearch,
		onBalanceTypeChange
	}
}
