import type { Expense, FormattedExpense } from "@/types/expenses"

// ── Cached Intl formatters (created once, reused on every call) ─────

const currencyFormatter = new Intl.NumberFormat("en-CA", {
	style: "currency",
	currency: "CAD"
})

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
	timeZone: "UTC",
	day: "2-digit",
	month: "2-digit",
	year: "numeric"
})

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
	timeZone: "UTC",
	day: "2-digit",
	month: "2-digit"
})

// ── Public Helpers ──────────────────────────────────────────────────

/**
 * Format a value in cents to a CAD currency string.
 * @example formatAmount(15099) → "$150.99"
 */
export function formatAmount(valueInCents = 0): string {
	return currencyFormatter.format(valueInCents / 100)
}

/**
 * Format an ISO date string to a human-readable date.
 * @param format "full" → "MM/DD/YYYY", "short" → "MM/DD"
 * @example formatDate("2024-03-15", "full")  → "03/15/2024"
 * @example formatDate("2024-03-15", "short") → "03/15"
 */
export function formatDate(
	date: string | Date,
	format: "full" | "short" = "full"
): string {
	const formatter = format === "full" ? fullDateFormatter : shortDateFormatter
	return formatter.format(new Date(date))
}

// ── Expense Formatter ───────────────────────────────────────────────

/**
 * Transform a raw API expense into a UI-ready formatted expense.
 *
 * Replaces both `assembleExpense` (shared) and `assemblePersonalExpense`.
 * The only difference between the two is:
 * - **shared**: prepends "- " to outcome amounts and includes `type`
 * - **personal**: plain amount, no `type` field
 */
export function formatExpense(
	expense: Expense,
	variant: "shared" | "personal"
): FormattedExpense {
	const isSharedOutcome = variant === "shared" && expense.type === "outcome"

	return {
		id: expense.id,
		description: expense.description,
		category: expense.category.description,
		amount: expense.amount,
		formattedAmount: `${isSharedOutcome ? "- " : ""}${formatAmount(expense.amount)}`,
		date: expense.date,
		formattedDate: formatDate(expense.date, "full"),
		mobileFormattedDate: formatDate(expense.date, "short"),
		...(variant === "shared" && { type: expense.type }),
		paymentType: expense.payment_type.description,
		bank: expense.bank?.name,
		store: expense.store?.name,
		dueDate: expense.due_date,
		...(expense.due_date && {
			formattedDueDate: formatDate(expense.due_date, "full"),
			mobileFormattedDueDate: formatDate(expense.due_date, "short")
		})
	}
}
