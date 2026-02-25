/**
 * Expense domain types.
 *
 * - `Expense` matches the raw API response shape (snake_case from backend).
 * - `FormattedExpense` is the UI-ready shape with pre-formatted strings.
 */

// ── Raw API Types ───────────────────────────────────────────────────

export interface Expense {
	id: string
	description: string
	category: { description: string }
	amount: number // in cents
	type: "income" | "outcome"
	date: string // ISO date string
	payment_type: { description: string }
	bank?: { name: string }
	store?: { name: string }
	due_date?: string // ISO date string, nullable
}

// ── UI-Ready Types ──────────────────────────────────────────────────

export interface FormattedExpense {
	id: string
	description: string
	category: string
	amount: number
	formattedAmount: string
	date: string
	formattedDate: string
	mobileFormattedDate: string
	type?: "income" | "outcome"
	paymentType: string
	bank?: string
	store?: string
	dueDate?: string
	formattedDueDate?: string
	mobileFormattedDueDate?: string
}

// ── Query Params ────────────────────────────────────────────────────

export interface ExpenseFilters {
	startDate?: string
	endDate?: string
	filterBy?: string
	filterValue?: string
}

export interface ExpenseOrderBy {
	orderBy?: string
	orderDirection?: "asc" | "desc"
}

export interface ExpenseQueryParams extends ExpenseFilters, ExpenseOrderBy {
	offset: number
	limit: number
}
