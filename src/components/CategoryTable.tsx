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
import { useDeleteCategory, useUpdateCategory } from "@/hooks/use-categories"
import type { FormattedCategory } from "@/types/expenses"

interface CategoryTableProps {
	categories: FormattedCategory[]
}

export function CategoryTable({ categories }: CategoryTableProps) {
	const [editingCategory, setEditingCategory] =
		useState<FormattedCategory | null>(null)
	const [deletingCategory, setDeletingCategory] =
		useState<FormattedCategory | null>(null)

	const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory()
	const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()

	const handleEdit = (description: string) => {
		if (!editingCategory) return

		updateCategory(
			{ id: editingCategory.id, description },
			{
				onSuccess: () => {
					toast.success(translations.management.categoryUpdateSuccess)
					setEditingCategory(null)
				},
				onError: (error) => {
					toast.error(
						error.message || translations.management.categoryUpdateError
					)
				}
			}
		)
	}

	const handleDelete = () => {
		if (!deletingCategory) return

		deleteCategory(deletingCategory.id, {
			onSuccess: () => {
				toast.success(translations.management.categoryDeleteSuccess)
				setDeletingCategory(null)
			},
			onError: (error) => {
				toast.error(
					error.message || translations.management.categoryDeleteError
				)
			}
		})
	}

	return (
		<div className="w-full overflow-hidden rounded-xl border border-border bg-card">
			<table className="w-full table-fixed">
				<thead className="bg-background/60">
					<tr>
						<th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:px-4 w-[50%] md:w-[35%]">
							{translations.management.categoryColumn}
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
					{categories.map((category) => (
						<tr
							key={category.id}
							className="border-t border-border transition-colors hover:bg-accent/40"
						>
							<td
								className="px-3 py-4 truncate text-sm font-medium text-foreground md:px-4"
								title={category.description}
							>
								{category.description}
							</td>
							<td className="px-3 py-4 text-sm text-muted-foreground md:px-4">
								{category.formattedCreatedAt}
							</td>
							<td className="px-3 py-4 hidden text-sm text-muted-foreground md:table-cell md:px-4">
								{category.formattedUpdatedAt}
							</td>
							<td className="px-2 py-2 text-right md:px-3">
								<DropdownMenu>
									<DropdownMenuTrigger className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
										<MoreVertical className="size-5" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => setEditingCategory(category)}
											className="cursor-pointer"
										>
											<Pencil />
											{translations.management.edit}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeletingCategory(category)}
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
				title={translations.management.editCategoryTitle}
				placeholder={translations.management.categoryPlaceholder}
				initialValue={editingCategory?.description ?? ""}
				isOpen={!!editingCategory}
				onClose={() => setEditingCategory(null)}
				onSubmit={handleEdit}
				isPending={isUpdating}
			/>

			<ConfirmDeleteModal
				title={translations.management.confirmDeleteCategoryTitle}
				description={translations.management.confirmDeleteCategoryDescription}
				resourceName={deletingCategory?.description}
				isOpen={!!deletingCategory}
				onClose={() => setDeletingCategory(null)}
				onConfirm={handleDelete}
				isPending={isDeleting}
			/>
		</div>
	)
}
