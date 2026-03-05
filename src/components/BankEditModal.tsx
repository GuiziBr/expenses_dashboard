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
import { useUpdateBank } from "@/hooks/use-banks"
import type { FormattedBank } from "@/types/expenses"

interface BankEditModalProps {
	bank: FormattedBank | null
	isOpen: boolean
	onClose: () => void
}

export function BankEditModal({ bank, isOpen, onClose }: BankEditModalProps) {
	const [name, setName] = useState("")
	const { mutate, isPending } = useUpdateBank()

	useEffect(() => {
		if (bank) {
			setName(bank.name)
		}
	}, [bank])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!bank || !name.trim()) return

		mutate(
			{ id: bank.id, name: name.trim() },
			{
				onSuccess: () => {
					toast.success(translations.management.updateSuccess)
					onClose()
				},
				onError: (error) => {
					toast.error(error.message || translations.management.updateError)
				}
			}
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px] bg-background border-white/10">
				<DialogHeader>
					<DialogTitle className="text-white">
						{translations.management.editBankTitle}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-4">
					<Input
						id="edit-bank-name"
						name="edit-bank-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={translations.management.bankPlaceholder}
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
							disabled={!name.trim() || isPending || name === bank?.name}
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
