import {
	formatMonthParam,
	isValidMonthParam,
	parseMonth
} from "@/lib/balance-breakdown-params"
import { SHARED_BALANCE_TYPES } from "@/lib/constants"

export const BALANCE_TYPE_PARAM = "type"
const MONTH_PARAM = "month"

const BALANCE_TYPE_IDS: readonly string[] = SHARED_BALANCE_TYPES.map(
	(t) => t.id
)

/**
 * Consolidated balance state as it lives in the URL (`?month=YYYY-MM&type=payments`).
 * A missing or invalid value means "not chosen yet", so nothing is fetched.
 */
export interface ConsolidatedUrlState {
	/** `YYYY-MM`, or "" when not chosen */
	date: string
	/** `categories` | `payments`, or "" when not chosen */
	balanceType: string
	period: { year: number; month: number } | null
}

export function parseConsolidatedUrlState(
	searchParams: URLSearchParams
): ConsolidatedUrlState {
	const rawMonth = searchParams.get(MONTH_PARAM)
	const period = isValidMonthParam(rawMonth) ? parseMonth(rawMonth) : null

	const rawType = searchParams.get(BALANCE_TYPE_PARAM)
	const balanceType =
		rawType && BALANCE_TYPE_IDS.includes(rawType) ? rawType : ""

	return {
		date: period ? formatMonthParam(period) : "",
		balanceType,
		period
	}
}

/** Apply a patch to the query string; other params are kept, empty values removed. */
export function serializeConsolidatedParams(
	current: URLSearchParams,
	patch: { month?: string; type?: string }
): URLSearchParams {
	const next = new URLSearchParams(current.toString())
	for (const [key, value] of Object.entries(patch)) {
		if (value) next.set(key, value)
		else next.delete(key)
	}
	return next
}
