"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { NewExpenseModal } from "@/components/NewExpenseModal"
import { Button } from "@/components/ui/button"
import { translations } from "@/constants/translations"

/** The page's primary action: a button in the top bar, a floating button on mobile. */
export function NewExpenseAction() {
	const [isOpen, setIsOpen] = useState(false)
	const label = translations.createExpense.title

	return (
		<>
			<Button
				type="button"
				onClick={() => setIsOpen(true)}
				className="hidden h-10 gap-2 px-4 md:inline-flex"
			>
				<Plus className="size-4" aria-hidden="true" />
				{label}
			</Button>
			<Button
				type="button"
				size="icon"
				aria-label={label}
				onClick={() => setIsOpen(true)}
				className="fixed right-5 bottom-24 z-30 size-14 rounded-full shadow-lg md:hidden"
			>
				<Plus className="size-6" aria-hidden="true" />
			</Button>
			<NewExpenseModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}
