// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Simplify Dialog so the form is always in the DOM when isOpen=true
vi.mock("@/components/ui/dialog", () => ({
	Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
		open ? children : null,
	DialogContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogHeader: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogTitle: ({ children }: { children: React.ReactNode }) => (
		<h2>{children}</h2>
	)
}))

vi.mock("@/hooks/use-expenses", () => ({
	useCreateExpense: vi.fn(),
	useUpdateExpense: vi.fn()
}))

vi.mock("@/hooks/use-filter-values", () => ({
	useFilterValues: vi.fn()
}))

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() }
}))

import * as React from "react"
import { useCreateExpense, useUpdateExpense } from "@/hooks/use-expenses"
import { useFilterValues } from "@/hooks/use-filter-values"
import { NewExpenseModal } from "./NewExpenseModal"

const PT_WITH_STATEMENT = {
	id: "pt-cc",
	description: "Credit Card",
	has_statement: true
}
const PT_NO_STATEMENT = {
	id: "pt-cash",
	description: "Cash",
	has_statement: false
}
const CATEGORY = { id: "cat-1", description: "Food" }
const BANK = { id: "bank-1", name: "TD Bank" }

function setupFilterValues(
	paymentType: typeof PT_WITH_STATEMENT | typeof PT_NO_STATEMENT
) {
	vi.mocked(useFilterValues).mockImplementation((filterType) => {
		const map: Record<string, object[]> = {
			categories: [CATEGORY],
			paymentType: [paymentType],
			banks: [BANK],
			stores: []
		}
		return { data: map[filterType ?? ""] ?? [] } as ReturnType<
			typeof useFilterValues
		>
	})
}

async function fillBaseFields(container: HTMLElement, paymentTypeId: string) {
	const user = userEvent.setup()

	await user.type(
		screen.getByPlaceholderText("Expense description"),
		"Groceries"
	)

	const selects = screen.getAllByRole("combobox")
	await user.selectOptions(selects[0], "cat-1") // category
	await user.selectOptions(selects[1], paymentTypeId) // payment type

	const dateInput = container.querySelector(
		'input[type="date"]'
	) as HTMLInputElement
	fireEvent.change(dateInput, { target: { value: "2026-03-01" } })

	await user.type(screen.getByPlaceholderText("99.99"), "50.00")

	return { user, selects }
}

describe("NewExpenseModal — bank required rule", () => {
	let mockMutate: ReturnType<typeof vi.fn>

	beforeEach(() => {
		mockMutate = vi.fn()
		vi.mocked(useCreateExpense).mockReturnValue({
			mutate: mockMutate,
			isPending: false
		} as unknown as ReturnType<typeof useCreateExpense>)
		vi.mocked(useUpdateExpense).mockReturnValue({
			mutate: vi.fn(),
			isPending: false
		} as unknown as ReturnType<typeof useUpdateExpense>)
	})

	it("shows a bank error when a has_statement payment type is selected without a bank", async () => {
		setupFilterValues(PT_WITH_STATEMENT)
		const { container } = render(
			<NewExpenseModal isOpen={true} onClose={vi.fn()} />
		)

		await fillBaseFields(container, "pt-cc")
		// Bank (selects[2]) left empty

		await userEvent.click(screen.getByRole("button", { name: /save/i }))

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent(
				"Bank is required for this payment type"
			)
		})
	})

	it("does not show a bank error when payment type has no statement", async () => {
		setupFilterValues(PT_NO_STATEMENT)
		const { container } = render(
			<NewExpenseModal isOpen={true} onClose={vi.fn()} />
		)

		await fillBaseFields(container, "pt-cash")
		// Bank (selects[2]) left empty — should be fine

		await userEvent.click(screen.getByRole("button", { name: /save/i }))

		await waitFor(() => {
			expect(screen.queryByRole("alert")).toBeNull()
		})
	})

	it("calls createExpense with correct payload on valid submission", async () => {
		setupFilterValues(PT_WITH_STATEMENT)
		const { container } = render(
			<NewExpenseModal isOpen={true} onClose={vi.fn()} />
		)

		const { selects } = await fillBaseFields(container, "pt-cc")
		await userEvent.selectOptions(selects[2], "bank-1") // select bank

		await userEvent.click(screen.getByRole("button", { name: /save/i }))

		await waitFor(() => {
			expect(mockMutate).toHaveBeenCalledWith(
				expect.objectContaining({
					description: "Groceries",
					category_id: "cat-1",
					payment_type_id: "pt-cc",
					date: "2026-03-01",
					amount: 50,
					bank_id: "bank-1",
					personal: false,
					split: false,
					current_month: undefined
				}),
				expect.any(Object)
			)
		})
	})
})

describe("NewExpenseModal — current month checkbox", () => {
	let mockMutate: ReturnType<typeof vi.fn>

	beforeEach(() => {
		mockMutate = vi.fn()
		vi.mocked(useCreateExpense).mockReturnValue({
			mutate: mockMutate,
			isPending: false
		} as unknown as ReturnType<typeof useCreateExpense>)
		vi.mocked(useUpdateExpense).mockReturnValue({
			mutate: vi.fn(),
			isPending: false
		} as unknown as ReturnType<typeof useUpdateExpense>)
	})

	it("does not show the Current Month checkbox when payment type has a statement", async () => {
		setupFilterValues(PT_WITH_STATEMENT)
		const { container } = render(
			<NewExpenseModal isOpen={true} onClose={vi.fn()} />
		)

		await fillBaseFields(container, "pt-cc")

		expect(screen.queryByText("Current Month")).toBeNull()
	})

	it("shows the Current Month checkbox when payment type has no statement", async () => {
		setupFilterValues(PT_NO_STATEMENT)
		const { container } = render(
			<NewExpenseModal isOpen={true} onClose={vi.fn()} />
		)

		await fillBaseFields(container, "pt-cash")

		expect(screen.getByText("Current Month")).toBeInTheDocument()
	})

	it("sends current_month: false by default when payment type has no statement", async () => {
		setupFilterValues(PT_NO_STATEMENT)
		const { container } = render(
			<NewExpenseModal isOpen={true} onClose={vi.fn()} />
		)

		await fillBaseFields(container, "pt-cash")
		await userEvent.click(screen.getByRole("button", { name: /save/i }))

		await waitFor(() => {
			expect(mockMutate).toHaveBeenCalledWith(
				expect.objectContaining({ current_month: false }),
				expect.any(Object)
			)
		})
	})

	it("sends current_month: true when the checkbox is checked", async () => {
		setupFilterValues(PT_NO_STATEMENT)
		const { container } = render(
			<NewExpenseModal isOpen={true} onClose={vi.fn()} />
		)

		await fillBaseFields(container, "pt-cash")

		await userEvent.click(screen.getByText("Current Month"))

		await userEvent.click(screen.getByRole("button", { name: /save/i }))

		await waitFor(() => {
			expect(mockMutate).toHaveBeenCalledWith(
				expect.objectContaining({ current_month: true }),
				expect.any(Object)
			)
		})
	})
})
