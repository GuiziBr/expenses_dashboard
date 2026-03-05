"use client"

import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { CategoryEditModal } from "@/components/CategoryEditModal"
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { translations } from "@/constants/translations"
import { useDeleteCategory } from "@/hooks/use-categories"
import type { FormattedCategory } from "@/types/expenses"

interface CategoryTableProps {
	categories: FormattedCategory[]
}

export function CategoryTable({ categories }: CategoryTableProps) {
	const [editingCategory, setEditingCategory] =
		useState<FormattedCategory | null>(null)
	const [deletingCategory, setDeletingCategory] =
		useState<FormattedCategory | null>(null)

	const { mutate, isPending } = useDeleteCategory()

	const handleDelete = () => {
		if (!deletingCategory) return

		mutate(deletingCategory.id, {
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
		<div className="mt-8 w-full min-h-[20rem]">
			<table className="w-full border-separate border-spacing-y-2 table-fixed">
				<thead>
					<tr>
						<th className="text-left py-2 px-1 md:px-2 text-light-gray font-normal text-sm md:text-xl pl-2 w-[50%] md:w-[35%]">
							{translations.management.categoryColumn}
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
					{categories.map((category) => (
						<tr key={category.id} className="group">
							<td
								className="bg-white py-5 px-1 md:px-2 text-blue-wood first:rounded-l-lg pl-2 truncate md:text-base"
								title={category.description}
							>
								{category.description}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray md:text-base">
								{category.formattedCreatedAt}
							</td>
							<td className="bg-white py-5 px-1 md:px-2 text-light-gray hidden md:table-cell md:text-base">
								{category.formattedUpdatedAt}
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
											onClick={() => setEditingCategory(category)}
											className="flex items-center gap-2 cursor-pointer text-white focus:bg-white/5"
										>
											<Pencil className="h-4 w-4" />
											{translations.management.edit}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setDeletingCategory(category)}
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

			<CategoryEditModal
				category={editingCategory}
				isOpen={!!editingCategory}
				onClose={() => setEditingCategory(null)}
			/>

			<ConfirmDeleteModal
				title={translations.management.confirmDeleteCategoryTitle}
				description={translations.management.confirmDeleteCategoryDescription}
				resourceName={deletingCategory?.description}
				isOpen={!!deletingCategory}
				onClose={() => setDeletingCategory(null)}
				onConfirm={handleDelete}
				isPending={isPending}
			/>
		</div>
	)
}
