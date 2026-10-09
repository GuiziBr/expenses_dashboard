import { FILTER_VALUES } from "@/hooks/use-balance"
import type { BalanceFilterKey } from "@/types/expenses"

const MIN_YEAR = 1900
const MONTH_PARAM_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/

export const DEFAULT_GROUP_BY: BalanceFilterKey = "categories"

export interface BreakdownMonth {
	year: number
	month: number // 1-indexed
}

/**
 * The URL uses the API's `filterBy` values (`category`, `payment_type`, ...),
 * so the UI keys are derived from the same table the hook uses.
 */
const GROUP_BY_FROM_PARAM = new Map(
	Object.entries(FILTER_VALUES).map(([key, value]) => [
		value,
		key as BalanceFilterKey
	])
)

export function getCurrentMonth(now = new Date()): BreakdownMonth {
	return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

/**
 * Read `?groupBy=` from the URL. Missing or unknown values fall back to Category.
 * @example parseGroupBy("bank") → "banks"
 */
export function parseGroupBy(
	value: string | null | undefined
): BalanceFilterKey {
	return GROUP_BY_FROM_PARAM.get(value ?? "") ?? DEFAULT_GROUP_BY
}

/**
 * Whether a `?month=` value is a well-formed `YYYY-MM` the app accepts.
 */
export function isValidMonthParam(value: string | null | undefined): boolean {
	const match = value ? MONTH_PARAM_PATTERN.exec(value) : null
	return !!match && Number(match[1]) >= MIN_YEAR
}

/**
 * Read `?month=YYYY-MM` from the URL. Missing, malformed or out-of-range
 * values (month outside 1–12, year below 1900) fall back to the current month.
 * @example parseMonth("2026-09") → { year: 2026, month: 9 }
 */
export function parseMonth(
	value: string | null | undefined,
	now = new Date()
): BreakdownMonth {
	const match = value ? MONTH_PARAM_PATTERN.exec(value) : null
	if (!match) return getCurrentMonth(now)

	const year = Number(match[1])
	if (year < MIN_YEAR) return getCurrentMonth(now)

	return { year, month: Number(match[2]) }
}

/**
 * Format a month for the URL and the native month input.
 * @example formatMonthParam({ year: 2026, month: 9 }) → "2026-09"
 */
export function formatMonthParam({ year, month }: BreakdownMonth): string {
	return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`
}

/**
 * Build the query string that restores a view.
 * @example buildBreakdownQuery("banks", { year: 2026, month: 9 }) → "groupBy=bank&month=2026-09"
 */
export function buildBreakdownQuery(
	groupBy: BalanceFilterKey,
	month: BreakdownMonth
): string {
	const params = new URLSearchParams({
		groupBy: FILTER_VALUES[groupBy],
		month: formatMonthParam(month)
	})
	return params.toString()
}

/**
 * Move a month forwards or backwards, crossing year boundaries.
 * @example shiftMonth({ year: 2026, month: 12 }, 1) → { year: 2027, month: 1 }
 */
export function shiftMonth(
	{ year, month }: BreakdownMonth,
	delta: number
): BreakdownMonth {
	const index = year * 12 + (month - 1) + delta
	return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

const monthLabelFormatter = new Intl.DateTimeFormat("en-US", {
	timeZone: "UTC",
	month: "long",
	year: "numeric"
})

/**
 * Format a month for display as `MMMM YYYY`.
 * @example formatMonthLabel({ year: 2026, month: 9 }) → "September 2026"
 */
export function formatMonthLabel({ year, month }: BreakdownMonth): string {
	return monthLabelFormatter.format(new Date(Date.UTC(year, month - 1, 1)))
}
