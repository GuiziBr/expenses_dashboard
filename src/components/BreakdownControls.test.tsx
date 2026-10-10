// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { BalanceFilterKey } from "@/types/expenses"
import { BREAKDOWN_PANEL_ID, BreakdownControls } from "./BreakdownControls"

function setup(groupBy: BalanceFilterKey = "categories") {
	const handlers = {
		onGroupByChange: vi.fn()
	}
	render(<BreakdownControls groupBy={groupBy} {...handlers} />)
	return handlers
}

const tab = (name: RegExp) => screen.getByRole("tab", { name })

describe("BreakdownControls – tabs (A11Y-01)", () => {
	it("renders a tablist with four tabs and one selected", () => {
		setup("banks")
		expect(screen.getByRole("tablist")).toBeInTheDocument()
		const tabs = screen.getAllByRole("tab")
		expect(tabs).toHaveLength(4)
		expect(
			tabs.filter((t) => t.getAttribute("aria-selected") === "true")
		).toHaveLength(1)
		expect(tab(/^Bank$/)).toHaveAttribute("aria-selected", "true")
	})

	it("points every tab at the tabpanel", () => {
		setup()
		for (const t of screen.getAllByRole("tab")) {
			expect(t).toHaveAttribute("aria-controls", BREAKDOWN_PANEL_ID)
		}
	})

	it("only the selected tab is in the tab order", () => {
		setup("paymentType")
		const tabs = screen.getAllByRole("tab")
		expect(tabs.map((t) => t.getAttribute("tabindex"))).toEqual([
			"-1",
			"0",
			"-1",
			"-1"
		])
	})

	it("ArrowRight moves to the next tab and activates it", () => {
		const { onGroupByChange } = setup("categories")
		fireEvent.keyDown(tab(/Category/), { key: "ArrowRight" })
		expect(onGroupByChange).toHaveBeenCalledWith("paymentType")
		expect(tab(/Payment/)).toHaveFocus()
	})

	it("ArrowLeft moves to the previous tab", () => {
		const { onGroupByChange } = setup("banks")
		fireEvent.keyDown(tab(/^Bank$/), { key: "ArrowLeft" })
		expect(onGroupByChange).toHaveBeenCalledWith("paymentType")
	})

	it("wraps around at both ends", () => {
		const first = setup("categories")
		fireEvent.keyDown(tab(/Category/), { key: "ArrowLeft" })
		expect(first.onGroupByChange).toHaveBeenCalledWith("stores")
	})

	it("wraps from the last tab to the first", () => {
		const { onGroupByChange } = setup("stores")
		fireEvent.keyDown(tab(/Store/), { key: "ArrowRight" })
		expect(onGroupByChange).toHaveBeenCalledWith("categories")
	})

	it("Home and End jump to the first and last tab", () => {
		const { onGroupByChange } = setup("banks")
		fireEvent.keyDown(tab(/^Bank$/), { key: "Home" })
		expect(onGroupByChange).toHaveBeenLastCalledWith("categories")
		fireEvent.keyDown(tab(/^Bank$/), { key: "End" })
		expect(onGroupByChange).toHaveBeenLastCalledWith("stores")
	})

	it("ignores other keys", () => {
		const { onGroupByChange } = setup()
		fireEvent.keyDown(tab(/Category/), { key: "a" })
		expect(onGroupByChange).not.toHaveBeenCalled()
	})
})
