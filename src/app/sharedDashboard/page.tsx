"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { useExpenses } from "@/hooks/use-expenses"
import { getFirstDayOfMonth, getLastDayOfMonth } from "@/lib/date-utils"
import type { ExpenseQueryParams } from "@/types/expenses"

const DEFAULT_LIMIT = 5

export default function SharedDashboard() {
	const [params] = useState<ExpenseQueryParams>({
		offset: 0,
		limit: DEFAULT_LIMIT,
		startDate: getFirstDayOfMonth(),
		endDate: getLastDayOfMonth()
	})

	const { data, isLoading, error } = useExpenses("shared", params)

	return (
		<div className="min-h-screen bg-background">
			<div className="bg-light-blue pb-32">
				<Header />
			</div>

			<main className="max-w-[1120px] mx-auto px-5 -mt-24">
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
