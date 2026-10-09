"use client"

import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BalanceCard } from "@/components/BalanceCard"
import { ConsolidatedFilters } from "@/components/ConsolidatedFilters"
import { ReportTables } from "@/components/ReportTables"
import { translations } from "@/constants/translations"
import { useConsolidatedBalance } from "@/hooks/use-consolidated-balance"
import { formatCurrency } from "@/lib/format-currency"
import { getErrorMessage } from "@/lib/get-error-message"

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
			toast.error(
				getErrorMessage(error, translations.dashboards.consolidated.error)
			)
		}
	}, [error])

	return (
		<main className="max-w-[1120px] mx-auto px-5 pb-12">
			<section className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
				<BalanceCard
					label={
						data?.requester?.name ||
						translations.dashboards.consolidated.requester
					}
					value={formatCurrency(data?.requester?.total ?? 0)}
					icon={ArrowDownLeft}
					tone="income"
				/>
				<BalanceCard
					label={
						data?.partner?.name || translations.dashboards.consolidated.partner
					}
					value={formatCurrency(data?.partner?.total ?? 0)}
					icon={ArrowUpRight}
					tone="outcome"
				/>
				<BalanceCard
					label={translations.common.balance}
					value={formatCurrency(data?.balance ?? 0)}
					icon={Wallet}
					variant="total"
					className="order-first col-span-2 md:order-none md:col-span-1"
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
	)
}
