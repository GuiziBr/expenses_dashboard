"use client"

import { DollarSign, User, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { BalanceCard } from "@/components/BalanceCard"
import { ConsolidatedFilters } from "@/components/ConsolidatedFilters"
import { Header } from "@/components/Header"
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

	const handleSearch = (filters: { balanceType: string; date: string }) => {
		console.log("Searching with filters:", filters)
		if (filters.date) {
			const [year, month] = filters.date.split("-").map(Number)
			setParams({ year, month })
		}
	}

	useEffect(() => {
		if (data) {
			console.log("Consolidated Report Data:", data)
		}
		if (error) {
			console.error("Error fetching consolidated balance:", error)
		}
	}, [data, error])

	return (
		<div className="min-h-screen bg-background pb-12">
			<div className="bg-[var(--light-blue)] pb-32">
				<Header />
			</div>

			<main className="max-w-[1120px] mx-auto px-5 -mt-24">
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

				<ConsolidatedFilters onSearch={handleSearch} isLoading={isLoading} />

				{error && (
					<div className="mt-8 p-4 bg-red-50 text-red-600 rounded-md text-center">
						<p>Error loading consolidated balance. Please try again.</p>
					</div>
				)}
			</main>
		</div>
	)
}
