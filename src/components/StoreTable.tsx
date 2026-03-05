"use client"

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
import { useDeleteStore, useUpdateStore } from "@/hooks/use-stores"
import type { FormattedStore } from "@/types/expenses"

interface StoreTableProps {
	stores: FormattedStore[]
}

export function StoreTable({ stores }: StoreTableProps) {
	const [editingStore, setEditingStore] = useState<FormattedStore | null>(null)
	const [deletingStore, setDeletingStore] = useState<FormattedStore | null>(
		null
	)

	const { mutate: deleteStore, isPending: isDeleting } = useDeleteStore()
	const { mutate: updateStore, isPending: isUpdating } = useUpdateStore()

	const handleEdit = (name: string) => {
		if (!editingStore) return

		updateStore(
			{ id: editingStore.id, name },
			{
				onSuccess: () => {
					toast.success(translations.management.storeUpdateSuccess)
					setEditingStore(null)
				},
				onError: (error) => {
					toast.error(error.message || translations.management.storeUpdateError)
				}
			}
		)
	}

	const handleDelete = () => {
		if (!deletingStore) return

		deleteStore(deletingStore.id, {
			onSuccess: () => {
				toast.success(translations.management.storeDeleteSuccess)
				setDeletingStore(null)
			},
			onError: (error) => {
				toast.error(error.message || translations.management.storeDeleteError)
			}
		})
	}

	return (
		<div className="mt-8 w-full min-h-[20rem]">
			<table className="w-full border-separate border-spacing-y-2 table-fixed">
				<thead>
					<tr>
						<th className="text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl pl-2 w-[50%] md:w-[35%]">
							{translations.management.storeColumn}
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
					{stores.map((store) => (
						<tr key={store.id} className="group">
							<td
								className="bg-white py-5 px-1 md:px-2 text-blue-wood first:rounded-l-lg pl-2 truncate md:text-base"
								title={store.name}
							>
								{store.name}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray md:text-base">
								{store.formattedCreatedAt}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray hidden md:table-cell md:text-base">
								{store.formattedUpdatedAt}
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
											onClick={() => setEditingStore(store)}
											className="flex items-center gap-2 cursor-pointer text-white focus:bg-white/5"
										>
											<Pencil className="h-4 w-4" />
											{translations.management.edit}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeletingStore(store)}
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
				title={translations.management.editStoreTitle}
				placeholder={translations.management.storePlaceholder}
				initialValue={editingStore?.name ?? ""}
				isOpen={!!editingStore}
				onClose={() => setEditingStore(null)}
				onSubmit={handleEdit}
				isPending={isUpdating}
			/>

			<ConfirmDeleteModal
				title={translations.management.confirmDeleteStoreTitle}
				description={translations.management.confirmDeleteStoreDescription}
				resourceName={deletingStore?.name}
				isOpen={!!deletingStore}
				onClose={() => setDeletingStore(null)}
				onConfirm={handleDelete}
				isPending={isDeleting}
			/>
		</div>
	)
}
