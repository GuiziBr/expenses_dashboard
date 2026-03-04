"use client"

import { DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import { BalanceCard } from "@/components/BalanceCard"
import { ExpenseTable } from "@/components/ExpenseTable"
import { FilterForm } from "@/components/FilterForm"
import { Header } from "@/components/Header"
import { Pagination } from "@/components/Pagination"
import { Loader } from "@/components/ui/loader"
import { translations } from "@/constants/translations"
import { useBalance } from "@/hooks/use-balance"
import { useExpenses } from "@/hooks/use-expenses"
import { useSortParams } from "@/hooks/use-sort-params"
import { FILTER_VALUE_MAPPING } from "@/lib/constants"
import { getFirstDayOfMonth, getLastDayOfMonth } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/format-currency"
import type {
	BalanceFilterKey,
	ExpenseFilters,
	ExpenseQueryParams
} from "@/types/expenses"

const DEFAULT_LIMIT = 8

export default function PersonalDashboard() {
	const { orderBy, orderType, toggleSort, getSortIndicator } = useSortParams()

	const [params, setParams] = useState<ExpenseQueryParams>({
		offset: 0,
		limit: DEFAULT_LIMIT,
		startDate: getFirstDayOfMonth(),
		endDate: getLastDayOfMonth()
	})

	// React to sort changes
	useEffect(() => {
		setParams((prev) => ({
			...prev,
			orderBy,
			orderType,
			offset: 0 // Reset to first page on sort
		}))
	}, [orderBy, orderType])

	const { data, isLoading, error } = useExpenses("personal", params)
	const { data: balance } = useBalance({
		startDate: params.startDate,
		endDate: params.endDate,
		filterBy: params.filterBy as BalanceFilterKey,
		filterValue: params.filterValue
	})

	const total = formatCurrency(balance?.personalBalance ?? 0)

	const handleSearch = (filters: ExpenseFilters) => {
		setParams((prev) => ({
			...prev,
			...filters,
			// Map the UI filter ID to the API field name
			filterBy: filters.filterBy
				? FILTER_VALUE_MAPPING[filters.filterBy]
				: undefined,
			offset: 0 // Reset to first page on search
		}))
	}

	const handlePageChange = (page: number) => {
		setParams((prev) => ({
			...prev,
			offset: (page - 1) * prev.limit
		}))
	}

	const totalPages = data ? Math.ceil(data.totalCount / params.limit) : 0
	const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
	const currentPage = Math.floor(params.offset / params.limit) + 1

	return (
		<div className="min-h-screen bg-background">
			<div className="bg-[var(--light-blue)] pb-32">
				<Header />
			</div>

			<main className="max-w-[1120px] mx-auto px-5 -mt-24">
				<section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
					<div className="md:col-start-2">
						<BalanceCard
							label={translations.common.balance}
							value={total}
							icon={DollarSign}
							variant="total"
						/>
					</div>
				</section>

				<FilterForm onSubmit={handleSearch} initialFilters={params} />

				{isLoading && !data && (
					<div className="flex items-center justify-center min-h-[400px]">
						<Loader size={48} />
					</div>
				)}

				{error && (
					<p className="text-center text-red">
						{translations.common.errorLoading}
					</p>
				)}

				{data && data.expenses.length > 0 && (
					<div className="animate-in fade-in duration-500">
						<ExpenseTable
							expenses={data.expenses}
							onSort={toggleSort}
							getSortIndicator={getSortIndicator}
						/>

						<Pagination
							currentPage={currentPage}
							setCurrentPage={handlePageChange}
							pages={pages}
						/>
					</div>
				)}

				{data && data.expenses.length === 0 && !isLoading && (
					<p className="text-center text-muted-foreground mt-12 py-12 px-4 bg-white/5 rounded-lg border border-dashed border-white/10">
						{translations.common.noExpensesFound}
					</p>
				)}
			</main>
		</div>
	)
}
