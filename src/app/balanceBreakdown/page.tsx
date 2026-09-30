"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Header } from "@/components/Header"
import { translations } from "@/constants/translations"
import {
	buildBreakdownQuery,
	parseGroupBy,
	parseMonth
} from "@/lib/balance-breakdown-params"

function BalanceBreakdownContent() {
	const searchParams = useSearchParams()
	const groupBy = parseGroupBy(searchParams.get("groupBy"))
	const month = parseMonth(searchParams.get("month"))

	return (
		<main className="max-w-[1120px] mx-auto px-5 -mt-24 pb-16 flex flex-col gap-8">
			<h1 className="text-2xl font-bold text-white">
				{translations.dashboards.breakdown.title}
			</h1>
			{/* TODO(task 4): replace with the controls and data */}
			<p className="text-iron-gray">{buildBreakdownQuery(groupBy, month)}</p>
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
