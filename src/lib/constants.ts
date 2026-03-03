export const COOKIE_NAME = "auth_token"
export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export const AUTH_COOKIE_OPTIONS = {
	expires: 7, // 7 days
	path: "/",
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const
}

export const EXPENSE_COLUMNS = {
	description: "description",
	amount: "amount",
	date: "date",
	dueDate: "dueDate",
	category: "category",
	paymentType: "payment_type",
	bank: "bank",
	store: "store"
} as const

export const SHARED_BALANCE_TYPES = [
	{ id: "categories", description: "Category" },
	{ id: "payments", description: "Payment Type" }
]
