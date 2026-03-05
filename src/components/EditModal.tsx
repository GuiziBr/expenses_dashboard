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

interface EditModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (value: string) => void
	title: string
	initialValue: string
	placeholder: string
	isPending?: boolean
}

export function EditModal({
	isOpen,
	onClose,
	onSubmit,
	title,
	initialValue,
	placeholder,
	isPending = false
}: EditModalProps) {
	const [value, setValue] = useState("")

	useEffect(() => {
		if (isOpen) {
			setValue(initialValue)
		}
	}, [isOpen, initialValue])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!value.trim() || isPending || value === initialValue) return
		onSubmit(value.trim())
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px] bg-background border-white/10">
				<DialogHeader>
					<DialogTitle className="text-white">{title}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-4">
					<Input
						value={value}
						onChange={(e) => setValue(e.target.value)}
						placeholder={placeholder}
						autoFocus
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
							disabled={!value.trim() || isPending || value === initialValue}
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
