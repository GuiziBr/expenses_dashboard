// @vitest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { translations } from "@/constants/translations"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import type { FormattedPaymentType } from "@/types/expenses"
import { PaymentTypeTable } from "./PaymentTypeTable"

vi.mock("@/lib/api", () => ({ api: { patch: vi.fn(), delete: vi.fn() } }))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const paymentTypes: FormattedPaymentType[] = [
	{
		id: "pt-1",
		description: "Credit card",
		hasStatement: true,
		createdAt: "2026-01-10T12:00:00.000Z",
		updatedAt: null,
		formattedCreatedAt: "10/01/2026",
		formattedUpdatedAt: "11/01/2026"
	},
	{
		id: "pt-2",
		description: "Cash",
		hasStatement: false,
		createdAt: "2026-02-10T12:00:00.000Z",
		updatedAt: null,
		formattedCreatedAt: "10/02/2026",
		formattedUpdatedAt: "11/02/2026"
	}
]

function setup(rows = paymentTypes) {
	const { wrapper } = createQueryWrapper()
	render(<PaymentTypeTable paymentTypes={rows} />, { wrapper })
	return userEvent.setup()
}

async function openRowMenu(
	user: ReturnType<typeof userEvent.setup>,
	rowName: string,
	action: string
) {
	const row = screen.getByRole("row", { name: new RegExp(rowName) })
	await user.click(within(row).getByRole("button"))
	await user.click(await screen.findByRole("menuitem", { name: action }))
}

describe("PaymentTypeTable", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("renders the column headers", () => {
		setup()

		for (const name of [
			translations.management.paymentTypeColumn,
			translations.management.hasStatementColumn,
			translations.management.createdColumn,
			translations.management.updatedColumn
		]) {
			expect(screen.getByRole("columnheader", { name })).toBeInTheDocument()
		}
	})

	it("renders a row per payment type with its dates", () => {
		setup()

		expect(screen.getByRole("cell", { name: "Credit card" })).toBeVisible()
		expect(screen.getByRole("cell", { name: "Cash" })).toBeVisible()
		expect(screen.getByText("10/01/2026")).toBeVisible()
		expect(screen.getByText("11/02/2026")).toBeInTheDocument()
	})

	it("shows a check when the payment type has a statement and a dash otherwise", () => {
		setup()

		const withStatement = within(
			screen.getByRole("row", { name: /Credit card/ })
		).getAllByRole("cell")[1]
		const without = within(
			screen.getByRole("row", { name: /Cash/ })
		).getAllByRole("cell")[1]

		expect(withStatement.querySelector("svg")).toBeInTheDocument()
		expect(withStatement).not.toHaveTextContent("—")
		expect(without.querySelector("svg")).not.toBeInTheDocument()
		expect(without).toHaveTextContent("—")
	})

	it("renders only the header when there are no payment types", () => {
		setup([])

		expect(screen.getAllByRole("row")).toHaveLength(1)
	})

	it("opens the edit modal pre-filled with the row values", async () => {
		const user = setup()

		await openRowMenu(user, "Credit card", translations.management.edit)
		const dialog = await screen.findByRole("dialog", {
			name: translations.management.editPaymentTypeTitle
		})

		expect(
			within(dialog).getByPlaceholderText(
				translations.management.paymentTypePlaceholder
			)
		).toHaveValue("Credit card")
		expect(
			within(dialog).getByLabelText(translations.management.hasStatementLabel)
		).toBeChecked()
	})

	it("edits a payment type and closes the modal on success", async () => {
		vi.mocked(api.patch).mockResolvedValue({})
		const user = setup()

		await openRowMenu(user, "Cash", translations.management.edit)
		const dialog = await screen.findByRole("dialog")
		const input = within(dialog).getByPlaceholderText(
			translations.management.paymentTypePlaceholder
		)
		await user.clear(input)
		await user.type(input, "Pix")
		await user.click(
			within(dialog).getByLabelText(translations.management.hasStatementLabel)
		)
		await user.click(
			within(dialog).getByRole("button", {
				name: translations.createExpense.save
			})
		)

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				translations.management.paymentTypeUpdateSuccess
			)
		)
		expect(api.patch).toHaveBeenCalledWith("paymentType/pt-2", {
			description: "Pix",
			hasStatement: true
		})
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		)
	})

	it("shows the update error and keeps the modal open on failure", async () => {
		vi.mocked(api.patch).mockRejectedValue(new Error("Name taken"))
		const user = setup()

		await openRowMenu(user, "Cash", translations.management.edit)
		const dialog = await screen.findByRole("dialog")
		await user.type(
			within(dialog).getByPlaceholderText(
				translations.management.paymentTypePlaceholder
			),
			"x"
		)
		await user.click(
			within(dialog).getByRole("button", {
				name: translations.createExpense.save
			})
		)

		await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Name taken"))
		expect(toast.success).not.toHaveBeenCalled()
		expect(screen.getByRole("dialog")).toBeVisible()
	})

	it("falls back to the default message when the update error has none", async () => {
		vi.mocked(api.patch).mockRejectedValue(new Error(""))
		const user = setup()

		await openRowMenu(user, "Cash", translations.management.edit)
		const dialog = await screen.findByRole("dialog")
		await user.type(
			within(dialog).getByPlaceholderText(
				translations.management.paymentTypePlaceholder
			),
			"x"
		)
		await user.click(
			within(dialog).getByRole("button", {
				name: translations.createExpense.save
			})
		)

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				translations.management.paymentTypeUpdateError
			)
		)
	})

	it("closes the edit modal without saving when cancelled", async () => {
		const user = setup()

		await openRowMenu(user, "Cash", translations.management.edit)
		await user.click(await screen.findByRole("button", { name: "Cancel" }))

		expect(api.patch).not.toHaveBeenCalled()
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		)
	})

	it("asks for confirmation and deletes a payment type", async () => {
		vi.mocked(api.delete).mockResolvedValue({})
		const user = setup()

		await openRowMenu(user, "Cash", translations.management.delete)
		const dialog = await screen.findByRole("dialog", {
			name: translations.management.confirmDeletePaymentTypeTitle
		})
		expect(within(dialog).getByText(/Cash/)).toBeVisible()

		await user.click(
			within(dialog).getByRole("button", {
				name: translations.management.delete
			})
		)

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				translations.management.paymentTypeDeleteSuccess
			)
		)
		expect(api.delete).toHaveBeenCalledWith("paymentType/pt-2")
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		)
	})

	it("does not delete when the confirmation is cancelled", async () => {
		const user = setup()

		await openRowMenu(user, "Credit card", translations.management.delete)
		await user.click(await screen.findByRole("button", { name: "Cancel" }))

		expect(api.delete).not.toHaveBeenCalled()
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		)
	})

	it("shows the delete error and keeps the dialog open on failure", async () => {
		vi.mocked(api.delete).mockRejectedValue(new Error("In use"))
		const user = setup()

		await openRowMenu(user, "Credit card", translations.management.delete)
		await user.click(
			await screen.findByRole("button", {
				name: translations.management.delete
			})
		)

		await waitFor(() => expect(toast.error).toHaveBeenCalledWith("In use"))
		expect(screen.getByRole("dialog")).toBeVisible()
	})

	it("falls back to the default message when the delete error has none", async () => {
		vi.mocked(api.delete).mockRejectedValue(new Error(""))
		const user = setup()

		await openRowMenu(user, "Credit card", translations.management.delete)
		await user.click(
			await screen.findByRole("button", {
				name: translations.management.delete
			})
		)

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				translations.management.paymentTypeDeleteError
			)
		)
	})
})
