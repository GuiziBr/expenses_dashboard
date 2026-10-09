// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"
import type { FormattedExpense } from "@/types/expenses"
import { ExpenseTable } from "./ExpenseTable"

const expense = (overrides: Partial<FormattedExpense> = {}): FormattedExpense =>
	({
		id: "1",
		ownerId: "me",
		description: "Netflix Subscription",
		category: "Entertainment",
		amount: 1599,
		formattedAmount: "- $15.99",
		type: "outcome",
		paymentType: "Credit",
		formattedDueDate: "01/15/2026",
		mobileFormattedDueDate: "01/15",
		formattedDate: "01/10/2026",
		mobileFormattedDate: "01/10",
		bank: "RBC",
		store: "Netflix",
		...overrides
	}) as FormattedExpense

beforeAll(() => {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

const setup = (
	props: Partial<React.ComponentProps<typeof ExpenseTable>> = {}
) => {
	const onSort = vi.fn()
	render(
		<ExpenseTable
			expenses={[
				expense(),
				expense({
					id: "2",
					ownerId: "other",
					description: "Freelance Payment",
					type: "income",
					formattedAmount: "$1,200.00"
				})
			]}
			onSort={onSort}
			getSortIndicator={() => ""}
			{...props}
		/>
	)
	return { onSort }
}

describe("ExpenseTable", () => {
	it("renders a row per expense with its amount", () => {
		setup()

		expect(screen.getByText("Netflix Subscription")).toBeInTheDocument()
		expect(screen.getByText("Freelance Payment")).toBeInTheDocument()
		expect(screen.getByText("- $15.99")).toHaveClass("text-danger")
		expect(screen.getByText("$1,200.00")).toHaveClass("text-success")
	})

	it("sorts from a keyboard-reachable header button", async () => {
		const user = userEvent.setup()
		const { onSort } = setup()

		await user.click(screen.getByRole("button", { name: /^Amount/ }))

		expect(onSort).toHaveBeenCalledWith("amount")
	})

	it("exposes the sort direction with aria-sort", () => {
		setup({
			getSortIndicator: (column) => (column === "amount" ? "↓" : "")
		})

		expect(
			screen.getByRole("columnheader", { name: /^Amount/ })
		).toHaveAttribute("aria-sort", "descending")
		expect(
			screen.getByRole("columnheader", { name: /^Category/ })
		).toHaveAttribute("aria-sort", "none")
	})

	it("shows the actions menu only on the current user's expenses", () => {
		setup({ onEdit: vi.fn(), onDelete: vi.fn(), currentUserId: "me" })

		const rows = screen.getAllByRole("row").slice(1)
		expect(
			within(rows[0]).getByRole("button", { name: "Expense actions" })
		).toBeInTheDocument()
		expect(
			within(rows[1]).queryByRole("button", { name: "Expense actions" })
		).not.toBeInTheDocument()
	})

	it("has no actions column without handlers", () => {
		setup()

		expect(
			screen.queryByRole("button", { name: "Expense actions" })
		).not.toBeInTheDocument()
	})
})
