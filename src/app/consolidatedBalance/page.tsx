"use client"

import { DollarSign, Play, User, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { BalanceCard } from "@/components/BalanceCard"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { useConsolidatedBalance } from "@/hooks/use-consolidated-balance"
import { formatCurrency } from "@/lib/format-currency"

export default function ConsolidatedBalance() {
	const [params, setParams] = useState<{ year: number; month: number } | null>(
		null
	)

	const { data, isLoading, error } = useConsolidatedBalance(
		params?.year ?? null,
		params?.month ?? null
	)

	const handleLoadReport = () => {
		const now = new Date()
		setParams({
			year: now.getFullYear(),
			month: now.getMonth() + 1
		})
	}

	useEffect(() => {
		if (error) {
			console.error("Error fetching consolidated balance:", error)
		}
	}, [error])

	return (
		<div className="min-h-screen bg-background pb-12">
			<div className="bg-[var(--light-blue)] pb-32">
				<Header />
			</div>

			<main className="max-w-[1120px] mx-auto px-5 -mt-24">
				<section className="flex justify-end mb-8">
					<Button
						onClick={handleLoadReport}
						className="bg-white text-blue-wood hover:bg-gray-100 flex items-center gap-2 px-6 py-2 h-auto"
						disabled={isLoading}
					>
						<Play className="w-4 h-4" />
						{isLoading ? "Loading..." : "Load Current Report"}
					</Button>
				</section>

				<section className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="hidden md:contents">
						<BalanceCard
							label={data?.requester?.name || "Requester"}
							value={formatCurrency(data?.requester?.total ?? 0)}
							icon={User}
							iconClassName="text-blue-500"
						/>
						<BalanceCard
							label={data?.partner?.name || "Partner"}
							value={formatCurrency(data?.partner?.total ?? 0)}
							icon={Users}
							iconClassName="text-purple-500"
						/>
					</div>
					<BalanceCard
						label="Balance"
						value={formatCurrency(data?.balance ?? 0)}
						icon={DollarSign}
						variant="total"
					/>
				</section>

				{error && (
					<div className="mt-8 p-4 bg-red-50 text-red-600 rounded-md text-center">
						<p>Error loading consolidated balance. Please try again.</p>
					</div>
				)}
			</main>
		</div>
	)
}
