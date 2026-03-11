/**
 * Expense domain types.
 *
 * - `Expense` matches the raw API response shape (snake_case from backend).
 * - `FormattedExpense` is the UI-ready shape with pre-formatted strings.
 */

// ── Raw API Types ───────────────────────────────────────────────────

export interface Expense {
	id: string
	owner_id: string
	description: string
	category_id: string
	payment_type_id: string
	bank_id?: string
	store_id?: string
	personal: boolean
	split: boolean
	category: { description: string }
	amount: number // in cents
	type: "income" | "outcome"
	date: string // ISO date string
	payment_type: { description: string }
	bank?: { name: string }
	store?: { name: string }
	due_date?: string // ISO date string, nullable
}

export interface NewExpensePayload {
	description: string
	category_id: string
	payment_type_id: string
	date: string
	amount: number
	personal: boolean
	split: boolean
	bank_id?: string
	store_id?: string
}

// ── UI-Ready Types ──────────────────────────────────────────────────

export interface FormattedExpense {
	id: string
	ownerId: string
	description: string
	categoryId: string
	paymentTypeId: string
	bankId?: string
	storeId?: string
	personal: boolean
	split: boolean
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
	orderType?: "asc" | "desc"
}

export interface ExpenseQueryParams extends ExpenseFilters, ExpenseOrderBy {
	offset: number
	limit: number
}

// ── Balance Types ────────────────────────────────────────────────────

export type BalanceFilterKey = "categories" | "paymentType" | "banks" | "stores"

export interface BalanceFilters {
	startDate?: string
	endDate?: string
	filterBy?: BalanceFilterKey
	filterValue?: string
}

export interface SharedBalance {
	paying: number
	payed: number
	total: number
}

export interface GetBalanceResponse {
	personalBalance: number
	sharedBalance: SharedBalance
}

// ── Consolidated Balance Types ───────────────────────────────────────

export interface ReportBank {
	id: string
	name: string
	total: number
}

export interface ReportPayment {
	id: string
	description: string
	banks: Array<ReportBank>
	total: number
}

export interface ReportCategory {
	id: string
	description: string
	total: number
}

export interface ConsolidatedReport {
	id: string
	name?: string
	payments?: Array<ReportPayment>
	categories?: Array<ReportCategory>
	total: number
}

export interface SharedReport {
	requester: ConsolidatedReport
	partner?: ConsolidatedReport
	balance: number
}

export interface ConsolidatedBalanceFilters {
	year: number
	month: number
}

// ── Management Types ───────────────────────────────────────────────

export interface Bank {
	id: string
	name: string
	created_at: string
	updated_at: string | null
}

export interface FormattedBank {
	id: string
	name: string
	createdAt: string
	updatedAt: string | null
	formattedCreatedAt: string
	formattedUpdatedAt: string
}

export interface BankQueryParams {
	offset: number
	limit: number
}

// ── Category Types ──────────────────────────────────────────────────

export interface Category {
	id: string
	description: string
	created_at: string
	updated_at: string | null
}

export interface FormattedCategory {
	id: string
	description: string
	createdAt: string
	updatedAt: string | null
	formattedCreatedAt: string
	formattedUpdatedAt: string
}

export interface CategoryQueryParams {
	offset: number
	limit: number
}

// ── Payment Type Types ──────────────────────────────────────────────

export interface PaymentType {
	id: string
	description: string
	has_statement: boolean
	created_at: string
	updated_at: string | null
}

export interface FormattedPaymentType {
	id: string
	description: string
	hasStatement: boolean
	createdAt: string
	updatedAt: string | null
	formattedCreatedAt: string
	formattedUpdatedAt: string
}

export interface PaymentTypeQueryParams {
	offset: number
	limit: number
}

// ── Store Types ─────────────────────────────────────────────────────

export interface Store {
	id: string
	name: string
	created_at: string
	updated_at: string | null
}

export interface FormattedStore {
	id: string
	name: string
	createdAt: string
	updatedAt: string | null
	formattedCreatedAt: string
	formattedUpdatedAt: string
}

export interface StoreQueryParams {
	offset: number
	limit: number
}
