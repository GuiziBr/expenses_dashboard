"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo } from "react"
import { BreakdownContent } from "@/components/BreakdownContent"
import {
	BREAKDOWN_PANEL_ID,
	BreakdownControls,
	getTabId
} from "@/components/BreakdownControls"
import { BreakdownEmpty, BreakdownError } from "@/components/BreakdownStates"
import { BreakdownSummary } from "@/components/BreakdownSummary"
import { useBalanceBreakdown } from "@/hooks/use-balance-breakdown"
import { useSelectedMonth } from "@/hooks/use-selected-month"
import { buildBreakdownView } from "@/lib/balance-breakdown"
import {
	buildBreakdownQuery,
	formatMonthLabel,
	formatMonthParam,
	parseGroupBy
} from "@/lib/balance-breakdown-params"
import type { BalanceFilterKey } from "@/types/expenses"

function BalanceBreakdownContent() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const groupBy = parseGroupBy(searchParams.get("groupBy"))
	const { month } = useSelectedMonth()

	const { data, isLoading, error, refetch } = useBalanceBreakdown(
		month.year,
		month.month,
		groupBy
	)

	const view = useMemo(() => buildBreakdownView(data ?? []), [data])

	// A push (not replace) so back/forward restore the previous view
	const changeGroupBy = (nextGroupBy: BalanceFilterKey) =>
		router.push(`${pathname}?${buildBreakdownQuery(nextGroupBy, month)}`, {
			scroll: false
		})

	return (
		<main className="max-w-[1120px] mx-auto px-5 pb-16 flex flex-col gap-2 md:gap-8">
			<BreakdownSummary
				groupBy={groupBy}
				month={month}
				view={view}
				isLoading={isLoading}
				hasError={!!error}
			/>

			<BreakdownControls groupBy={groupBy} onGroupByChange={changeGroupBy} />

			<div
				role="tabpanel"
				id={BREAKDOWN_PANEL_ID}
				aria-labelledby={getTabId(groupBy)}
			>
				{error && <BreakdownError onRetry={() => refetch()} />}
				{!isLoading && !error && view.rows.length === 0 && (
					<BreakdownEmpty monthLabel={formatMonthLabel(month)} />
				)}
				{(isLoading || (!error && view.rows.length > 0)) && (
					<BreakdownContent
						// Remount to reset the selection and expanded legend (FR-16, FR-38)
						key={`${groupBy}-${formatMonthParam(month)}`}
						view={view}
						groupBy={groupBy}
						month={month}
						isLoading={isLoading}
					/>
				)}
			</div>
		</main>
	)
}

export default function BalanceBreakdown() {
	return (
		<Suspense>
			<BalanceBreakdownContent />
		</Suspense>
	)
}
