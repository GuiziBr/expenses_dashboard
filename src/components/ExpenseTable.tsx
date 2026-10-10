"use client"
import {
	ChevronDown,
	ChevronsUpDown,
	ChevronUp,
	MoreVertical,
	Pencil,
	Trash2
} from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { translations } from "@/constants/translations"
import { EXPENSE_COLUMNS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { FormattedExpense } from "@/types/expenses"

interface ExpenseTableProps {
	expenses: FormattedExpense[]
	onSort: (column: string) => void
	getSortIndicator: (column: string) => "↑" | "↓" | ""
	onDelete?: (expense: FormattedExpense) => void
	onEdit?: (expense: FormattedExpense) => void
	currentUserId?: string
}

interface Column {
	key: string
	label: React.ReactNode
	width: string
	visibility?: string
}

const COLUMNS: Column[] = [
	{
		key: EXPENSE_COLUMNS.description,
		label: translations.table.expense,
		width: "w-[22%] md:w-[33%] lg:w-[27%] xl:w-[23%]"
	},
	{
		key: EXPENSE_COLUMNS.category,
		label: translations.table.category,
		width: "md:w-[20%] lg:w-[15%] xl:w-[14%]",
		visibility: "hidden md:table-cell"
	},
	{
		key: EXPENSE_COLUMNS.amount,
		label: translations.table.amount,
		width: "w-[24%] md:w-[15%] lg:w-[12%] xl:w-[10%]"
	},
	{
		key: EXPENSE_COLUMNS.paymentType,
		label: translations.table.method,
		width: "lg:w-[16%] xl:w-[13%]",
		visibility: "hidden lg:table-cell"
	},
	{
		key: EXPENSE_COLUMNS.dueDate,
		label: (
			<>
				<span className="md:hidden">{translations.table.due}</span>
				<span className="hidden md:inline">{translations.table.dueDate}</span>
			</>
		),
		width: "w-[15%] md:w-[16%] lg:w-[15%] xl:w-[11%]"
	},
	{
		key: EXPENSE_COLUMNS.date,
		label: translations.table.purchase,
		width: "w-[27%] md:w-[16%] lg:w-[15%] xl:w-[11%]"
	},
	{
		key: EXPENSE_COLUMNS.bank,
		label: translations.table.bank,
		width: "xl:w-[9%]",
		visibility: "hidden xl:table-cell"
	},
	{
		key: EXPENSE_COLUMNS.store,
		label: translations.table.store,
		width: "xl:w-[9%]",
		visibility: "hidden xl:table-cell"
	}
]

const CELL = "px-2 py-4 text-[13px] md:px-4 md:text-sm"
const MUTED_CELL = cn(CELL, "text-muted-foreground")

const SORT_ICON = {
	"↑": ChevronUp,
	"↓": ChevronDown,
	"": ChevronsUpDown
} as const

const ARIA_SORT = {
	"↑": "ascending",
	"↓": "descending",
	"": "none"
} as const

export function ExpenseTable({
	expenses,
	onSort,
	getSortIndicator,
	onDelete,
	onEdit,
	currentUserId
}: ExpenseTableProps) {
	const hasActions = !!(onDelete || onEdit)

	return (
		<div className="w-full overflow-hidden rounded-xl border border-border bg-card lg:overflow-y-auto">
			<table className="w-full table-fixed">
				<thead className="bg-card lg:sticky lg:top-0 lg:z-10">
					<tr>
						{COLUMNS.map(({ key, label, width, visibility }) => {
							const indicator = getSortIndicator(key)
							const SortIcon = SORT_ICON[indicator]
							return (
								<th
									key={key}
									scope="col"
									aria-sort={ARIA_SORT[indicator]}
									className={cn(
										"bg-background/60 px-2 py-3 text-left md:px-4",
										width,
										visibility
									)}
								>
									<button
										type="button"
										onClick={() => onSort(key)}
										className="flex cursor-pointer items-center gap-1 whitespace-nowrap text-xs font-semibold text-muted-foreground transition-colors md:text-[13px] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									>
										{label}
										<SortIcon
											aria-hidden="true"
											className={cn(
												"size-3.5 shrink-0",
												indicator ? "text-foreground" : "opacity-50"
											)}
										/>
									</button>
								</th>
							)
						})}
						{hasActions && (
							<th scope="col" className="w-10 bg-background/60 md:w-12" />
						)}
					</tr>
				</thead>
				<tbody>
					{expenses.map((expense) => (
						<tr
							key={expense.id}
							className="border-t border-border transition-colors hover:bg-accent/40"
						>
							<td
								className={cn(CELL, "truncate font-medium text-foreground")}
								title={expense.description}
							>
								{expense.description}
							</td>
							<td className={cn(CELL, "hidden md:table-cell")}>
								<span className="inline-block max-w-full truncate rounded-full bg-background px-2.5 py-0.5 align-middle text-xs font-medium text-muted-foreground">
									{expense.category}
								</span>
							</td>
							<td
								className={cn(
									CELL,
									"whitespace-nowrap font-medium",
									expense.type === "outcome" ? "text-danger" : "text-success"
								)}
							>
								{expense.formattedAmount}
							</td>
							<td
								className={cn(MUTED_CELL, "hidden truncate lg:table-cell")}
								title={expense.paymentType}
							>
								{expense.paymentType}
							</td>
							<td className={cn(MUTED_CELL, "whitespace-nowrap")}>
								<span className="md:hidden">
									{expense.mobileFormattedDueDate || "—"}
								</span>
								<span className="hidden md:inline">
									{expense.formattedDueDate || "—"}
								</span>
							</td>
							<td className={cn(MUTED_CELL, "whitespace-nowrap")}>
								<span className="md:hidden">{expense.mobileFormattedDate}</span>
								<span className="hidden md:inline">
									{expense.formattedDate}
								</span>
							</td>
							<td className={cn(MUTED_CELL, "hidden truncate xl:table-cell")}>
								{expense.bank || "—"}
							</td>
							<td
								className={cn(MUTED_CELL, "hidden truncate xl:table-cell")}
								title={expense.store || ""}
							>
								{expense.store || "—"}
							</td>
							{hasActions && (
								<td className="px-1 py-2 text-right md:px-2">
									{currentUserId === expense.ownerId && (
										<DropdownMenu>
											<DropdownMenuTrigger
												aria-label={translations.management.expenseActions}
												className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											>
												<MoreVertical className="size-5" />
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												{onEdit && (
													<DropdownMenuItem
														onClick={() => onEdit(expense)}
														className="cursor-pointer"
													>
														<Pencil />
														{translations.management.edit}
													</DropdownMenuItem>
												)}
												{onDelete && (
													<DropdownMenuItem
														variant="destructive"
														onClick={() => onDelete(expense)}
														className="cursor-pointer"
													>
														<Trash2 />
														{translations.management.delete}
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									)}
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
