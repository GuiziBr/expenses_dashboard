// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Filter } from "lucide-react"
import { describe, expect, it, vi } from "vitest"
import { CheckboxGroup } from "./checkbox-group"

const options = [
	{ id: "1", value: "paid", label: "Paid" },
	{ id: "2", value: "open", label: "Open" }
]

function setup(value: string[] = [], extra = {}) {
	const onChange = vi.fn()
	const utils = render(
		<CheckboxGroup
			options={options}
			value={value}
			onChange={onChange}
			{...extra}
		/>
	)
	return { ...utils, onChange, user: userEvent.setup() }
}

describe("CheckboxGroup", () => {
	it("renders one checkbox per option, reflecting the value", () => {
		setup(["open"])

		expect(screen.getByRole("checkbox", { name: "Paid" })).not.toBeChecked()
		expect(screen.getByRole("checkbox", { name: "Open" })).toBeChecked()
	})

	it("selects only the clicked option", async () => {
		const { user, onChange } = setup()

		await user.click(screen.getByText("Paid"))

		expect(onChange).toHaveBeenCalledWith(["paid"])
	})

	it("replaces the current selection with the new option", async () => {
		const { user, onChange } = setup(["paid"])

		await user.click(screen.getByText("Open"))

		expect(onChange).toHaveBeenCalledWith(["open"])
	})

	it("clears the selection when the checked option is clicked", async () => {
		const { user, onChange } = setup(["paid"])

		await user.click(screen.getByText("Paid"))

		expect(onChange).toHaveBeenCalledWith([])
	})

	it("renders the optional icon and class name", () => {
		const { container } = setup([], { icon: Filter, className: "custom" })

		expect(container.querySelector("svg.size-5")).toBeInTheDocument()
		expect(container.firstElementChild).toHaveClass("custom")
	})

	it("shows a check mark only for selected options", () => {
		const { container } = setup(["paid"])

		expect(container.querySelectorAll("svg path")).toHaveLength(1)
	})
})
