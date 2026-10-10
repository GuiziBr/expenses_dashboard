// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { Wallet } from "lucide-react"
import { describe, expect, it } from "vitest"
import { BalanceCard } from "./BalanceCard"

describe("BalanceCard", () => {
	it("shows the label and the value", () => {
		render(<BalanceCard label="Incomes" value="$1,200.00" icon={Wallet} />)

		expect(screen.getByText("Incomes")).toBeInTheDocument()
		expect(screen.getByText("$1,200.00")).toBeInTheDocument()
	})

	it("hides the decorative icon from assistive technology", () => {
		const { container } = render(
			<BalanceCard label="Incomes" value="$1" icon={Wallet} />
		)

		expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument()
	})

	it("tints the icon chip by tone", () => {
		const { container, rerender } = render(
			<BalanceCard label="Incomes" value="$1" icon={Wallet} tone="income" />
		)
		const chip = () => container.querySelector("[aria-hidden='true']")

		expect(chip()).toHaveClass("bg-success-soft")

		rerender(
			<BalanceCard label="Outcomes" value="$1" icon={Wallet} tone="outcome" />
		)
		expect(chip()).toHaveClass("bg-danger-soft")
	})

	it("fills the card with the primary colour for the total variant", () => {
		const { container } = render(
			<BalanceCard label="Balance" value="$1" icon={Wallet} variant="total" />
		)

		expect(container.firstChild).toHaveClass("bg-primary")
	})
})
