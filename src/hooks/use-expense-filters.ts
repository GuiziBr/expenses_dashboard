"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { useCustomRangeIndicator } from "@/contexts/page-toolbar-context"
import { useSelectedMonth } from "@/hooks/use-selected-month"
import { FILTER_VALUE_MAPPING } from "@/lib/constants"
import { isFullMonthRange } from "@/lib/date-utils"
import {
	type ExpenseUrlPatch,
	parseExpenseUrlState,
	serializeExpenseParams
} from "@/lib/expense-filter-params"
import type { ExpenseFilters, ExpenseQueryParams } from "@/types/expenses"

const DEFAULT_LIMIT = 10

/**
 * Filters, date range, sort and page of the expense dashboards, kept in the
 * URL so a filtered view can be shared or bookmarked. Changes are pushed so
 * back/forward restore the previous view; unrelated params are preserved.
 */
export function useExpenseFilters() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const { month } = useSelectedMonth()

	const query = searchParams.toString()
	const state = useMemo(
		() => parseExpenseUrlState(new URLSearchParams(query), month),
		[query, month]
	)

	const params: ExpenseQueryParams = useMemo(
		() => ({
			offset: (state.page - 1) * DEFAULT_LIMIT,
			limit: DEFAULT_LIMIT,
			startDate: state.startDate,
			endDate: state.endDate,
			// Map the UI filter ID to the API field name
			filterBy: state.filterBy
				? FILTER_VALUE_MAPPING[state.filterBy]
				: undefined,
			filterValue: state.filterValue,
			orderBy: state.orderBy,
			orderType: state.orderType
		}),
		[state]
	)

	// What the filter form shows: same as the URL, with the UI filter ID
	const filters: ExpenseFilters = useMemo(
		() => ({
			startDate: state.startDate,
			endDate: state.endDate,
			filterBy: state.filterBy,
			filterValue: state.filterValue
		}),
		[state]
	)

	useCustomRangeIndicator(
		!isFullMonthRange(state.startDate, state.endDate, month)
	)

	const update = useCallback(
		(patch: ExpenseUrlPatch) => {
			const next = serializeExpenseParams(new URLSearchParams(query), patch)
			const qs = next.toString()
			router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
		},
		[router, pathname, query]
	)

	const onSearch = useCallback(
		(submitted: ExpenseFilters) => {
			const isMonthRange = isFullMonthRange(
				submitted.startDate,
				submitted.endDate,
				month
			)
			update({
				filterBy: submitted.filterBy,
				filterValue: submitted.filterValue,
				// The month's own range is the default, so it stays out of the URL
				startDate: isMonthRange ? undefined : submitted.startDate,
				endDate: isMonthRange ? undefined : submitted.endDate,
				page: 1
			})
		},
		[update, month]
	)

	const toggleSort = useCallback(
		(column: string) => {
			const flip = state.orderBy === column && state.orderType === "asc"
			update({
				orderBy: column,
				orderType: flip ? "desc" : "asc",
				page: 1
			})
		},
		[update, state.orderBy, state.orderType]
	)

	const getSortIndicator = useCallback(
		(column: string): "↑" | "↓" | "" => {
			if (state.orderBy !== column) return ""
			return state.orderType === "desc" ? "↓" : "↑"
		},
		[state.orderBy, state.orderType]
	)

	const setPage = useCallback((page: number) => update({ page }), [update])

	const getPages = useCallback(
		(totalCount: number) =>
			Array.from(
				{ length: Math.ceil(totalCount / DEFAULT_LIMIT) },
				(_, i) => i + 1
			),
		[]
	)

	return {
		params,
		filters,
		currentPage: state.page,
		onSearch,
		toggleSort,
		getSortIndicator,
		setPage,
		getPages
	}
}
