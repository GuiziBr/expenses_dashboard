"use client"
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"
import { BalanceCard } from "@/components/BalanceCard"
import { ExpenseTable } from "@/components/ExpenseTable"
import { FilterForm } from "@/components/FilterForm"
import { Pagination } from "@/components/Pagination"
import { Loader } from "@/components/ui/loader"
import { translations } from "@/constants/translations"
import { useBalance } from "@/hooks/use-balance"
import { useExpenseFilters } from "@/hooks/use-expense-filters"
import { useExpenses } from "@/hooks/use-expenses"
import { formatCurrency } from "@/lib/format-currency"
import { getErrorMessage } from "@/lib/get-error-message"
import type { BalanceFilterKey } from "@/types/expenses"

export default function SharedDashboard() {
	const {
		params,
		filters,
		currentPage,
		onSearch,
		toggleSort,
		getSortIndicator,
		setPage,
		getPages
	} = useExpenseFilters()

	const { data, isLoading, error } = useExpenses("shared", params)
	const { data: balance, error: balanceError } = useBalance({
		startDate: params.startDate,
		endDate: params.endDate,
		filterBy: params.filterBy as BalanceFilterKey,
		filterValue: params.filterValue
	})

	useEffect(() => {
		if (balanceError) {
			toast.error(
				getErrorMessage(balanceError, translations.common.errorLoadingBalance)
			)
		}
	}, [balanceError])

	const paying = formatCurrency(balance?.sharedBalance?.paying ?? 0)
	const payed = formatCurrency(balance?.sharedBalance?.payed ?? 0)
	const total = formatCurrency(balance?.sharedBalance?.total ?? 0)

	const pages = getPages(data?.totalCount ?? 0)

	return (
		<main className="mx-auto flex max-w-[1120px] flex-col gap-3 px-5 lg:h-full">
			<section className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
				<BalanceCard
					label={translations.dashboards.shared.incomes}
					value={paying}
					icon={ArrowDownLeft}
					tone="income"
				/>
				<BalanceCard
					label={translations.dashboards.shared.outcomes}
					value={payed}
					icon={ArrowUpRight}
					tone="outcome"
				/>
				<BalanceCard
					label={translations.common.balance}
					value={total}
					icon={Wallet}
					variant="total"
					className="order-first col-span-2 md:order-none md:col-span-1"
				/>
			</section>

			<FilterForm onSubmit={onSearch} initialFilters={filters} />

			{isLoading && !data && (
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader size={48} />
				</div>
			)}

			{error && (
				<p className="text-center text-danger">
					{getErrorMessage(error, translations.common.errorLoading)}
				</p>
			)}

			{data && data.expenses.length > 0 && (
				<div className="flex flex-col gap-4 animate-in fade-in duration-500 lg:min-h-[12rem]">
					<ExpenseTable
						expenses={data.expenses}
						onSort={toggleSort}
						getSortIndicator={getSortIndicator}
					/>

					<Pagination
						currentPage={currentPage}
						setCurrentPage={setPage}
						pages={pages}
					/>
				</div>
			)}

			{data && data.expenses.length === 0 && !isLoading && (
				<p className="rounded-xl border border-dashed border-border bg-card px-4 py-12 text-center text-muted-foreground">
					{translations.common.noExpensesFound}
				</p>
			)}
		</main>
	)
}
