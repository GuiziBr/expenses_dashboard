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
		<div className="w-full overflow-hidden rounded-xl border border-border bg-card">
			<table className="w-full table-fixed">
				<thead className="bg-background/60">
					<tr>
						<th className="px-3 py-3 text-left text-[13px] font-semibold text-muted-foreground md:px-4 w-[50%] md:w-[35%]">
							{translations.management.storeColumn}
						</th>
						<th className="px-3 py-3 text-left text-[13px] font-semibold text-muted-foreground md:px-4 w-[35%] md:w-[25%]">
							{translations.management.createdColumn}
						</th>
						<th className="px-3 py-3 text-left text-[13px] font-semibold text-muted-foreground md:px-4 hidden md:table-cell md:w-[25%]">
							{translations.management.updatedColumn}
						</th>
						<th scope="col" className="w-14" />
					</tr>
				</thead>
				<tbody className="w-full">
					{stores.map((store) => (
						<tr
							key={store.id}
							className="border-t border-border transition-colors hover:bg-accent/40"
						>
							<td
								className="px-3 py-4 truncate text-sm font-medium text-foreground md:px-4"
								title={store.name}
							>
								{store.name}
							</td>
							<td className="px-3 py-4 text-sm text-muted-foreground md:px-4">
								{store.formattedCreatedAt}
							</td>
							<td className="px-3 py-4 hidden text-sm text-muted-foreground md:table-cell md:px-4">
								{store.formattedUpdatedAt}
							</td>
							<td className="px-2 py-2 text-right md:px-3">
								<DropdownMenu>
									<DropdownMenuTrigger className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
										<MoreVertical className="size-5" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => setEditingStore(store)}
											className="cursor-pointer"
										>
											<Pencil />
											{translations.management.edit}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeletingStore(store)}
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
