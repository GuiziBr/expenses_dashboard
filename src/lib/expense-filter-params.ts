import type { BreakdownMonth } from "@/lib/balance-breakdown-params"
import { COLUMN_FILTERS, EXPENSE_COLUMNS } from "@/lib/constants"
import { getMonthRange } from "@/lib/date-utils"

export const FILTER_BY_PARAM = "filterBy"
export const FILTER_VALUE_PARAM = "filterValue"
export const START_DATE_PARAM = "startDate"
export const END_DATE_PARAM = "endDate"
export const ORDER_BY_PARAM = "orderBy"
export const ORDER_TYPE_PARAM = "orderType"
export const PAGE_PARAM = "page"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const FILTER_BY_IDS: readonly string[] = COLUMN_FILTERS.map((f) => f.id)
const ORDER_BY_VALUES: readonly string[] = Object.values(EXPENSE_COLUMNS)

/**
 * Expense list state as it lives in the URL. `filterBy` is the UI id
 * (`categories`, `banks`, …), not the API field name.
 */
export interface ExpenseUrlState {
	filterBy?: string
	filterValue?: string
	startDate: string
	endDate: string
	orderBy?: string
	orderType?: "asc" | "desc"
	page: number
}

/** Keys the hook may change; `undefined` or `""` removes the param. */
export type ExpenseUrlPatch = Partial<
	Record<
		| typeof FILTER_BY_PARAM
		| typeof FILTER_VALUE_PARAM
		| typeof START_DATE_PARAM
		| typeof END_DATE_PARAM
		| typeof ORDER_BY_PARAM
		| typeof ORDER_TYPE_PARAM,
		string
	> & { [PAGE_PARAM]: number }
>

function isValidDate(value: string | null): value is string {
	if (!value || !DATE_PATTERN.test(value)) return false
	const [year, month, day] = value.split("-").map(Number)
	const date = new Date(year, month - 1, day)
	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	)
}

/**
 * Read the expense list state from the URL. Anything missing or invalid falls
 * back to its default (the month's range, no filter, no sort, first page).
 */
export function parseExpenseUrlState(
	searchParams: URLSearchParams,
	month: BreakdownMonth
): ExpenseUrlState {
	const monthRange = getMonthRange(month)

	const rawStart = searchParams.get(START_DATE_PARAM)
	const rawEnd = searchParams.get(END_DATE_PARAM)
	const hasValidRange =
		isValidDate(rawStart) && isValidDate(rawEnd) && rawStart <= rawEnd

	const rawFilterBy = searchParams.get(FILTER_BY_PARAM)
	const filterBy =
		rawFilterBy && FILTER_BY_IDS.includes(rawFilterBy) ? rawFilterBy : undefined
	const filterValue = filterBy
		? searchParams.get(FILTER_VALUE_PARAM) || undefined
		: undefined

	const rawOrderBy = searchParams.get(ORDER_BY_PARAM)
	const orderBy =
		rawOrderBy && ORDER_BY_VALUES.includes(rawOrderBy) ? rawOrderBy : undefined
	const orderType = orderBy
		? searchParams.get(ORDER_TYPE_PARAM) === "desc"
			? "desc"
			: "asc"
		: undefined

	const rawPage = Number(searchParams.get(PAGE_PARAM))
	const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1

	return {
		filterBy,
		filterValue,
		startDate: hasValidRange ? rawStart : monthRange.startDate,
		endDate: hasValidRange ? rawEnd : monthRange.endDate,
		orderBy,
		orderType,
		page
	}
}

/**
 * Apply a patch to the current query string. Other params (e.g. `month`) are
 * kept; empty values and a first page are dropped to keep the URL short.
 */
export function serializeExpenseParams(
	current: URLSearchParams,
	patch: ExpenseUrlPatch
): URLSearchParams {
	const next = new URLSearchParams(current.toString())

	for (const [key, value] of Object.entries(patch)) {
		const isEmpty =
			value === undefined || value === "" || (key === PAGE_PARAM && value === 1)
		if (isEmpty) next.delete(key)
		else next.set(key, String(value))
	}

	// A value without its filter is meaningless
	if (!next.get(FILTER_BY_PARAM)) next.delete(FILTER_VALUE_PARAM)
	// A direction without a column is meaningless
	if (!next.get(ORDER_BY_PARAM)) next.delete(ORDER_TYPE_PARAM)

	return next
}
