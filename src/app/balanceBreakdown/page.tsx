"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { BreakdownControls } from "@/components/BreakdownControls"
import { Header } from "@/components/Header"
import { translations } from "@/constants/translations"
import { useBalanceBreakdown } from "@/hooks/use-balance-breakdown"
import {
	type BreakdownMonth,
	buildBreakdownQuery,
	parseGroupBy,
	parseMonth,
	shiftMonth
} from "@/lib/balance-breakdown-params"
import { formatCurrency } from "@/lib/format-currency"
import type { BalanceFilterKey } from "@/types/expenses"

function BalanceBreakdownContent() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const groupBy = parseGroupBy(searchParams.get("groupBy"))
	const month = parseMonth(searchParams.get("month"))

	const { data, isLoading, error } = useBalanceBreakdown(
		month.year,
		month.month,
		groupBy
	)

	// A push (not replace) so back/forward restore the previous view
	const navigate = (nextGroupBy: BalanceFilterKey, nextMonth: BreakdownMonth) =>
		router.push(`${pathname}?${buildBreakdownQuery(nextGroupBy, nextMonth)}`, {
			scroll: false
		})

	return (
		<main className="max-w-[1120px] mx-auto px-5 -mt-24 pb-16 flex flex-col gap-8">
			<h1 className="text-2xl font-bold text-white">
				{translations.dashboards.breakdown.title}
			</h1>

			<BreakdownControls
				groupBy={groupBy}
				month={month}
				onGroupByChange={(next) => navigate(next, month)}
				onMonthChange={(next) => navigate(groupBy, next)}
				onShiftMonth={(delta) => navigate(groupBy, shiftMonth(month, delta))}
			/>

			{/* TODO(task 5-7): replace with the summary cards, legend and chart */}
			<div className="text-input-text">
				{isLoading && <p>{translations.common.loading}</p>}
				{error && <p>{translations.common.errorLoading}</p>}
				<ul>
					{data?.map((item, index) => (
						<li key={item.id ?? `none-${index}`}>
							{item.label ?? "—"}: {formatCurrency(item.total)}
						</li>
					))}
				</ul>
			</div>
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
