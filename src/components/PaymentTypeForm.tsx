"use client"

import { CreditCard, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { translations } from "@/constants/translations"
import { useCreatePaymentType } from "@/hooks/use-payment-types"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function PaymentTypeForm() {
	const [description, setDescription] = useState("")
	const [hasStatement, setHasStatement] = useState(false)
	const { mutate: createPaymentType, isPending } = useCreatePaymentType()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!description.trim()) return

		createPaymentType(
			{ description: description.trim(), hasStatement },
			{
				onSuccess: () => {
					toast.success(translations.management.paymentTypeCreateSuccess)
					setDescription("")
					setHasStatement(false)
				},
				onError: (error) => {
					toast.error(
						error.message || translations.management.paymentTypeCreateError
					)
				}
			}
		)
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col md:flex-row items-center gap-4 w-full"
		>
			<Input
				id="payment-type-description"
				name="payment-type-description"
				icon={CreditCard}
				placeholder={translations.management.paymentTypePlaceholder}
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				className="w-full md:flex-1 h-12"
			/>
			<label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
				<div
					className={cn(
						"size-5 rounded border-2 flex items-center justify-center transition-colors",
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
