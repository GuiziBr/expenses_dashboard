// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildBreakdownView } from "@/lib/balance-breakdown"
import type { BreakdownItem } from "@/types/balance-breakdown"
import { BreakdownContent } from "./BreakdownContent"

const month = { year: 2026, month: 9 }

// Totals sum to 100_00 cents. Ranks 1–5 own slices (14% each), ranks 6+ in Other.
const TOTALS = [
	1400, 1400, 1400, 1400, 1400, 500, 500, 400, 400, 300, 300, 200, 200, 200
]

const items: BreakdownItem[] = TOTALS.map((total, index) => ({
	id: `id-${index + 1}`,
	label: `Item ${index + 1}`,
	total
}))

function setup() {
	return render(
		<BreakdownContent
			view={buildBreakdownView(items)}
			groupBy="categories"
			month={month}
			isLoading={false}
		/>
	)
}

const slices = () =>
	Array.from(
		screen.getByTestId("donut").querySelectorAll("path")
	) as SVGPathElement[]

// Row buttons are named "{name}, {share}, {amount}"
const row = (name: string) =>
	screen.getByRole("button", { name: new RegExp(`^${name},`) })

describe("BreakdownContent – selecting", () => {
	it("starts with the total in the centre and nothing pressed", () => {
		setup()
		expect(screen.getByText("Total spent")).toBeInTheDocument()
		expect(row("Item 1")).toHaveAttribute("aria-pressed", "false")
		expect(screen.getByText("Tap a slice to see its value")).toBeInTheDocument()
	})

	it("selects a slice: centre shows name, amount, share and rank (AC-07)", () => {
		setup()
		fireEvent.click(slices()[1])
		// once in the legend row, once in the centre label
		expect(screen.getAllByText("Item 2")).toHaveLength(2)
		expect(screen.getByText("14.0% of the month · #2")).toBeInTheDocument()
		expect(screen.queryByText("Total spent")).not.toBeInTheDocument()
	})

	it("fades the other slices and highlights the selected row (FR-41, FR-43)", () => {
		setup()
		fireEvent.click(slices()[1])
		expect(slices()[1]).not.toHaveClass("opacity-30")
		expect(slices()[0]).toHaveClass("opacity-30")
		expect(row("Item 2")).toHaveAttribute("aria-pressed", "true")
		expect(row("Item 2")).toHaveClass("ring-2")
		expect(row("Item 3")).toHaveClass("opacity-[0.55]")
	})

	it("grows the selected slice outward", () => {
		setup()
		const before = slices()[1].getAttribute("d")
		fireEvent.click(slices()[1])
		expect(slices()[1].getAttribute("d")).not.toBe(before)
		expect(slices()[1].getAttribute("d")).toContain("A 148 148")
	})

	it("selects from a legend row too", () => {
		setup()
		fireEvent.click(row("Item 3"))
		expect(screen.getByText("14.0% of the month · #3")).toBeInTheDocument()
		expect(slices()[0]).toHaveClass("opacity-30")
	})

	it("only allows one selection at a time", () => {
		setup()
		fireEvent.click(row("Item 1"))
		fireEvent.click(row("Item 2"))
		expect(row("Item 1")).toHaveAttribute("aria-pressed", "false")
		expect(row("Item 2")).toHaveAttribute("aria-pressed", "true")
	})

	it("changes the hint while something is selected (FR-44)", () => {
		setup()
		fireEvent.click(slices()[0])
		expect(
			screen.getByText("Tap the slice again or tap outside to show the total")
		).toBeInTheDocument()
	})
})

describe("BreakdownContent – Other group", () => {
	it("selects Other from a row inside the group and highlights them all (AC-08)", () => {
		setup()
		fireEvent.click(row("Item 6"))
		expect(screen.getByText("Other")).toBeInTheDocument()
		expect(screen.getByText("30.0% of the month")).toBeInTheDocument()
		const inGroup = ["Item 6", "Item 7", "Item 8"].map((name) => row(name))
		for (const button of inGroup) {
			expect(button).toHaveAttribute("aria-pressed", "true")
		}
		expect(row("Item 1")).toHaveAttribute("aria-pressed", "false")
	})

	it("selects Other from the OTHER subheader", () => {
		setup()
		fireEvent.click(screen.getByRole("button", { name: /^OTHER/ }))
		expect(screen.getByText("30.0% of the month")).toBeInTheDocument()
		expect(slices().at(-1)).not.toHaveClass("opacity-30")
	})

	it("selects Other from the Other slice", () => {
		setup()
		fireEvent.click(slices().at(-1) as SVGPathElement)
		expect(screen.getByText("$30.00")).toBeInTheDocument()
	})
})

describe("BreakdownContent – clearing (FR-44)", () => {
	it("clears when the selected slice is pressed again (AC-07)", () => {
		setup()
		fireEvent.click(slices()[1])
		fireEvent.click(slices()[1])
		expect(screen.getByText("Total spent")).toBeInTheDocument()
	})

	it("clears when the selected row is pressed again", () => {
		setup()
		fireEvent.click(row("Item 1"))
		fireEvent.click(row("Item 1"))
		expect(screen.getByText("Total spent")).toBeInTheDocument()
		expect(row("Item 3")).not.toHaveClass("opacity-[0.55]")
	})

	it("clears on Escape", () => {
		setup()
		fireEvent.click(slices()[0])
		fireEvent.keyDown(document, { key: "Escape" })
		expect(screen.getByText("Total spent")).toBeInTheDocument()
	})

	it("clears when pressing outside the chart and legend", () => {
		setup()
		fireEvent.click(slices()[0])
		fireEvent.pointerDown(document.body)
		expect(screen.getByText("Total spent")).toBeInTheDocument()
	})

	it("keeps the selection when pressing inside the legend", () => {
		setup()
		fireEvent.click(slices()[0])
		fireEvent.pointerDown(row("Item 2"))
		expect(screen.queryByText("Total spent")).not.toBeInTheDocument()
	})

	it("keeps the legend's Show all button working with a selection", () => {
		setup()
		fireEvent.click(slices()[0])
		const legend = screen.getByRole("button", { name: /show all 14/i })
		fireEvent.click(legend)
		expect(
			within(document.body).getByRole("button", { name: "Show less" })
		).toBeInTheDocument()
	})
})

describe("BreakdownContent – hover preview (FR-45)", () => {
	it("previews a slice in the centre on mouse hover without selecting it", () => {
		setup()
		fireEvent.pointerEnter(slices()[2], { pointerType: "mouse" })
		expect(screen.getByText("14.0% of the month · #3")).toBeInTheDocument()
		expect(row("Item 3")).toHaveAttribute("aria-pressed", "false")

		fireEvent.pointerLeave(slices()[2], { pointerType: "mouse" })
		expect(screen.getByText("Total spent")).toBeInTheDocument()
	})

	it("keeps the centre locked on the selection while hovering another slice", () => {
		setup()
		fireEvent.click(slices()[1])
		fireEvent.pointerEnter(slices()[2], { pointerType: "mouse" })
		expect(screen.getByText("14.0% of the month · #2")).toBeInTheDocument()
		expect(
			screen.queryByText("14.0% of the month · #3")
		).not.toBeInTheDocument()

		fireEvent.pointerLeave(slices()[2], { pointerType: "mouse" })
		expect(screen.getByText("14.0% of the month · #2")).toBeInTheDocument()
	})

	it("previews again once the selection is cleared", () => {
		setup()
		fireEvent.click(slices()[1])
		fireEvent.keyDown(document, { key: "Escape" })
		fireEvent.pointerEnter(slices()[2], { pointerType: "mouse" })
		expect(screen.getByText("14.0% of the month · #3")).toBeInTheDocument()
	})

	it("ignores touch hover", () => {
		setup()
		fireEvent.pointerEnter(slices()[2], { pointerType: "touch" })
		expect(screen.getByText("Total spent")).toBeInTheDocument()
	})
})
