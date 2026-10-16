"use client"

import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"
import { BalanceCard } from "@/components/BalanceCard"
import { ConsolidatedFilters } from "@/components/ConsolidatedFilters"
import { ReportTables } from "@/components/ReportTables"
import { translations } from "@/constants/translations"
import { useConsolidatedBalance } from "@/hooks/use-consolidated-balance"
import { useConsolidatedFilters } from "@/hooks/use-consolidated-filters"
import { formatCurrency } from "@/lib/format-currency"
import { getErrorMessage } from "@/lib/get-error-message"

export default function ConsolidatedBalance() {
	const { period, date, balanceType, onSearch, onBalanceTypeChange } =
		useConsolidatedFilters()

	const { data, isLoading, error } = useConsolidatedBalance(
		period?.year ?? null,
		period?.month ?? null
	)

	useEffect(() => {
		if (error) {
			toast.error(
				getErrorMessage(error, translations.dashboards.consolidated.error)
			)
		}
	}, [error])

	return (
		<main className="mx-auto flex max-w-[1120px] flex-col gap-3 px-5">
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
				onSearch={onSearch}
				initialDate={date}
				balanceType={balanceType}
				onBalanceTypeChange={onBalanceTypeChange}
				isLoading={isLoading}
			/>

			<ReportTables data={data} shareType={balanceType} />
		</main>
	)
}
