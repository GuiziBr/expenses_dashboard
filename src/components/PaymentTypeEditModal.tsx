import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
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
import { cn } from "@/lib/utils"

interface PaymentTypeEditModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (description: string, hasStatement: boolean) => void
	initialDescription: string
	initialHasStatement: boolean
	isPending?: boolean
}

export function PaymentTypeEditModal({
	isOpen,
	onClose,
	onSubmit,
	initialDescription,
	initialHasStatement,
	isPending = false
}: PaymentTypeEditModalProps) {
	const [description, setDescription] = useState("")
	const [hasStatement, setHasStatement] = useState(false)

	useEffect(() => {
		if (isOpen) {
			setDescription(initialDescription)
			setHasStatement(initialHasStatement)
		}
	}, [isOpen, initialDescription, initialHasStatement])

	const isUnchanged =
		description === initialDescription && hasStatement === initialHasStatement

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!description.trim() || isPending || isUnchanged) return
		onSubmit(description.trim(), hasStatement)
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px] bg-background border-white/10">
				<DialogHeader>
					<DialogTitle className="text-white">
						{translations.management.editPaymentTypeTitle}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-4">
					<Input
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder={translations.management.paymentTypePlaceholder}
						autoFocus
					/>
					<label className="flex items-center gap-2 cursor-pointer select-none">
						<div
							className={cn(
								"size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
								hasStatement
									? "bg-orange border-orange"
									: "border-iron-gray hover:border-orange"
							)}
						>
							{hasStatement && (
								<svg
									aria-hidden="true"
									className="size-3.5 text-background"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={4}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							)}
						</div>
						<input
							type="checkbox"
							className="hidden"
							checked={hasStatement}
							onChange={(e) => setHasStatement(e.target.checked)}
						/>
						<span className="text-sm font-medium text-white">
							{translations.management.hasStatementLabel}
						</span>
					</label>
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
							disabled={!description.trim() || isPending || isUnchanged}
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
