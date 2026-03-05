"use client"

import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { translations } from "@/constants/translations"
import { useDeleteCategory } from "@/hooks/use-categories"

interface CategoryConfirmDeleteModalProps {
	categoryId: string | null
	categoryName: string | null
	isOpen: boolean
	onClose: () => void
}

export function CategoryConfirmDeleteModal({
	categoryId,
	categoryName,
	isOpen,
	onClose
}: CategoryConfirmDeleteModalProps) {
	const { mutate, isPending } = useDeleteCategory()

	const handleDelete = () => {
		if (!categoryId) return

		mutate(categoryId, {
			onSuccess: () => {
				toast.success(translations.management.categoryDeleteSuccess)
				onClose()
			},
			onError: (error) => {
				toast.error(
					error.message || translations.management.categoryDeleteError
				)
			}
		})
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px] bg-background border-white/10">
				<DialogHeader>
					<DialogTitle className="text-white">
						{translations.management.confirmDeleteCategoryTitle}
					</DialogTitle>
					<DialogDescription className="text-light-gray pt-2">
						{translations.management.confirmDeleteCategoryDescription}
						{categoryName && (
							<span className="block mt-2 font-medium text-white italic">
								"{categoryName}"
							</span>
						)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="mt-6">
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
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isPending}
						className="bg-red hover:bg-red/90"
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							translations.management.delete
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
