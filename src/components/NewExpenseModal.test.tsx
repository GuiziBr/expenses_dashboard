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
					split: false
				}),
				expect.any(Object)
			)
		})
	})
})

describe("NewExpenseModal — edit mode", () => {
	let mockUpdateMutate: ReturnType<typeof vi.fn>
	let mockOnClose: ReturnType<typeof vi.fn>

	const mockExpense = {
		id: "exp-123",
		ownerId: "user-1",
		description: "Original Expense",
		categoryId: "cat-1",
		paymentTypeId: "pt-cc",
		bankId: "bank-1",
		storeId: undefined,
		personal: true,
		split: false,
		category: "Food",
		amount: 10000,
		formattedAmount: "$100.00",
		date: "2026-02-15",
		formattedDate: "02/15/2026",
		mobileFormattedDate: "02/15",
		type: "outcome" as const,
		paymentType: "Credit Card",
		bank: "TD Bank",
		store: undefined,
		dueDate: undefined,
		formattedDueDate: undefined,
		mobileFormattedDueDate: undefined
	}

	beforeEach(() => {
		mockUpdateMutate = vi.fn()
		mockOnClose = vi.fn()
		setupFilterValues(PT_WITH_STATEMENT)

		vi.mocked(useCreateExpense).mockReturnValue({
			mutate: vi.fn(),
			isPending: false
		} as unknown as ReturnType<typeof useCreateExpense>)

		vi.mocked(useUpdateExpense).mockReturnValue({
			mutate: mockUpdateMutate,
			isPending: false
		} as unknown as ReturnType<typeof useUpdateExpense>)
	})

	it("displays 'Edit Expense' title when editing", () => {
		render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		expect(screen.getByText("Edit Expense")).toBeInTheDocument()
	})

	it("displays 'Create Expense' title when creating", () => {
		render(<NewExpenseModal isOpen={true} onClose={mockOnClose} />)

		expect(screen.getByText("Create Expense")).toBeInTheDocument()
	})

	it("pre-fills form fields with expense data", () => {
		const { container } = render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		const descriptionInput = screen.getByPlaceholderText(
			"Expense description"
		) as HTMLInputElement
		expect(descriptionInput.value).toBe("Original Expense")

		const amountInput = screen.getByPlaceholderText(
			"99.99"
		) as HTMLInputElement
		expect(amountInput.value).toBe("100.00")

		const dateInput = container.querySelector(
			'input[type="date"]'
		) as HTMLInputElement
		expect(dateInput.value).toBe("2026-02-15")
	})

	it("pre-selects the correct category, payment type, and bank", () => {
		render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		const selects = screen.getAllByRole("combobox")
		expect((selects[0] as HTMLSelectElement).value).toBe("cat-1")
		expect((selects[1] as HTMLSelectElement).value).toBe("pt-cc")
		expect((selects[2] as HTMLSelectElement).value).toBe("bank-1")
	})

	it("pre-checks the personal checkbox when expense is personal", () => {
		render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		const personalCheckbox = screen.getByLabelText("Personal")
		expect(personalCheckbox).toBeChecked()
	})

	it("pre-checks the split checkbox when expense is split", () => {
		const splitExpense = { ...mockExpense, split: true, amount: 5000 }
		render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={splitExpense}
			/>
		)

		const splitCheckbox = screen.getByLabelText("Split")
		expect(splitCheckbox).toBeChecked()
	})

	it("displays split amount hint when editing a split expense", () => {
		const splitExpense = { ...mockExpense, split: true, amount: 5000 }
		render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={splitExpense}
			/>
		)

		expect(
			screen.getByText(/Split expense - your original share was:/i)
		).toBeInTheDocument()
		// The formatAmount function formats 5000 cents as "$50.00" but may include locale-specific formatting
		expect(screen.getByText(/\$50\.00/)).toBeInTheDocument()
	})

	it("does not display split amount hint when expense is not split", () => {
		render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		expect(
			screen.queryByText(/Split expense - your original share was:/i)
		).not.toBeInTheDocument()
	})

	it("calculates full amount correctly for split expenses", () => {
		// If split expense has amount 5000 (your share), form should show 10000 (full amount)
		const splitExpense = { ...mockExpense, split: true, amount: 5000 }
		render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={splitExpense}
			/>
		)

		const amountInput = screen.getByPlaceholderText(
			"99.99"
		) as HTMLInputElement
		expect(amountInput.value).toBe("100.00")
	})

	it("shows Cancel button in edit mode", () => {
		render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		expect(screen.getByText("Cancel")).toBeInTheDocument()
	})

	it("does not show Cancel button in create mode", () => {
		render(<NewExpenseModal isOpen={true} onClose={mockOnClose} />)

		expect(screen.queryByText("Cancel")).not.toBeInTheDocument()
	})

	it("calls onClose when Cancel button is clicked", async () => {
		const user = userEvent.setup()
		render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		await user.click(screen.getByText("Cancel"))
		expect(mockOnClose).toHaveBeenCalled()
	})

	it("calls updateExpense with correct payload on save", async () => {
		const user = userEvent.setup()
		const { container } = render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		// Modify the description
		const descriptionInput = screen.getByPlaceholderText("Expense description")
		await user.clear(descriptionInput)
		await user.type(descriptionInput, "Updated Expense")

		// Modify the amount
		const amountInput = screen.getByPlaceholderText("99.99")
		await user.clear(amountInput)
		await user.type(amountInput, "75.50")

		await user.click(screen.getByRole("button", { name: /save/i }))

		await waitFor(() => {
			expect(mockUpdateMutate).toHaveBeenCalledWith(
				{
					id: "exp-123",
					payload: expect.objectContaining({
						description: "Updated Expense",
						amount: 75.5,
						category_id: "cat-1",
						payment_type_id: "pt-cc",
						date: "2026-02-15",
						bank_id: "bank-1",
						personal: true,
						split: false
					})
				},
				expect.any(Object)
			)
		})
	})

	it("resets form when modal closes", async () => {
		const { rerender } = render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		// Close modal
		rerender(<NewExpenseModal isOpen={false} onClose={mockOnClose} />)

		// Reopen without expense (create mode)
		rerender(<NewExpenseModal isOpen={true} onClose={mockOnClose} />)

		const descriptionInput = screen.getByPlaceholderText(
			"Expense description"
		) as HTMLInputElement
		expect(descriptionInput.value).toBe("")
	})

	it("updates form when switching between different expenses", () => {
		const { rerender } = render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		const descriptionInput = screen.getByPlaceholderText(
			"Expense description"
		) as HTMLInputElement
		expect(descriptionInput.value).toBe("Original Expense")

		// Switch to a different expense
		const anotherExpense = {
			...mockExpense,
			id: "exp-456",
			description: "Another Expense",
			amount: 5000
		}
		rerender(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={anotherExpense}
			/>
		)

		expect(descriptionInput.value).toBe("Another Expense")
	})

	it("disables save button while updating", () => {
		vi.mocked(useUpdateExpense).mockReturnValue({
			mutate: mockUpdateMutate,
			isPending: true
		} as unknown as ReturnType<typeof useUpdateExpense>)

		render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		// When isPending, the button shows a spinner and has no accessible name
		// Find all buttons and check that the submit button (not Cancel) is disabled
		const buttons = screen.getAllByRole("button")
		const submitButton = buttons.find((btn) => btn.type === "submit")
		expect(submitButton).toBeDisabled()
	})

	it("shows loading spinner while updating", () => {
		vi.mocked(useUpdateExpense).mockReturnValue({
			mutate: mockUpdateMutate,
			isPending: true
		} as unknown as ReturnType<typeof useUpdateExpense>)

		const { container } = render(
			<NewExpenseModal
				isOpen={true}
				onClose={mockOnClose}
				expense={mockExpense}
			/>
		)

		// Loader2 component renders with animate-spin class
		expect(container.querySelector(".animate-spin")).toBeInTheDocument()
	})
})