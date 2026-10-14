// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NewExpenseAction } from "./NewExpenseAction"

vi.mock("@/components/NewExpenseModal", () => ({
	NewExpenseModal: ({ isOpen }: { isOpen: boolean }) =>
		isOpen ? <div role="dialog">Modal</div> : null
}))

const fab = () => {
	const buttons = screen.getAllByRole("button", { name: "Create Expense" })
	return buttons[buttons.length - 1]
}

const drag = (
	el: HTMLElement,
	from: [number, number],
	to: [number, number]
) => {
	// jsdom has no layout: put the button's top-left 28px (half its size) up and left of the grab point
	el.getBoundingClientRect = () =>
		({ left: from[0] - 28, top: from[1] - 28 }) as DOMRect
	el.setPointerCapture = vi.fn()
	el.releasePointerCapture = vi.fn()
	el.hasPointerCapture = () => true
	fireEvent.pointerDown(el, {
		clientX: from[0],
		clientY: from[1],
		pointerId: 1
	})
	fireEvent.pointerMove(el, { clientX: to[0], clientY: to[1], pointerId: 1 })
	fireEvent.pointerUp(el, { clientX: to[0], clientY: to[1], pointerId: 1 })
	fireEvent.click(el)
}

beforeEach(() => {
	localStorage.clear()
	vi.stubGlobal("innerWidth", 400)
	vi.stubGlobal("innerHeight", 800)
})

describe("NewExpenseAction floating button", () => {
	it("opens the modal on a tap", () => {
		render(<NewExpenseAction />)
		fireEvent.click(fab())

		expect(screen.getByRole("dialog")).toBeInTheDocument()
	})

	it("snaps to the nearest edge after a drag and does not open the modal", () => {
		render(<NewExpenseAction />)
		drag(fab(), [350, 700], [60, 300])

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		expect(fab().style.left).toBe("20px")
		expect(fab().style.top).toBe("272px")
		expect(
			JSON.parse(localStorage.getItem("expenses:create-fab-position") ?? "")
		).toEqual({
			side: "left",
			top: 272
		})
	})

	it("keeps the button above the tab bar", () => {
		render(<NewExpenseAction />)
		drag(fab(), [350, 700], [350, 790])

		expect(Number.parseInt(fab().style.top, 10)).toBeLessThanOrEqual(
			800 - 56 - 100
		)
	})

	it("restores the saved position", () => {
		localStorage.setItem(
			"expenses:create-fab-position",
			JSON.stringify({ side: "right", top: 200 })
		)
		render(<NewExpenseAction />)

		expect(fab().style.left).toBe("324px")
		expect(fab().style.top).toBe("200px")
	})
})
