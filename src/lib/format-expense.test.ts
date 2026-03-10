import { describe, expect, it } from "vitest"
import type {
	Bank,
	Category,
	Expense,
	PaymentType,
	Store
} from "@/types/expenses"
import {
	formatAmount,
	formatBank,
	formatCategory,
	formatDate,
	formatExpense,
	formatPaymentType,
	formatStore
} from "./format-expense"

// ── formatAmount ────────────────────────────────────────────────────

describe("formatAmount", () => {
	it("formats a typical value in cents as CAD currency", () => {
		expect(formatAmount(15099)).toContain("150.99")
	})

	it("formats zero as $0.00", () => {
		expect(formatAmount(0)).toContain("0.00")
	})

	it("defaults to 0 when called with no argument", () => {
		expect(formatAmount()).toContain("0.00")
	})

	it("formats a large value correctly", () => {
		expect(formatAmount(1_000_000)).toContain("10,000.00")
	})
})

// ── formatDate ──────────────────────────────────────────────────────

describe("formatDate", () => {
	it("formats an ISO date string as MM/DD/YYYY (full)", () => {
		expect(formatDate("2024-03-15", "full")).toBe("03/15/2024")
	})

	it("formats an ISO date string as MM/DD (short)", () => {
		expect(formatDate("2024-03-15", "short")).toBe("03/15")
	})

	it("defaults to full format when no format is specified", () => {
		expect(formatDate("2024-03-15")).toBe("03/15/2024")
	})

	it("returns an empty string for null", () => {
		expect(formatDate(null)).toBe("")
	})

	it("returns an empty string for undefined", () => {
		expect(formatDate(undefined)).toBe("")
	})

	it("handles the last day of a month correctly", () => {
		expect(formatDate("2024-02-29", "full")).toBe("02/29/2024")
	})
})

// ── formatExpense ───────────────────────────────────────────────────

const baseExpense: Expense = {
	id: "exp-1",
	owner_id: "user-42",
	description: "Groceries",
	amount: 5000,
	type: "outcome",
	date: "2024-03-15",
	category: { description: "Food" },
	payment_type: { description: "Credit Card" },
	bank: { name: "TD Bank" },
	store: { name: "Walmart" },
	due_date: "2024-04-01"
}

describe("formatExpense — personal variant", () => {
	it("maps owner_id to ownerId", () => {
		const result = formatExpense(baseExpense, "personal")
		expect(result.ownerId).toBe("user-42")
	})

	it("does not prefix outcome amounts with '- '", () => {
		const result = formatExpense(baseExpense, "personal")
		expect(result.formattedAmount).not.toContain("- ")
	})

	it("does not include a type field", () => {
		const result = formatExpense(baseExpense, "personal")
		expect(result).not.toHaveProperty("type")
	})

	it("formats the date", () => {
		const result = formatExpense(baseExpense, "personal")
		expect(result.formattedDate).toBe("03/15/2024")
		expect(result.mobileFormattedDate).toBe("03/15")
	})

	it("maps category and payment type descriptions", () => {
		const result = formatExpense(baseExpense, "personal")
		expect(result.category).toBe("Food")
		expect(result.paymentType).toBe("Credit Card")
	})

	it("maps optional bank and store names", () => {
		const result = formatExpense(baseExpense, "personal")
		expect(result.bank).toBe("TD Bank")
		expect(result.store).toBe("Walmart")
	})

	it("includes formatted due date fields when due_date is present", () => {
		const result = formatExpense(baseExpense, "personal")
		expect(result.formattedDueDate).toBe("04/01/2024")
		expect(result.mobileFormattedDueDate).toBe("04/01")
	})

	it("omits due date fields when due_date is absent", () => {
		const expense = { ...baseExpense, due_date: undefined }
		const result = formatExpense(expense, "personal")
		expect(result.formattedDueDate).toBeUndefined()
		expect(result.mobileFormattedDueDate).toBeUndefined()
	})

	it("handles absent bank and store gracefully", () => {
		const expense = { ...baseExpense, bank: undefined, store: undefined }
		const result = formatExpense(expense, "personal")
		expect(result.bank).toBeUndefined()
		expect(result.store).toBeUndefined()
	})
})

describe("formatExpense — shared variant", () => {
	it("prefixes outcome amounts with '- '", () => {
		const result = formatExpense(baseExpense, "shared")
		expect(result.formattedAmount).toMatch(/^- /)
	})

	it("does NOT prefix income amounts with '- '", () => {
		const income = { ...baseExpense, type: "income" as const }
		const result = formatExpense(income, "shared")
		expect(result.formattedAmount).not.toContain("- ")
	})

	it("includes the type field", () => {
		const result = formatExpense(baseExpense, "shared")
		expect(result).toHaveProperty("type", "outcome")
	})
})

// ── formatBank ──────────────────────────────────────────────────────

describe("formatBank", () => {
	const bank: Bank = {
		id: "bank-1",
		name: "TD Bank",
		created_at: "2024-01-10",
		updated_at: "2024-06-01"
	}

	it("maps all fields correctly", () => {
		const result = formatBank(bank)
		expect(result.id).toBe("bank-1")
		expect(result.name).toBe("TD Bank")
		expect(result.createdAt).toBe("2024-01-10")
		expect(result.updatedAt).toBe("2024-06-01")
		expect(result.formattedCreatedAt).toBe("01/10/2024")
		expect(result.formattedUpdatedAt).toBe("06/01/2024")
	})

	it("formats a null updated_at as an empty string", () => {
		const result = formatBank({ ...bank, updated_at: null })
		expect(result.formattedUpdatedAt).toBe("")
	})
})

// ── formatCategory ──────────────────────────────────────────────────

describe("formatCategory", () => {
	const category: Category = {
		id: "cat-1",
		description: "Food",
		created_at: "2024-01-10",
		updated_at: null
	}

	it("maps all fields correctly", () => {
		const result = formatCategory(category)
		expect(result.id).toBe("cat-1")
		expect(result.description).toBe("Food")
		expect(result.formattedCreatedAt).toBe("01/10/2024")
		expect(result.formattedUpdatedAt).toBe("")
	})
})

// ── formatPaymentType ───────────────────────────────────────────────

describe("formatPaymentType", () => {
	const pt: PaymentType = {
		id: "pt-1",
		description: "Credit Card",
		has_statement: true,
		created_at: "2024-01-10",
		updated_at: null
	}

	it("maps has_statement to hasStatement", () => {
		expect(formatPaymentType(pt).hasStatement).toBe(true)
		expect(
			formatPaymentType({ ...pt, has_statement: false }).hasStatement
		).toBe(false)
	})

	it("maps all other fields correctly", () => {
		const result = formatPaymentType(pt)
		expect(result.id).toBe("pt-1")
		expect(result.description).toBe("Credit Card")
		expect(result.formattedCreatedAt).toBe("01/10/2024")
		expect(result.formattedUpdatedAt).toBe("")
	})
})

// ── formatStore ─────────────────────────────────────────────────────

describe("formatStore", () => {
	const store: Store = {
		id: "store-1",
		name: "Walmart",
		created_at: "2024-01-10",
		updated_at: null
	}

	it("maps all fields correctly", () => {
		const result = formatStore(store)
		expect(result.id).toBe("store-1")
		expect(result.name).toBe("Walmart")
		expect(result.formattedCreatedAt).toBe("01/10/2024")
		expect(result.formattedUpdatedAt).toBe("")
	})
})
