"use client"

import { Loader2, Tag } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { translations } from "@/constants/translations"
import { useCreateCategory } from "@/hooks/use-categories"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function CategoryForm() {
	const [description, setDescription] = useState("")
	const { mutate: createCategory, isPending } = useCreateCategory()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!description.trim()) return

		createCategory(description.trim(), {
			onSuccess: () => {
				toast.success(translations.management.categoryCreateSuccess)
				setDescription("")
			},
			onError: (error) => {
				toast.error(
					error.message || translations.management.categoryCreateError
				)
			}
		})
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col md:flex-row items-center gap-4 w-full"
		>
			<Input
				id="category-description"
				name="category-description"
				icon={Tag}
				placeholder={translations.management.categoryPlaceholder}
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				className="w-full md:flex-1 h-12"
			/>
			<Button
				type="submit"
				disabled={!description.trim() || isPending}
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
