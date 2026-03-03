"use client"

import { EXPENSE_COLUMNS } from "@/lib/constants"
import type { FormattedExpense } from "@/types/expenses"

interface ExpenseTableProps {
	expenses: FormattedExpense[]
	onSort: (column: string) => void
	getSortIndicator: (column: string) => "↑" | "↓" | ""
}

export function ExpenseTable({
	expenses,
	onSort,
	getSortIndicator
}: ExpenseTableProps) {
	return (
		<div className="mt-2 w-full min-h-[20rem] md:min-h-[40rem]">
			<table className="w-full border-separate border-spacing-y-2 table-fixed">
				<thead>
					<tr>
						<th
							className="text-left py-4 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl cursor-pointer hover:brightness-75 transition-all pl-2 w-[35%] md:w-[30%] lg:w-[25%] xl:w-[20%]"
							onClick={() => onSort(EXPENSE_COLUMNS.description)}
						>
							<div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
								Expense{" "}
								<span className="text-[0.6em] opacity-70 ml-1">
									{getSortIndicator(EXPENSE_COLUMNS.description)}
								</span>
							</div>
						</th>
						<th
							className="text-left py-4 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl cursor-pointer hover:brightness-75 transition-all hidden md:table-cell md:w-[20%] lg:w-[15%] xl:w-[12%]"
							onClick={() => onSort(EXPENSE_COLUMNS.category)}
						>
							<div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
								Category{" "}
								<span className="text-[0.6em] opacity-70 ml-1">
									{getSortIndicator(EXPENSE_COLUMNS.category)}
								</span>
							</div>
						</th>
						<th
							className="text-left py-4 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl cursor-pointer hover:brightness-75 transition-all w-[20%] md:w-[15%] lg:w-[12%] xl:w-[10%]"
							onClick={() => onSort(EXPENSE_COLUMNS.amount)}
						>
							<div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
								Amount{" "}
								<span className="text-[0.6em] opacity-70 ml-1">
									{getSortIndicator(EXPENSE_COLUMNS.amount)}
								</span>
							</div>
						</th>
						<th
							className="text-left py-4 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl cursor-pointer hover:brightness-75 transition-all hidden lg:table-cell lg:w-[14%] xl:w-[10%]"
							onClick={() => onSort(EXPENSE_COLUMNS.paymentType)}
						>
							<div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
								Method{" "}
								<span className="text-[0.6em] opacity-70 ml-1">
									{getSortIndicator(EXPENSE_COLUMNS.paymentType)}
								</span>
							</div>
						</th>
						<th
							className="text-left py-4 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl cursor-pointer hover:brightness-75 transition-all w-[22%] md:w-[17%] lg:w-[17%] xl:w-[14%]"
							onClick={() => onSort(EXPENSE_COLUMNS.dueDate)}
						>
							<div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
								<span className="md:hidden">Due</span>
								<span className="hidden md:inline">Due Date</span>
								<span className="text-[0.6em] opacity-70 ml-1">
									{getSortIndicator(EXPENSE_COLUMNS.dueDate)}
								</span>
							</div>
						</th>
						<th
							className="text-left py-4 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl cursor-pointer hover:brightness-75 transition-all w-[23%] md:w-[18%] lg:w-[17%] xl:w-[14%]"
							onClick={() => onSort(EXPENSE_COLUMNS.date)}
						>
							<div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
								Purchase{" "}
								<span className="text-[0.6em] opacity-70 ml-1">
									{getSortIndicator(EXPENSE_COLUMNS.date)}
								</span>
							</div>
						</th>
						<th
							className="text-left py-4 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl cursor-pointer hover:brightness-75 transition-all hidden xl:table-cell xl:w-[10%]"
							onClick={() => onSort(EXPENSE_COLUMNS.bank)}
						>
							<div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
								Bank{" "}
								<span className="text-[0.6em] opacity-70 ml-1">
									{getSortIndicator(EXPENSE_COLUMNS.bank)}
								</span>
							</div>
						</th>
						<th
							className="text-left py-4 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl cursor-pointer hover:brightness-75 transition-all hidden xl:table-cell pr-2 xl:w-[10%]"
							onClick={() => onSort(EXPENSE_COLUMNS.store)}
						>
							<div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
								Store{" "}
								<span className="text-[0.6em] opacity-70 ml-1">
									{getSortIndicator(EXPENSE_COLUMNS.store)}
								</span>
							</div>
						</th>
					</tr>
				</thead>
				<tbody className="w-full">
					{expenses.map((expense) => (
						<tr key={expense.id} className="group">
							<td
								className="bg-white py-5 px-1 md:px-2 text-blue-wood first:rounded-l-lg pl-2 truncate max-w-[80px] md:max-w-[200px] text-xs md:text-base"
								title={expense.description}
							>
								{expense.description}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray hidden md:table-cell text-xs md:text-base">
								{expense.category}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-green font-medium whitespace-nowrap text-xs md:text-base">
								{expense.formattedAmount}
							</td>
							<td
								className="bg-white py-5 px-1 md:px-2 text-light-gray hidden lg:table-cell truncate max-w-[120px] text-xs md:text-base"
								title={expense.paymentType}
							>
								{expense.paymentType}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray whitespace-nowrap text-xs md:text-base">
								<span className="md:hidden">
									{expense.mobileFormattedDueDate || "—"}
								</span>
								<span className="hidden md:inline">
									{expense.formattedDueDate || "—"}
								</span>
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray whitespace-nowrap text-xs md:text-base rounded-r-lg xl:rounded-r-none">
								<span className="md:hidden">{expense.mobileFormattedDate}</span>
								<span className="hidden md:inline">
									{expense.formattedDate}
								</span>
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray hidden xl:table-cell text-xs md:text-base">
								{expense.bank || "—"}
							</td>
							<td
								className="bg-white py-5 px-1 md:px-2 text-light-gray hidden xl:table-cell last:rounded-r-lg pr-2 truncate"
								title={expense.store || ""}
							>
								{expense.store || "—"}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
