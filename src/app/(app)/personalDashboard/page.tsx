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
import { useBalance } from "@/hooks/use-balance"
import { useExpenseFilters } from "@/hooks/use-expense-filters"
import { useDeleteExpense, useExpenses } from "@/hooks/use-expenses"
import { formatCurrency } from "@/lib/format-currency"
import { getErrorMessage } from "@/lib/get-error-message"
import type { BalanceFilterKey, FormattedExpense } from "@/types/expenses"

export default function PersonalDashboard() {
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
	const { user } = useAuth()

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
				if (data?.expenses.length === 1 && currentPage > 1) {
					setPage(currentPage - 1)
				}
			},
			onError: (error) => {
				toast.error(error.message || translations.management.expenseDeleteError)
			}
		})
	}

	const pages = getPages(data?.totalCount ?? 0)

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
						onDelete={setDeletingExpense}
						onEdit={setEditingExpense}
						currentUserId={user?.id}
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
