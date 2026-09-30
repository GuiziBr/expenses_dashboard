"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo } from "react"
import { BreakdownContent } from "@/components/BreakdownContent"
import { BreakdownControls } from "@/components/BreakdownControls"
import { BreakdownEmpty, BreakdownError } from "@/components/BreakdownStates"
import { BreakdownSummary } from "@/components/BreakdownSummary"
import { Header } from "@/components/Header"
import { useBalanceBreakdown } from "@/hooks/use-balance-breakdown"
import { buildBreakdownView } from "@/lib/balance-breakdown"
import {
	type BreakdownMonth,
	buildBreakdownQuery,
	formatMonthLabel,
	formatMonthParam,
	parseGroupBy,
	parseMonth,
	shiftMonth
} from "@/lib/balance-breakdown-params"
import type { BalanceFilterKey } from "@/types/expenses"

function BalanceBreakdownContent() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const groupBy = parseGroupBy(searchParams.get("groupBy"))
	const month = parseMonth(searchParams.get("month"))

	const { data, isLoading, error, refetch } = useBalanceBreakdown(
		month.year,
		month.month,
		groupBy
	)

	const view = useMemo(() => buildBreakdownView(data ?? []), [data])

	// A push (not replace) so back/forward restore the previous view
	const navigate = (nextGroupBy: BalanceFilterKey, nextMonth: BreakdownMonth) =>
		router.push(`${pathname}?${buildBreakdownQuery(nextGroupBy, nextMonth)}`, {
			scroll: false
		})

	return (
		<main className="max-w-[1120px] mx-auto px-5 -mt-24 pb-16 flex flex-col gap-8">
			<BreakdownSummary
				groupBy={groupBy}
				month={month}
				view={view}
				isLoading={isLoading}
				hasError={!!error}
			/>

			<BreakdownControls
				groupBy={groupBy}
				month={month}
				onGroupByChange={(next) => navigate(next, month)}
				onMonthChange={(next) => navigate(groupBy, next)}
				onShiftMonth={(delta) => navigate(groupBy, shiftMonth(month, delta))}
			/>

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
		</main>
	)
}

export default function BalanceBreakdown() {
	return (
		<div className="min-h-screen bg-background pb-12">
			<div className="bg-[var(--light-blue)] pb-32">
				<Header />
			</div>
			<Suspense>
				<BalanceBreakdownContent />
			</Suspense>
		</div>
	)
}
