"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { NewExpenseModal } from "@/components/NewExpenseModal"
import { Button } from "@/components/ui/button"
import { translations } from "@/constants/translations"
import { useDraggableFab } from "@/hooks/use-draggable-fab"
import { cn } from "@/lib/utils"

/** The page's primary action: a button in the top bar, a floating button on mobile that can be dragged to either screen edge. */
export function NewExpenseAction() {
	const [isOpen, setIsOpen] = useState(false)
	const label = translations.createExpense.title
	const fab = useDraggableFab()

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
				onClick={() => {
					if (!fab.consumeDrag()) setIsOpen(true)
				}}
				style={fab.style}
				{...fab.handlers}
				className={cn(
					"fixed right-5 bottom-24 z-30 size-14 touch-none rounded-full shadow-lg transition-[left,top] duration-200 md:hidden",
					fab.isDragging && "scale-105 cursor-grabbing"
				)}
			>
				<Plus className="size-6" aria-hidden="true" />
			</Button>
			<NewExpenseModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}
