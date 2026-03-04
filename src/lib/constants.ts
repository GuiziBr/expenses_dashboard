import { translations } from "@/constants/translations"

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

export const COLUMN_FILTERS = [
	{ id: "categories", description: translations.filters.categories },
	{ id: "paymentType", description: translations.filters.method },
	{ id: "banks", description: translations.filters.bank },
	{ id: "stores", description: translations.filters.store }
] as const

export const FILTER_VALUE_MAPPING: Record<string, string> = {
	categories: "category",
	paymentType: "payment_type",
	banks: "bank",
	stores: "store"
}

export const SHARED_BALANCE_TYPES = [
	{ id: "categories", description: translations.filters.categories },
	{ id: "payments", description: translations.filters.paymentType }
]
