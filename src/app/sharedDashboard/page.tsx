"use client"

import { CircleArrowDown, CircleArrowUp, DollarSign } from "lucide-react"
import { BalanceCard } from "@/components/BalanceCard"
import { Header } from "@/components/Header"
import { useBalance } from "@/hooks/use-balance"
import { getFirstDayOfMonth } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/format-currency"

export default function SharedDashboard() {
	const { data: balance } = useBalance({ startDate: getFirstDayOfMonth() })

	const paying = formatCurrency(balance?.sharedBalance?.paying ?? 0)
	const payed = formatCurrency(balance?.sharedBalance?.payed ?? 0)
	const total = formatCurrency(balance?.sharedBalance?.total ?? 0)

	return (
		<div className="min-h-screen bg-background">
			<div className="bg-[var(--light-blue)] pb-32">
				<Header />
			</div>

			<main className="max-w-[1120px] mx-auto px-5 -mt-24">
				<section className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Income and Outcome: CSS-hidden on mobile — no JS detection, no flash */}
					<div className="hidden md:contents">
						<BalanceCard
							label="Incomes"
							value={paying}
							icon={CircleArrowUp}
							iconClassName="text-green-500"
						/>
						<BalanceCard
							label="Outcomes"
							value={payed}
							icon={CircleArrowDown}
							iconClassName="text-red-500"
						/>
					</div>

					<BalanceCard
						label="Balance"
						value={total}
						icon={DollarSign}
						variant="total"
					/>
				</section>
			</main>
		</div>
	)
}
