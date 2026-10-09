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
		<div className="w-full overflow-hidden rounded-xl border border-border bg-card lg:min-h-[10rem] lg:overflow-y-auto">
			<table className="w-full table-fixed">
				<thead className="bg-card lg:sticky lg:top-0 lg:z-10">
					<tr>
						<th className="bg-background/60 px-3 py-3 text-left text-[13px] font-semibold text-muted-foreground md:px-4 w-[50%] md:w-[35%]">
							{translations.management.bankColumn}
						</th>
						<th className="bg-background/60 px-3 py-3 text-left text-[13px] font-semibold text-muted-foreground md:px-4 w-[35%] md:w-[25%]">
							{translations.management.createdColumn}
						</th>
						<th className="bg-background/60 px-3 py-3 text-left text-[13px] font-semibold text-muted-foreground md:px-4 hidden md:table-cell md:w-[25%]">
							{translations.management.updatedColumn}
						</th>
						<th scope="col" className="w-14 bg-background/60" />
					</tr>
				</thead>
				<tbody className="w-full">
					{banks.map((bank) => (
						<tr
							key={bank.id}
							className="border-t border-border transition-colors hover:bg-accent/40"
						>
							<td
								className="px-3 py-4 truncate text-sm font-medium text-foreground md:px-4"
								title={bank.name}
							>
								{bank.name}
							</td>
							<td className="px-3 py-4 text-sm text-muted-foreground md:px-4">
								{bank.formattedCreatedAt}
							</td>
							<td className="px-3 py-4 hidden text-sm text-muted-foreground md:table-cell md:px-4">
								{bank.formattedUpdatedAt}
							</td>
							<td className="px-2 py-2 text-right md:px-3">
								<DropdownMenu>
									<DropdownMenuTrigger className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
										<MoreVertical className="size-5" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => setEditingBank(bank)}
											className="cursor-pointer"
										>
											<Pencil />
											{translations.management.edit}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeletingBank(bank)}
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
