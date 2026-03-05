import { z } from "zod"

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
	amount: z.string().min(1, "Amount is required"),
	options: z.array(z.string())
})

export type NewExpenseFormValues = z.infer<typeof newExpenseSchema>
