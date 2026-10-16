// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { translations } from "@/constants/translations"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import { PaymentTypeForm } from "./PaymentTypeForm"

vi.mock("@/lib/api", () => ({ api: { post: vi.fn() } }))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function setup() {
	const { wrapper } = createQueryWrapper()
	render(<PaymentTypeForm />, { wrapper })
	return {
		user: userEvent.setup(),
		input: screen.getByPlaceholderText(
			translations.management.paymentTypePlaceholder
		),
		checkbox: screen.getByLabelText(translations.management.hasStatementLabel),
		save: screen.getByRole("button", { name: translations.createExpense.save })
	}
}

describe("PaymentTypeForm", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("starts with the statement checkbox unchecked", () => {
		const { checkbox } = setup()

		expect(checkbox).not.toBeChecked()
	})

	it("disables save while the description is empty or blank", async () => {
		const { user, input, save } = setup()

		expect(save).toBeDisabled()

		await user.type(input, "   ")
		expect(save).toBeDisabled()

		await user.type(input, "Credit card")
		expect(save).toBeEnabled()
	})

	it("submits the trimmed description with hasStatement false by default", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { user, input, save } = setup()

		await user.type(input, "  Cash  ")
		await user.click(save)

		await waitFor(() =>
			expect(api.post).toHaveBeenCalledWith("paymentType", {
				description: "Cash",
				hasStatement: false
			})
		)
	})

	it("submits hasStatement true when the checkbox is ticked", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { user, input, checkbox, save } = setup()

		await user.type(input, "Credit card")
		await user.click(checkbox)
		expect(checkbox).toBeChecked()
		await user.click(save)

		await waitFor(() =>
			expect(api.post).toHaveBeenCalledWith("paymentType", {
				description: "Credit card",
				hasStatement: true
			})
		)
	})

	it("notifies and resets the fields on success", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { user, input, checkbox, save } = setup()

		await user.type(input, "Credit card")
		await user.click(checkbox)
		await user.click(save)

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				translations.management.paymentTypeCreateSuccess
			)
		)
		expect(input).toHaveValue("")
		expect(checkbox).not.toBeChecked()
	})

	it("submits with the enter key", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { user, input } = setup()

		await user.type(input, "Pix{Enter}")

		await waitFor(() =>
			expect(api.post).toHaveBeenCalledWith("paymentType", {
				description: "Pix",
				hasStatement: false
			})
		)
	})

	it("shows the API error and keeps the fields when creation fails", async () => {
		vi.mocked(api.post).mockRejectedValue(new Error("Already exists"))
		const { user, input, checkbox, save } = setup()

		await user.type(input, "Credit card")
		await user.click(checkbox)
		await user.click(save)

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith("Already exists")
		)
		expect(toast.success).not.toHaveBeenCalled()
		expect(input).toHaveValue("Credit card")
		expect(checkbox).toBeChecked()
	})

	it("falls back to the default error message when the error has none", async () => {
		vi.mocked(api.post).mockRejectedValue(new Error(""))
		const { user, input, save } = setup()

		await user.type(input, "Cash")
		await user.click(save)

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				translations.management.paymentTypeCreateError
			)
		)
	})

	it("disables save while the request is pending", async () => {
		vi.mocked(api.post).mockReturnValue(new Promise(() => {}))
		const { user, input, save } = setup()

		await user.type(input, "Cash")
		await user.click(save)

		await waitFor(() => expect(screen.getByRole("button")).toBeDisabled())
		expect(api.post).toHaveBeenCalledTimes(1)
	})
})
