"use client"

import { Wallet } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BalanceCard } from "@/components/BalanceCard"
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal"
import { ExpenseTable } from "@/components/ExpenseTable"
import { FilterForm } from "@/components/FilterForm"
import { NewExpenseModal } from "@/components/NewExpenseModal"
import { Pagination } from "@/components/Pagination"
import { Loader } from "@/components/ui/loader"
import { translations } from "@/constants/translations"
import { useAuth } from "@/contexts/auth-context"
import { useCustomRangeIndicator } from "@/contexts/page-toolbar-context"
import { useBalance } from "@/hooks/use-balance"
import { useDeleteExpense, useExpenses } from "@/hooks/use-expenses"
import { useSelectedMonth } from "@/hooks/use-selected-month"
import { useSortParams } from "@/hooks/use-sort-params"
import { formatMonthParam } from "@/lib/balance-breakdown-params"
import { FILTER_VALUE_MAPPING } from "@/lib/constants"
import { getMonthRange, isFullMonthRange } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/format-currency"
import { getErrorMessage } from "@/lib/get-error-message"
import type {
	BalanceFilterKey,
	ExpenseFilters,
	ExpenseQueryParams,
	FormattedExpense
} from "@/types/expenses"

const DEFAULT_LIMIT = 10

export default function PersonalDashboard() {
	const { orderBy, orderType, toggleSort, getSortIndicator } = useSortParams()
	const { user } = useAuth()

	const { month } = useSelectedMonth()

	const [params, setParams] = useState<ExpenseQueryParams>({
		offset: 0,
		limit: DEFAULT_LIMIT,
		...getMonthRange(month)
	})

	// The month picked in the top bar resets the range and the page
	const monthKey = formatMonthParam(month)
	useEffect(() => {
		setParams((prev) => ({ ...prev, ...getMonthRange(month), offset: 0 }))
	}, [monthKey])

	useCustomRangeIndicator(
		!isFullMonthRange(params.startDate, params.endDate, month)
	)

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

	const [deletingExpense, setDeletingExpense] =
		useState<FormattedExpense | null>(null)
	const [editingExpense, setEditingExpense] = useState<FormattedExpense | null>(
		null
	)
	const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense()

	const total = formatCurrency(balance?.personalBalance ?? 0)

	const handleDelete = () => {
		if (!deletingExpense) return

		deleteExpense(deletingExpense.id, {
			onSuccess: () => {
				toast.success(translations.management.expenseDeleteSuccess)
				setDeletingExpense(null)

				// If we just deleted the last row on a non-first page, step back
				if (data?.expenses.length === 1 && params.offset > 0) {
					setParams((prev) => ({
						...prev,
						offset: Math.max(0, prev.offset - prev.limit)
					}))
				}
			},
			onError: (error) => {
				toast.error(error.message || translations.management.expenseDeleteError)
			}
		})
	}

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
		<main className="mx-auto flex max-w-[1120px] flex-col gap-3 px-5 lg:h-full">
			<section className="grid grid-cols-1 md:grid-cols-3 md:gap-5">
				<BalanceCard
					label={translations.common.balance}
					value={total}
					icon={Wallet}
					variant="total"
					className="md:col-start-2"
				/>
			</section>

			<FilterForm onSubmit={handleSearch} initialFilters={params} />

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
						onDelete={setDeletingExpense}
						onEdit={setEditingExpense}
						currentUserId={user?.id}
					/>

					<Pagination
						currentPage={currentPage}
						setCurrentPage={handlePageChange}
						pages={pages}
					/>
				</div>
			)}

			{data && data.expenses.length === 0 && !isLoading && (
				<p className="rounded-xl border border-dashed border-border bg-card px-4 py-12 text-center text-muted-foreground">
					{translations.common.noExpensesFound}
				</p>
			)}
			<ConfirmDeleteModal
				title={translations.management.confirmDeleteExpenseTitle}
				description={translations.management.confirmDeleteExpenseDescription}
				resourceName={deletingExpense?.description}
				isOpen={!!deletingExpense}
				onClose={() => setDeletingExpense(null)}
				onConfirm={handleDelete}
				isPending={isDeleting}
			/>
			<NewExpenseModal
				expense={editingExpense ?? undefined}
				isOpen={!!editingExpense}
				onClose={() => setEditingExpense(null)}
			/>
		</main>
	)
}
