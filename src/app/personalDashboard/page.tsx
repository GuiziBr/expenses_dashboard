"use client"

import { DollarSign } from "lucide-react"
import { useState } from "react"
import { BalanceCard } from "@/components/BalanceCard"
import { Header } from "@/components/Header"
import { useBalance } from "@/hooks/use-balance"
import { useExpenses } from "@/hooks/use-expenses"
import { getFirstDayOfMonth, getLastDayOfMonth } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/format-currency"
import type { ExpenseQueryParams } from "@/types/expenses"

const DEFAULT_LIMIT = 10

export default function PersonalDashboard() {
	const [params] = useState<ExpenseQueryParams>({
		offset: 0,
		limit: DEFAULT_LIMIT,
		startDate: getFirstDayOfMonth(),
		endDate: getLastDayOfMonth()
	})

	const { data: balance } = useBalance({ startDate: getFirstDayOfMonth() })
	const { data, isLoading, error } = useExpenses("personal", params)

	const total = formatCurrency(balance?.personalBalance ?? 0)

	return (
		<div className="min-h-screen bg-background">
			<div className="bg-[var(--light-blue)] pb-32">
				<Header />
			</div>

			<main className="max-w-[1120px] mx-auto px-5 -mt-24">
				<section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
					<div className="md:col-start-2">
						<BalanceCard
							label="Balance"
							value={total}
							icon={DollarSign}
							variant="total"
						/>
					</div>
				</section>

				{isLoading && (
					<p className="text-center text-muted-foreground">
						Loading expenses...
					</p>
				)}

				{error && (
					<p className="text-center text-red">
						Failed to load expenses. Please try again.
					</p>
				)}

				{data && (
					<div>
						<p className="text-muted-foreground text-sm mb-4">
							{data.totalCount} expense
							{data.totalCount !== 1 ? "s" : ""} found
						</p>
						{/* Expense table/list will be rendered here */}
					</div>
				)}
			</main>
		</div>
	)
}
