import { describe, expect, it } from "vitest"
import { newExpenseSchema } from "./new-expense-schema"

const validPayload = {
	description: "Groceries",
	category: "cat-1",
	paymentType: "pt-1",
	date: "2024-03-15",
	amount: "50.00",
	options: []
}

describe("newExpenseSchema — valid inputs", () => {
	it("accepts a fully valid payload", () => {
		const result = newExpenseSchema.safeParse(validPayload)
		expect(result.success).toBe(true)
	})

	it("accepts a payload with optional bank and store", () => {
		const result = newExpenseSchema.safeParse({
			...validPayload,
			bank: "bank-1",
			store: "store-1"
		})
		expect(result.success).toBe(true)
	})

	it("accepts a payload without bank or store", () => {
		const result = newExpenseSchema.safeParse(validPayload)
		expect(result.success).toBe(true)
	})

	it("accepts options with personal and split values", () => {
		const result = newExpenseSchema.safeParse({
			...validPayload,
			options: ["personal"]
		})
		expect(result.success).toBe(true)
	})
})

describe("newExpenseSchema — description validation", () => {
	it("rejects an empty description", () => {
		const result = newExpenseSchema.safeParse({
			...validPayload,
			description: ""
		})
		expect(result.success).toBe(false)
	})

	it("rejects a description longer than 35 characters", () => {
		const result = newExpenseSchema.safeParse({
			...validPayload,
			description: "a".repeat(36)
		})
		expect(result.success).toBe(false)
	})

	it("accepts a description of exactly 35 characters", () => {
		const result = newExpenseSchema.safeParse({
			...validPayload,
			description: "a".repeat(35)
		})
		expect(result.success).toBe(true)
	})
})

describe("newExpenseSchema — required fields", () => {
	it("rejects a missing category", () => {
		const result = newExpenseSchema.safeParse({
			...validPayload,
			category: ""
		})
		expect(result.success).toBe(false)
	})

	it("rejects a missing payment type", () => {
		const result = newExpenseSchema.safeParse({
			...validPayload,
			paymentType: ""
		})
		expect(result.success).toBe(false)
	})

	it("rejects a missing date", () => {
		const result = newExpenseSchema.safeParse({
			...validPayload,
			date: ""
		})
		expect(result.success).toBe(false)
	})

	it("rejects a missing amount", () => {
		const result = newExpenseSchema.safeParse({
			...validPayload,
			amount: ""
		})
		expect(result.success).toBe(false)
	})
})
