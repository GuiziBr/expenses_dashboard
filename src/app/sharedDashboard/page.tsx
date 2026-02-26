"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
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

	return (
		<div className="min-h-screen bg-background">
			<div className="bg-light-blue pb-32">
				<Header />
			</div>
		</div>
	)
}
