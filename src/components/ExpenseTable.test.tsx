// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ExpenseTable } from "./ExpenseTable"
import type { FormattedExpense } from "@/types/expenses"

// Mock the dropdown menu components
vi.mock("@/components/ui/dropdown-menu", () => ({
	DropdownMenu: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuTrigger: ({
		children,
		"aria-label": ariaLabel
	}: {
		children: React.ReactNode
		"aria-label": string
	}) => (
		<button aria-label={ariaLabel} type="button">
			{children}
		</button>
	),
	DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuItem: ({
		children,
		onClick
	}: {
		children: React.ReactNode
		onClick: () => void
	}) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	)
}))

const createMockExpense = (
	overrides: Partial<FormattedExpense> = {}
): FormattedExpense => ({
	id: "exp-1",
	ownerId: "user-1",
	description: "Groceries",
	categoryId: "cat-1",
	paymentTypeId: "pt-1",
	bankId: "bank-1",
	storeId: "store-1",
	personal: false,
	split: false,
	category: "Food",
	amount: 5000,
	formattedAmount: "$50.00",
	date: "2026-03-15",
	formattedDate: "03/15/2026",
	mobileFormattedDate: "03/15",
	type: "outcome",
	paymentType: "Credit Card",
	bank: "TD Bank",
	store: "Walmart",
	dueDate: "2026-04-01",
	formattedDueDate: "04/01/2026",
	mobileFormattedDueDate: "04/01",
	...overrides
})

describe("ExpenseTable", () => {
	const mockOnSort = vi.fn()
	const mockGetSortIndicator = vi.fn((column: string) => "")
	const mockOnDelete = vi.fn()
	const mockOnEdit = vi.fn()

	it("renders the table with expenses", () => {
		const expenses = [createMockExpense()]
		render(
			<ExpenseTable
				expenses={expenses}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		expect(screen.getByText("Groceries")).toBeInTheDocument()
		expect(screen.getByText("$50.00")).toBeInTheDocument()
	})

	it("displays all column headers", () => {
		render(
			<ExpenseTable
				expenses={[]}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		expect(screen.getByText("Expense")).toBeInTheDocument()
		expect(screen.getByText("Category")).toBeInTheDocument()
		expect(screen.getByText("Amount")).toBeInTheDocument()
		expect(screen.getByText("Method")).toBeInTheDocument()
		expect(screen.getByText("Due Date")).toBeInTheDocument()
		expect(screen.getByText("Purchase")).toBeInTheDocument()
		expect(screen.getByText("Bank")).toBeInTheDocument()
		expect(screen.getByText("Store")).toBeInTheDocument()
	})

	it("calls onSort when clicking a sortable column header", async () => {
		const user = userEvent.setup()
		render(
			<ExpenseTable
				expenses={[]}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		await user.click(screen.getByText("Expense"))
		expect(mockOnSort).toHaveBeenCalledWith("description")

		await user.click(screen.getByText("Amount"))
		expect(mockOnSort).toHaveBeenCalledWith("amount")
	})

	it("displays sort indicators from getSortIndicator", () => {
		mockGetSortIndicator.mockImplementation((column: string) => {
			if (column === "description") return "↑"
			if (column === "amount") return "↓"
			return ""
		})

		render(
			<ExpenseTable
				expenses={[]}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		// The sort indicators should be rendered
		expect(mockGetSortIndicator).toHaveBeenCalled()
	})

	it("renders expense data in the table row", () => {
		const expense = createMockExpense({
			description: "Coffee",
			category: "Dining",
			formattedAmount: "$15.50",
			paymentType: "Debit Card",
			bank: "RBC",
			store: "Starbucks"
		})

		render(
			<ExpenseTable
				expenses={[expense]}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		expect(screen.getByText("Coffee")).toBeInTheDocument()
		expect(screen.getByText("Dining")).toBeInTheDocument()
		expect(screen.getByText("$15.50")).toBeInTheDocument()
		expect(screen.getByText("Debit Card")).toBeInTheDocument()
		expect(screen.getByText("RBC")).toBeInTheDocument()
		expect(screen.getByText("Starbucks")).toBeInTheDocument()
	})

	it("applies correct color for outcome expenses", () => {
		const expense = createMockExpense({
			type: "outcome",
			formattedAmount: "- $50.00"
		})

		const { container } = render(
			<ExpenseTable
				expenses={[expense]}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		const amountCell = container.querySelector(".text-pink")
		expect(amountCell).toBeInTheDocument()
	})

	it("applies correct color for income expenses", () => {
		const expense = createMockExpense({
			type: "income",
			formattedAmount: "$100.00"
		})

		const { container } = render(
			<ExpenseTable
				expenses={[expense]}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		const amountCell = container.querySelector(".text-green")
		expect(amountCell).toBeInTheDocument()
	})

	it("displays '—' for missing bank data", () => {
		const expense = createMockExpense({ bank: undefined })

		render(
			<ExpenseTable
				expenses={[expense]}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		// Check for the em dash character
		const cells = screen.getAllByText("—")
		expect(cells.length).toBeGreaterThan(0)
	})

	it("displays '—' for missing store data", () => {
		const expense = createMockExpense({ store: undefined })

		render(
			<ExpenseTable
				expenses={[expense]}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		const cells = screen.getAllByText("—")
		expect(cells.length).toBeGreaterThan(0)
	})

	it("displays '—' for missing due date", () => {
		const expense = createMockExpense({
			dueDate: undefined,
			formattedDueDate: undefined,
			mobileFormattedDueDate: undefined
		})

		render(
			<ExpenseTable
				expenses={[expense]}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		const cells = screen.getAllByText("—")
		expect(cells.length).toBeGreaterThan(0)
	})

	it("renders multiple expenses", () => {
		const expenses = [
			createMockExpense({ id: "exp-1", description: "Groceries" }),
			createMockExpense({ id: "exp-2", description: "Gas" }),
			createMockExpense({ id: "exp-3", description: "Internet" })
		]

		render(
			<ExpenseTable
				expenses={expenses}
				onSort={mockOnSort}
				getSortIndicator={mockGetSortIndicator}
			/>
		)

		expect(screen.getByText("Groceries")).toBeInTheDocument()
		expect(screen.getByText("Gas")).toBeInTheDocument()
		expect(screen.getByText("Internet")).toBeInTheDocument()
	})

	describe("Action menu", () => {
		it("does not show actions column when onDelete and onEdit are not provided", () => {
			const expense = createMockExpense()
			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
				/>
			)

			expect(
				screen.queryByLabelText("Expense actions")
			).not.toBeInTheDocument()
		})

		it("shows actions menu when currentUserId matches expense ownerId", () => {
			const expense = createMockExpense({ ownerId: "user-1" })
			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
					onDelete={mockOnDelete}
					onEdit={mockOnEdit}
					currentUserId="user-1"
				/>
			)

			expect(screen.getByLabelText("Expense actions")).toBeInTheDocument()
		})

		it("does not show actions menu when currentUserId does not match expense ownerId", () => {
			const expense = createMockExpense({ ownerId: "user-2" })
			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
					onDelete={mockOnDelete}
					onEdit={mockOnEdit}
					currentUserId="user-1"
				/>
			)

			expect(
				screen.queryByLabelText("Expense actions")
			).not.toBeInTheDocument()
		})

		it("calls onEdit when Edit menu item is clicked", async () => {
			const user = userEvent.setup()
			const expense = createMockExpense({ ownerId: "user-1" })

			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
					onEdit={mockOnEdit}
					currentUserId="user-1"
				/>
			)

			const editButton = screen.getByText("Edit")
			await user.click(editButton)

			expect(mockOnEdit).toHaveBeenCalledWith(expense)
		})

		it("calls onDelete when Delete menu item is clicked", async () => {
			const user = userEvent.setup()
			const expense = createMockExpense({ ownerId: "user-1" })

			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
					onDelete={mockOnDelete}
					currentUserId="user-1"
				/>
			)

			const deleteButton = screen.getByText("Delete")
			await user.click(deleteButton)

			expect(mockOnDelete).toHaveBeenCalledWith(expense)
		})

		it("shows only Edit action when onDelete is not provided", () => {
			const expense = createMockExpense({ ownerId: "user-1" })

			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
					onEdit={mockOnEdit}
					currentUserId="user-1"
				/>
			)

			expect(screen.getByText("Edit")).toBeInTheDocument()
			expect(screen.queryByText("Delete")).not.toBeInTheDocument()
		})

		it("shows only Delete action when onEdit is not provided", () => {
			const expense = createMockExpense({ ownerId: "user-1" })

			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
					onDelete={mockOnDelete}
					currentUserId="user-1"
				/>
			)

			expect(screen.getByText("Delete")).toBeInTheDocument()
			expect(screen.queryByText("Edit")).not.toBeInTheDocument()
		})

		it("shows both Edit and Delete actions when both handlers are provided", () => {
			const expense = createMockExpense({ ownerId: "user-1" })

			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
					onDelete={mockOnDelete}
					onEdit={mockOnEdit}
					currentUserId="user-1"
				/>
			)

			expect(screen.getByText("Edit")).toBeInTheDocument()
			expect(screen.getByText("Delete")).toBeInTheDocument()
		})
	})

	describe("Responsive display", () => {
		it("renders formatted dates for desktop view", () => {
			const expense = createMockExpense({
				formattedDate: "03/15/2026",
				mobileFormattedDate: "03/15"
			})

			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
				/>
			)

			// Desktop format should be in the document
			expect(screen.getByText("03/15/2026")).toBeInTheDocument()
		})

		it("renders formatted due dates for desktop view", () => {
			const expense = createMockExpense({
				formattedDueDate: "04/01/2026",
				mobileFormattedDueDate: "04/01"
			})

			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
				/>
			)

			// Desktop format should be in the document
			expect(screen.getByText("04/01/2026")).toBeInTheDocument()
		})
	})

	describe("Edge cases", () => {
		it("handles empty expenses array", () => {
			const { container } = render(
				<ExpenseTable
					expenses={[]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
				/>
			)

			const tbody = container.querySelector("tbody")
			expect(tbody?.children.length).toBe(0)
		})

		it("truncates long descriptions with title attribute", () => {
			const longDescription = "A".repeat(100)
			const expense = createMockExpense({ description: longDescription })

			const { container } = render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
				/>
			)

			const descriptionCell = container.querySelector(
				'td[title="' + longDescription + '"]'
			)
			expect(descriptionCell).toBeInTheDocument()
		})

		it("truncates long payment types with title attribute", () => {
			const longPaymentType = "Very Long Payment Type Name"
			const expense = createMockExpense({ paymentType: longPaymentType })

			const { container } = render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
				/>
			)

			const paymentCell = container.querySelector(
				'td[title="' + longPaymentType + '"]'
			)
			expect(paymentCell).toBeInTheDocument()
		})

		it("handles expense with all optional fields missing", () => {
			const expense = createMockExpense({
				bank: undefined,
				store: undefined,
				dueDate: undefined,
				formattedDueDate: undefined,
				mobileFormattedDueDate: undefined
			})

			render(
				<ExpenseTable
					expenses={[expense]}
					onSort={mockOnSort}
					getSortIndicator={mockGetSortIndicator}
				/>
			)

			// Should render without errors
			expect(screen.getByText("Groceries")).toBeInTheDocument()
		})
	})
})