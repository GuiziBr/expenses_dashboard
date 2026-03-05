"use client"

import { Loader2, Store } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { translations } from "@/constants/translations"
import { useCreateStore } from "@/hooks/use-stores"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function StoreForm() {
	const [name, setName] = useState("")
	const { mutate: createStore, isPending } = useCreateStore()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim()) return

		createStore(name, {
			onSuccess: () => {
				toast.success(translations.management.storeCreateSuccess)
				setName("")
			},
			onError: (error) => {
				toast.error(error.message || translations.management.storeCreateError)
			}
		})
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col md:flex-row items-center gap-4 w-full"
		>
			<Input
				id="store-name"
				name="store-name"
				icon={Store}
				placeholder={translations.management.storePlaceholder}
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="w-full md:flex-1 h-12"
			/>
			<Button
				type="submit"
				disabled={!name.trim() || isPending}
				className="h-12 w-full md:w-32 bg-orange text-background font-medium hover:brightness-95 transition-all"
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
