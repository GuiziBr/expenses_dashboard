// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { translations } from "@/constants/translations"
import { PaymentTypeEditModal } from "./PaymentTypeEditModal"

type Props = React.ComponentProps<typeof PaymentTypeEditModal>

const placeholder = translations.management.paymentTypePlaceholder
const statementLabel = translations.management.hasStatementLabel

function setup(props: Partial<Props> = {}) {
	const onClose = vi.fn()
	const onSubmit = vi.fn()
	render(
		<PaymentTypeEditModal
			isOpen
			onClose={onClose}
			onSubmit={onSubmit}
			initialDescription="Credit card"
			initialHasStatement={false}
			{...props}
		/>
	)
	return {
		onClose,
		onSubmit,
		user: userEvent.setup(),
		save: () => screen.getByRole("button", { name: /save/i })
	}
}

describe("PaymentTypeEditModal", () => {
	it("renders nothing when closed", () => {
		setup({ isOpen: false })

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
	})

	it("shows the title and pre-fills the description and checkbox", () => {
		setup({ initialHasStatement: true })

		expect(
			screen.getByRole("dialog", {
				name: translations.management.editPaymentTypeTitle
			})
		).toBeVisible()
		expect(screen.getByPlaceholderText(placeholder)).toHaveValue("Credit card")
		expect(screen.getByLabelText(statementLabel)).toBeChecked()
	})

	it("disables save until something changes", async () => {
		const { user, save } = setup()

		expect(save()).toBeDisabled()

		await user.type(screen.getByPlaceholderText(placeholder), "x")

		expect(save()).toBeEnabled()
	})

	it("enables save when only the checkbox changes", async () => {
		const { user, save } = setup()

		await user.click(screen.getByLabelText(statementLabel))

		expect(save()).toBeEnabled()

		await user.click(screen.getByLabelText(statementLabel))

		expect(save()).toBeDisabled()
	})

	it("disables save when the description is blank", async () => {
		const { user, save } = setup()

		await user.clear(screen.getByPlaceholderText(placeholder))
		expect(save()).toBeDisabled()

		await user.type(screen.getByPlaceholderText(placeholder), "   ")
		expect(save()).toBeDisabled()
	})

	it("submits the trimmed description and the statement flag", async () => {
		const { user, onSubmit, save } = setup()
		const input = screen.getByPlaceholderText(placeholder)

		await user.clear(input)
		await user.type(input, "  Debit card  ")
		await user.click(screen.getByLabelText(statementLabel))
		await user.click(save())

		expect(onSubmit).toHaveBeenCalledWith("Debit card", true)
	})

	it("submits an unticked flag when it was cleared", async () => {
		const { user, onSubmit, save } = setup({ initialHasStatement: true })

		await user.click(screen.getByLabelText(statementLabel))
		await user.click(save())

		expect(onSubmit).toHaveBeenCalledWith("Credit card", false)
	})

	it("does not submit an unchanged form when pressing enter", async () => {
		const { user, onSubmit } = setup()

		await user.type(screen.getByPlaceholderText(placeholder), "{Enter}")

		expect(onSubmit).not.toHaveBeenCalled()
	})

	it("calls onClose when cancelling", async () => {
		const { user, onClose, onSubmit } = setup()

		await user.click(screen.getByRole("button", { name: "Cancel" }))

		expect(onClose).toHaveBeenCalled()
		expect(onSubmit).not.toHaveBeenCalled()
	})

	it("disables the actions and ignores enter while pending", async () => {
		const { user, onSubmit } = setup({ isPending: true })

		expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
		expect(screen.getByRole("button", { name: "" })).toBeDisabled()

		await user.type(screen.getByPlaceholderText(placeholder), "x{Enter}")

		expect(onSubmit).not.toHaveBeenCalled()
	})

	it("resets the fields to the initial values when reopened", async () => {
		const props = {
			onClose: vi.fn(),
			onSubmit: vi.fn(),
			initialDescription: "Credit card",
			initialHasStatement: false
		}
		const user = userEvent.setup()
		const { rerender } = render(<PaymentTypeEditModal isOpen {...props} />)

		await user.type(screen.getByPlaceholderText(placeholder), "123")
		await user.click(screen.getByLabelText(statementLabel))
		rerender(<PaymentTypeEditModal isOpen={false} {...props} />)
		rerender(<PaymentTypeEditModal isOpen {...props} />)

		expect(screen.getByPlaceholderText(placeholder)).toHaveValue("Credit card")
		expect(screen.getByLabelText(statementLabel)).not.toBeChecked()
	})
})
