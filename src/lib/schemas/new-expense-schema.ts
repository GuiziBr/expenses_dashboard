import { z } from "zod"
import { translations } from "@/constants/translations"

export const newExpenseSchema = z.object({
	description: z
		.string()
		.min(1, "Description is required")
		.max(35, "Max 35 characters"),
	category: z.string().min(1, "Category is required"),
	paymentType: z.string().min(1, "Payment type is required"),
	bank: z.string().optional(),
	store: z.string().optional(),
	date: z.string().min(1, "Date is required"),
	amount: z
		.string()
		.min(1, "Amount is required")
		.refine(
			(val) => {
				const normalized = val.replace(/,/g, "")
				return /^\d+(\.\d{1,2})?$/.test(normalized) && Number(normalized) > 0
			},
			{ message: translations.createExpense.invalidAmount }
		),
	options: z.array(z.string())
})

export type NewExpenseFormValues = z.infer<typeof newExpenseSchema>
