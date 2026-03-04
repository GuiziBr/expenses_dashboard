"use client"

import { CircleArrowDown, CircleArrowUp, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BalanceCard } from "@/components/BalanceCard"
import { ConsolidatedFilters } from "@/components/ConsolidatedFilters"
import { Header } from "@/components/Header"
import { ReportTables } from "@/components/ReportTables"
import { translations } from "@/constants/translations"
import { useConsolidatedBalance } from "@/hooks/use-consolidated-balance"
import { formatCurrency } from "@/lib/format-currency"

export default function ConsolidatedBalance() {
	const [params, setParams] = useState<{ year: number; month: number } | null>(
		null
	)

	const [balanceType, setBalanceType] = useState("")

	const { data, isLoading, error } = useConsolidatedBalance(
		params?.year ?? null,
		params?.month ?? null
	)

	const handleSearch = (filters: { date: string }) => {
		if (filters.date) {
			const [year, month] = filters.date.split("-").map(Number)
			setParams({ year, month })
		}
	}

	useEffect(() => {
		if (error) {
			toast.error(translations.dashboards.consolidated.error)
		}
	}, [error])

	return (
		<div className="min-h-screen bg-background pb-12">
			<div className="bg-[var(--light-blue)] pb-32">
				<Header />
			</div>

			<main className="max-w-[1120px] mx-auto px-5 -mt-24">
				<section className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="hidden md:contents">
						<BalanceCard
							label={
								data?.requester?.name ||
								translations.dashboards.consolidated.requester
							}
							value={formatCurrency(data?.requester?.total ?? 0)}
							icon={CircleArrowUp}
							iconClassName="text-green"
						/>
						<BalanceCard
							label={
								data?.partner?.name ||
								translations.dashboards.consolidated.partner
							}
							value={formatCurrency(data?.partner?.total ?? 0)}
							icon={CircleArrowDown}
							iconClassName="text-red"
						/>
					</div>
					<BalanceCard
						label={translations.common.balance}
						value={formatCurrency(data?.balance ?? 0)}
						icon={DollarSign}
						variant="total"
					/>
				</section>

				<ConsolidatedFilters
					onSearch={handleSearch}
					balanceType={balanceType}
					onBalanceTypeChange={setBalanceType}
					isLoading={isLoading}
				/>

				<ReportTables data={data} shareType={balanceType} />
			</main>
		</div>
	)
}
