"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { translations } from "@/constants/translations"
import { useUpdateCategory } from "@/hooks/use-categories"
import type { FormattedCategory } from "@/types/expenses"

interface CategoryEditModalProps {
	category: FormattedCategory | null
	isOpen: boolean
	onClose: () => void
}

export function CategoryEditModal({
	category,
	isOpen,
	onClose
}: CategoryEditModalProps) {
	const [description, setDescription] = useState("")
	const { mutate, isPending } = useUpdateCategory()

	useEffect(() => {
		if (category) {
			setDescription(category.description)
		}
	}, [category])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!category || !description.trim()) return

		mutate(
			{ id: category.id, description: description.trim() },
			{
				onSuccess: () => {
					toast.success(translations.management.categoryUpdateSuccess)
					onClose()
				},
				onError: (error) => {
					toast.error(
						error.message || translations.management.categoryUpdateError
					)
				}
			}
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px] bg-background border-white/10">
				<DialogHeader>
					<DialogTitle className="text-white">
						{translations.management.editCategoryTitle}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-4">
					<Input
						id="edit-category-description"
						name="edit-category-description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder={translations.management.categoryPlaceholder}
						autoFocus
						className="h-12"
					/>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
							className="text-white border-white/10 hover:bg-white/5"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								!description.trim() ||
								isPending ||
								description === category?.description
							}
							className="bg-orange text-background hover:brightness-95"
						>
							{isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								translations.createExpense.save
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
