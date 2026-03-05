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
		<div className="mt-8 w-full min-h-[20rem]">
			<table className="w-full border-separate border-spacing-y-2 table-fixed">
				<thead>
					<tr>
						<th className="text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl pl-2 w-[40%] md:w-[30%]">
							{translations.management.paymentTypeColumn}
						</th>
						<th className="text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl w-[20%] md:w-[15%]">
							{translations.management.hasStatementColumn}
						</th>
						<th className="text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl w-[35%] md:w-[25%]">
							{translations.management.createdColumn}
						</th>
						<th className="text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl hidden md:table-cell md:w-[25%]">
							{translations.management.updatedColumn}
						</th>
					</tr>
				</thead>
				<tbody className="w-full">
					{paymentTypes.map((pt) => (
						<tr key={pt.id} className="group">
							<td
								className="bg-white py-5 px-1 md:px-2 text-blue-wood first:rounded-l-lg pl-2 truncate md:text-base"
								title={pt.description}
							>
								{pt.description}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray md:text-base">
								{pt.hasStatement ? (
									<Check className="h-4 w-4 text-green-500" />
								) : (
									<span className="text-light-gray">—</span>
								)}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray md:text-base">
								{pt.formattedCreatedAt}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray hidden md:table-cell md:text-base">
								{pt.formattedUpdatedAt}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-right last:rounded-r-lg pr-4">
								<DropdownMenu>
									<DropdownMenuTrigger className="p-2 hover:bg-light-blue/10 rounded-full transition-colors outline-none">
										<MoreVertical className="h-5 w-5 text-light-gray" />
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="bg-background border-white/10"
									>
										<DropdownMenuItem
											onClick={() => setEditingPT(pt)}
											className="flex items-center gap-2 cursor-pointer text-white focus:bg-white/5"
										>
											<Pencil className="h-4 w-4" />
											{translations.management.edit}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeletingPT(pt)}
											className="flex items-center gap-2 cursor-pointer text-pink focus:bg-red/5"
										>
											<Trash2 className="h-4 w-4" />
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
