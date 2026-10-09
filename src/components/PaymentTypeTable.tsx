"use client"

import { Check, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal"
import { PaymentTypeEditModal } from "@/components/PaymentTypeEditModal"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { translations } from "@/constants/translations"
import {
	useDeletePaymentType,
	useUpdatePaymentType
} from "@/hooks/use-payment-types"
import type { FormattedPaymentType } from "@/types/expenses"

interface PaymentTypeTableProps {
	paymentTypes: FormattedPaymentType[]
}

export function PaymentTypeTable({ paymentTypes }: PaymentTypeTableProps) {
	const [editingPT, setEditingPT] = useState<FormattedPaymentType | null>(null)
	const [deletingPT, setDeletingPT] = useState<FormattedPaymentType | null>(
		null
	)

	const { mutate: deletePaymentType, isPending: isDeleting } =
		useDeletePaymentType()
	const { mutate: updatePaymentType, isPending: isUpdating } =
		useUpdatePaymentType()

	const handleEdit = (description: string, hasStatement: boolean) => {
		if (!editingPT) return

		updatePaymentType(
			{ id: editingPT.id, description, hasStatement },
			{
				onSuccess: () => {
					toast.success(translations.management.paymentTypeUpdateSuccess)
					setEditingPT(null)
				},
				onError: (error) => {
					toast.error(
						error.message || translations.management.paymentTypeUpdateError
					)
				}
			}
		)
	}

	const handleDelete = () => {
		if (!deletingPT) return

		deletePaymentType(deletingPT.id, {
			onSuccess: () => {
				toast.success(translations.management.paymentTypeDeleteSuccess)
				setDeletingPT(null)
			},
			onError: (error) => {
				toast.error(
					error.message || translations.management.paymentTypeDeleteError
				)
			}
		})
	}

	return (
		<div className="w-full min-h-[20rem] overflow-hidden rounded-xl border border-border bg-card">
			<table className="w-full table-fixed">
				<thead className="bg-background/60">
					<tr>
						<th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:px-4 w-[40%] md:w-[30%]">
							{translations.management.paymentTypeColumn}
						</th>
						<th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:px-4 w-[20%] md:w-[15%]">
							{translations.management.hasStatementColumn}
						</th>
						<th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:px-4 w-[35%] md:w-[25%]">
							{translations.management.createdColumn}
						</th>
						<th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:px-4 hidden md:table-cell md:w-[25%]">
							{translations.management.updatedColumn}
						</th>
						<th scope="col" className="w-14" />
					</tr>
				</thead>
				<tbody className="w-full">
					{paymentTypes.map((pt) => (
						<tr
							key={pt.id}
							className="border-t border-border transition-colors hover:bg-accent/40"
						>
							<td
								className="px-3 py-4 truncate text-sm font-medium text-foreground md:px-4"
								title={pt.description}
							>
								{pt.description}
							</td>
							<td className="px-3 py-4 text-sm text-muted-foreground md:px-4">
								{pt.hasStatement ? (
									<Check className="h-4 w-4 text-success" />
								) : (
									<span className="text-muted-foreground">—</span>
								)}
							</td>
							<td className="px-3 py-4 text-sm text-muted-foreground md:px-4">
								{pt.formattedCreatedAt}
							</td>
							<td className="px-3 py-4 hidden text-sm text-muted-foreground md:table-cell md:px-4">
								{pt.formattedUpdatedAt}
							</td>
							<td className="px-2 py-2 text-right md:px-3">
								<DropdownMenu>
									<DropdownMenuTrigger className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
										<MoreVertical className="size-5" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => setEditingPT(pt)}
											className="cursor-pointer"
										>
											<Pencil />
											{translations.management.edit}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeletingPT(pt)}
											variant="destructive"
											className="cursor-pointer"
										>
											<Trash2 />
											{translations.management.delete}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<PaymentTypeEditModal
				isOpen={!!editingPT}
				onClose={() => setEditingPT(null)}
				onSubmit={handleEdit}
				initialDescription={editingPT?.description ?? ""}
				initialHasStatement={editingPT?.hasStatement ?? false}
				isPending={isUpdating}
			/>

			<ConfirmDeleteModal
				title={translations.management.confirmDeletePaymentTypeTitle}
				description={
					translations.management.confirmDeletePaymentTypeDescription
				}
				resourceName={deletingPT?.description}
				isOpen={!!deletingPT}
				onClose={() => setDeletingPT(null)}
				onConfirm={handleDelete}
				isPending={isDeleting}
			/>
		</div>
	)
}
