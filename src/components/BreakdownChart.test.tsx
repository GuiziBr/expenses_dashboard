// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildBreakdownView } from "@/lib/balance-breakdown"
import type { BreakdownItem } from "@/types/balance-breakdown"
import type { BalanceFilterKey } from "@/types/expenses"
import { BreakdownChart } from "./BreakdownChart"

const month = { year: 2026, month: 9 }

const toItems = (totals: number[]): BreakdownItem[] =>
	totals.map((total, index) => ({
		id: `id-${index + 1}`,
		label: `Item ${index + 1}`,
		total
	}))

function renderChart(
	totals: number[],
	groupBy: BalanceFilterKey = "categories",
	isLoading = false
) {
	return render(
		<BreakdownChart
			view={buildBreakdownView(toItems(totals))}
			groupBy={groupBy}
			month={month}
			isLoading={isLoading}
		/>
	)
}

const slicePaths = (container: HTMLElement) =>
	Array.from(container.querySelectorAll('[data-testid="donut"] path'))

describe("BreakdownChart", () => {
	it.each([
		["categories", "Share of month by category"],
		["paymentType", "Share of month by payment type"],
		["banks", "Share of month by bank"],
		["stores", "Share of month by store"]
	] as const)("titles the card for %s", (groupBy, title) => {
		renderChart([60, 40], groupBy)
		expect(screen.getByRole("heading", { name: title })).toBeInTheDocument()
	})

	it("shows the month total and month name in the centre (FR-32)", () => {
		renderChart([42000, 26800])
		expect(screen.getByText("Total spent")).toBeInTheDocument()
		expect(screen.getByText("$688.00")).toBeInTheDocument()
		expect(screen.getByText("September 2026")).toBeInTheDocument()
	})

	it("hides the decorative donut from screen readers", () => {
		renderChart([60, 40])
		expect(screen.getByTestId("donut")).toHaveAttribute("aria-hidden", "true")
	})

	it("lets clicks and hovers through the centre label to the slices", () => {
		// The label overlay covers the whole donut; without pointer-events-none it
		// swallows every click meant for a slice (jsdom cannot hit-test, so assert the class)
		renderChart([60, 40])
		expect(
			screen.getByText("Total spent").closest(".pointer-events-none")
		).not.toBeNull()
	})

	it("draws one slice per own item plus one for Other", () => {
		// 14 items: 5 own slices + Other
		const { container } = renderChart([
			14, 14, 14, 14, 14, 5, 5, 4, 4, 3, 3, 2, 2, 2
		])
		expect(slicePaths(container)).toHaveLength(6)
	})

	it("colours slices by rank and Other light gray", () => {
		const { container } = renderChart([
			14, 14, 14, 14, 14, 5, 5, 4, 4, 3, 3, 2, 2, 2
		])
		expect(
			slicePaths(container).map((path) => path.getAttribute("fill"))
		).toEqual([
			"var(--orange)",
			"var(--blue-sky)",
			"var(--green)",
			"var(--pink)",
			"var(--light-blue)",
			"var(--light-gray)"
		])
	})

	it("draws a single item as one full orange ring", () => {
		const { container } = renderChart([1234])
		const paths = slicePaths(container)
		expect(paths).toHaveLength(1)
		expect(paths[0]).toHaveAttribute("fill", "var(--orange)")
	})
})

describe("BreakdownChart – insight (BR-18)", () => {
	it("shows the top-3 share with 4 or more items", () => {
		renderChart([40, 30, 20, 10])
		expect(
			screen.getByText("Top 3 categories account for 90.0% of the month")
		).toBeInTheDocument()
	})

	it("hides the insight with fewer than 4 items", () => {
		renderChart([50, 30, 20])
		expect(screen.queryByText(/account for/)).not.toBeInTheDocument()
	})

	it("always renders the mobile tap hint", () => {
		renderChart([50, 30, 20])
		expect(screen.getByText("Tap a slice to see its value")).toBeInTheDocument()
	})
})

describe("BreakdownChart – loading", () => {
	it("shows a gray placeholder ring and no values", () => {
		const { container } = renderChart([60, 40], "categories", true)
		const paths = slicePaths(container)
		expect(paths).toHaveLength(1)
		expect(paths[0]).toHaveAttribute("fill", "var(--muted)")
		expect(screen.queryByText("Total spent")).not.toBeInTheDocument()
	})
})
