"use client"

import { Landmark, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { translations } from "@/constants/translations"
import { useCreateBank } from "@/hooks/use-banks"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function BankForm() {
	const [name, setName] = useState("")
	const { mutate: createBank, isPending } = useCreateBank()

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault()
		if (!name.trim()) return

		createBank(name, {
			onSuccess: () => {
				toast.success(translations.management.createSuccess)
				setName("")
			},
			onError: (error) => {
				toast.error(error.message || translations.management.bankCreateError)
			}
		})
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col md:flex-row items-center gap-4 w-full"
		>
			<Input
				id="bank-name"
				name="bank-name"
				icon={Landmark}
				placeholder={translations.management.bankPlaceholder}
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="w-full md:flex-1"
			/>
			<Button
				type="submit"
				disabled={!name.trim() || isPending}
				className="h-10 w-full font-semibold md:w-32"
			>
				{isPending ? (
					<Loader2 className="h-5 w-5 animate-spin" />
				) : (
					translations.createExpense.save
				)}
			</Button>
		</form>
	)
}
