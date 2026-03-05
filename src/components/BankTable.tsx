import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal"
import { EditModal } from "@/components/EditModal"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { translations } from "@/constants/translations"
import { useDeleteBank, useUpdateBank } from "@/hooks/use-banks"
import type { FormattedBank } from "@/types/expenses"

interface BankTableProps {
	banks: FormattedBank[]
}

export function BankTable({ banks }: BankTableProps) {
	const [editingBank, setEditingBank] = useState<FormattedBank | null>(null)
	const [deletingBank, setDeletingBank] = useState<FormattedBank | null>(null)

	const { mutate: deleteBank, isPending: isDeleting } = useDeleteBank()
	const { mutate: updateBank, isPending: isUpdating } = useUpdateBank()

	const handleEdit = (name: string) => {
		if (!editingBank) return

		updateBank(
			{ id: editingBank.id, name },
			{
				onSuccess: () => {
					toast.success(translations.management.updateSuccess)
					setEditingBank(null)
				},
				onError: (error) => {
					toast.error(error.message || translations.management.bankUpdateError)
				}
			}
		)
	}

	const handleDelete = () => {
		if (!deletingBank) return

		deleteBank(deletingBank.id, {
			onSuccess: () => {
				toast.success(translations.management.deleteSuccess)
				setDeletingBank(null)
			},
			onError: (error) => {
				toast.error(error.message || translations.management.bankDeleteError)
			}
		})
	}

	return (
		<div className="mt-8 w-full min-h-[20rem]">
			<table className="w-full border-separate border-spacing-y-2 table-fixed">
				<thead>
					<tr>
						<th className="text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl pl-2 w-[50%] md:w-[35%]">
							{translations.management.bankColumn}
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
					{banks.map((bank) => (
						<tr key={bank.id} className="group">
							<td
								className="bg-white py-5 px-1 md:px-2 text-blue-wood first:rounded-l-lg pl-2 truncate md:text-base"
								title={bank.name}
							>
								{bank.name}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray md:text-base">
								{bank.formattedCreatedAt}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray hidden md:table-cell md:text-base">
								{bank.formattedUpdatedAt}
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
											onClick={() => setEditingBank(bank)}
											className="flex items-center gap-2 cursor-pointer text-white focus:bg-white/5"
										>
											<Pencil className="h-4 w-4" />
											{translations.management.edit}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeletingBank(bank)}
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

			<EditModal
				title={translations.management.editBankTitle}
				placeholder={translations.management.bankPlaceholder}
				initialValue={editingBank?.name ?? ""}
				isOpen={!!editingBank}
				onClose={() => setEditingBank(null)}
				onSubmit={handleEdit}
				isPending={isUpdating}
			/>

			<ConfirmDeleteModal
				title={translations.management.confirmDeleteTitle}
				description={translations.management.confirmDeleteDescription}
				resourceName={deletingBank?.name}
				isOpen={!!deletingBank}
				onClose={() => setDeletingBank(null)}
				onConfirm={handleDelete}
				isPending={isDeleting}
			/>
		</div>
	)
}
