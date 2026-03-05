import { Loader2 } from "lucide-react"
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

interface ConfirmDeleteModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	description: string
	resourceName?: string | null
	isPending?: boolean
}

export function ConfirmDeleteModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	resourceName,
	isPending = false
}: ConfirmDeleteModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px] bg-background border-white/10">
				<DialogHeader>
					<DialogTitle className="text-white">{title}</DialogTitle>
					<DialogDescription className="text-light-gray pt-2">
						{description}
						{resourceName && (
							<span className="block mt-2 font-medium text-white italic">
								"{resourceName}"
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
						onClick={onConfirm}
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
