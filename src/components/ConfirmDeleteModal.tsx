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
import { useDeleteBank } from "@/hooks/use-banks"

interface ConfirmDeleteModalProps {
	bankId: string | null
	bankName: string | null
	isOpen: boolean
	onClose: () => void
}

export function ConfirmDeleteModal({
	bankId,
	bankName,
	isOpen,
	onClose
}: ConfirmDeleteModalProps) {
	const { mutate, isPending } = useDeleteBank()

	const handleDelete = () => {
		if (!bankId) return

		mutate(bankId, {
			onSuccess: () => {
				toast.success(translations.management.deleteSuccess)
				onClose()
			},
			onError: (error) => {
				toast.error(error.message || translations.management.deleteError)
			}
		})
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px] bg-background border-white/10">
				<DialogHeader>
					<DialogTitle className="text-white">
						{translations.management.confirmDeleteTitle}
					</DialogTitle>
					<DialogDescription className="text-light-gray pt-2">
						{translations.management.confirmDeleteDescription}
						{bankName && (
							<span className="block mt-2 font-medium text-white italic">
								"{bankName}"
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
						className="bg-pink hover:bg-red/90"
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
