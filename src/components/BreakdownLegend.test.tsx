// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildBreakdownView } from "@/lib/balance-breakdown"
import type { BreakdownItem } from "@/types/balance-breakdown"
import type { BalanceFilterKey } from "@/types/expenses"
import { BreakdownLegend } from "./BreakdownLegend"

const toItems = (totals: number[]): BreakdownItem[] =>
	totals.map((total, index) => ({
		id: `id-${index + 1}`,
		label: `Item ${index + 1}`,
		total
	}))

function renderLegend(
	items: BreakdownItem[],
	groupBy: BalanceFilterKey = "categories"
) {
	return render(
		<BreakdownLegend view={buildBreakdownView(items)} groupBy={groupBy} />
	)
}

// 14 items, 5 own slices ≥ 4% and 9 in Other
const FOURTEEN = [14, 14, 14, 14, 14, 5, 5, 4, 4, 3, 3, 2, 2, 2]

describe("BreakdownLegend – rows", () => {
	it("shows every item with its share and amount, in ranked order", () => {
		renderLegend([
			{ id: "1", label: "Groceries", total: 42000 },
			{ id: "2", label: "Restaurants", total: 15000 }
		])
		const rows = screen.getAllByRole("listitem")
		expect(rows[0]).toHaveTextContent("Groceries")
		expect(rows[0]).toHaveTextContent("73.7%")
		expect(rows[0]).toHaveTextContent("$420.00")
		expect(rows[1]).toHaveTextContent("Restaurants")
	})

	it("shows the null bank entry as 'No bank' in italic gray (AC-10)", () => {
		renderLegend(
			[
				{ id: "b1", label: "Chase", total: 3000 },
				{ id: null, label: null, total: 2000 }
			],
			"banks"
		)
		const label = screen.getByText("No bank")
		expect(label).toHaveClass("italic", "text-iron-gray")
		expect(screen.getAllByRole("listitem")[1]).toHaveTextContent("No bank")
	})

	it("colours own-slice dots by rank and the rest light gray", () => {
		const { container } = renderLegend(toItems([20, 20, 20, 15, 15, 10]))
		const colors = Array.from(container.querySelectorAll("li span[style]")).map(
			(dot) => (dot as HTMLElement).style.backgroundColor
		)
		expect(colors).toEqual([
			"var(--orange)",
			"var(--blue-sky)",
			"var(--green)",
			"var(--pink)",
			"var(--light-blue)",
			"var(--light-gray)"
		])
	})
})

describe("BreakdownLegend – Other group", () => {
	it("shows the OTHER subheader with count, share and total (AC-04)", () => {
		renderLegend(toItems(FOURTEEN))
		expect(screen.getByText("OTHER")).toBeInTheDocument()
		expect(screen.getByText("· 9 categories")).toBeInTheDocument()
		expect(screen.getByText("30.0% · $0.30")).toBeInTheDocument()
	})

	it("places the subheader before the first grouped row", () => {
		renderLegend(toItems(FOURTEEN))
		const items = screen.getAllByRole("listitem")
		const withHeader = items.findIndex((item) =>
			item.textContent?.includes("OTHER")
		)
		expect(items[withHeader]).toHaveTextContent("Item 6")
		expect(items[withHeader - 1]).toHaveTextContent("Item 5")
	})

	it("has no OTHER subheader when the 6th item is a single leftover (AC-06)", () => {
		renderLegend(toItems([20, 20, 20, 15, 15, 10]))
		expect(screen.queryByText("OTHER")).not.toBeInTheDocument()
	})
})

describe("BreakdownLegend – Show all (AC-09)", () => {
	it("shows 10 rows and a 'Show all N' button for a long list", () => {
		renderLegend(toItems(FOURTEEN))
		expect(screen.getAllByRole("listitem")).toHaveLength(10)
		expect(
			screen.getByRole("button", { name: "Show all 14 categories" })
		).toBeInTheDocument()
	})

	it("expands in place and toggles to 'Show less'", () => {
		renderLegend(toItems(FOURTEEN))
		fireEvent.click(screen.getByRole("button", { name: /show all 14/i }))
		expect(screen.getAllByRole("listitem")).toHaveLength(14)

		const button = screen.getByRole("button", { name: "Show less" })
		expect(button).toHaveAttribute("aria-expanded", "true")

		fireEvent.click(button)
		expect(screen.getAllByRole("listitem")).toHaveLength(10)
	})

	it("uses the grouping's plural in the button", () => {
		renderLegend(toItems(FOURTEEN), "banks")
		expect(
			screen.getByRole("button", { name: "Show all 14 banks" })
		).toBeInTheDocument()
	})

	it("has no button for exactly 10 items", () => {
		renderLegend(toItems([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]))
		expect(screen.getAllByRole("listitem")).toHaveLength(10)
		expect(
			screen.queryByRole("button", { name: /^show (all|less)/i })
		).not.toBeInTheDocument()
	})

	it("has no button for a single item", () => {
		renderLegend(toItems([500]))
		expect(
			screen.queryByRole("button", { name: /^show (all|less)/i })
		).not.toBeInTheDocument()
	})
})
