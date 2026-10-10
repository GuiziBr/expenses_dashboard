"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import {
	type BreakdownMonth,
	formatMonthParam,
	parseMonth,
	shiftMonth
} from "@/lib/balance-breakdown-params"

export const MONTH_PARAM = "month"

/**
 * The month shown by the month-aware pages, kept in the URL (`?month=YYYY-MM`)
 * so it survives a refresh and back/forward. Other query params are preserved.
 * A missing or invalid value means the current month.
 */
export function useSelectedMonth() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const raw = searchParams.get(MONTH_PARAM)
	const month = useMemo(() => parseMonth(raw), [raw])

	// A push (not replace) so back/forward restore the previous month
	const setMonth = useCallback(
		(next: BreakdownMonth) => {
			const params = new URLSearchParams(searchParams.toString())
			params.set(MONTH_PARAM, formatMonthParam(next))
			router.push(`${pathname}?${params.toString()}`, { scroll: false })
		},
		[router, pathname, searchParams]
	)

	const shift = useCallback(
		(delta: number) => setMonth(shiftMonth(month, delta)),
		[month, setMonth]
	)

	return { month, setMonth, shift }
}
