// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { SelectMenu } from "./select-menu"

const options = [
	{ id: "categories", description: "Category" },
	{ id: "banks", description: "Bank" },
	{ id: "stores", name: "Store" }
]

beforeAll(() => {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	Element.prototype.hasPointerCapture = () => false
	Element.prototype.setPointerCapture = () => {}
	Element.prototype.releasePointerCapture = () => {}
	Element.prototype.scrollIntoView = () => {}
})

const setup = (value = "", extra: Partial<Parameters<typeof SelectMenu>[0]> = {}) => {
	const onValueChange = vi.fn()
	render(
		<SelectMenu
			options={options}
			value={value}
			onValueChange={onValueChange}
			placeholder="Filter by"
			{...extra}
		/>
	)
	return { onValueChange, user: userEvent.setup() }
}

describe("SelectMenu", () => {
	it("shows the placeholder when nothing is selected", () => {
		setup()

		expect(screen.getByRole("combobox")).toHaveTextContent("Filter by")
	})

	it("shows the label of the selected option", () => {
		setup("banks")

		expect(screen.getByRole("combobox")).toHaveTextContent("Bank")
	})

	it("opens a list of options and reports the chosen value", async () => {
		const { user, onValueChange } = setup()

		await user.click(screen.getByRole("combobox"))
		expect(await screen.findByRole("option", { name: "Category" })).toBeInTheDocument()
		expect(screen.getAllByRole("option")).toHaveLength(3)

		await user.click(screen.getByRole("option", { name: "Bank" }))

		expect(onValueChange).toHaveBeenCalledWith("banks")
	})

	it("uses the name when an option has no description", async () => {
		const { user } = setup()

		await user.click(screen.getByRole("combobox"))

		expect(await screen.findByRole("option", { name: "Store" })).toBeInTheDocument()
	})

	it("does not open while disabled", async () => {
		const { user } = setup("", { disabled: true })

		await user.click(screen.getByRole("combobox"))

		expect(screen.queryByRole("option")).not.toBeInTheDocument()
	})

	it("marks an error", () => {
		setup("", { error: "Required" })

		expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true")
	})
})
