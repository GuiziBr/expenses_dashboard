// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildBreakdownView } from "@/lib/balance-breakdown"
import type { BreakdownItem } from "@/types/balance-breakdown"
import type { BalanceFilterKey } from "@/types/expenses"
import { BreakdownEmpty } from "./BreakdownStates"
import { BreakdownSummary } from "./BreakdownSummary"

const month = { year: 2026, month: 9 }

const items: BreakdownItem[] = [
	{ id: "1", label: "Groceries", total: 42000 },
	{ id: "2", label: "Restaurants", total: 16800 },
	{ id: "3", label: "Transport", total: 10000 }
]

function renderSummary(
	groupBy: BalanceFilterKey,
	data: BreakdownItem[],
	flags: { isLoading?: boolean; hasError?: boolean } = {}
) {
	return render(
		<BreakdownSummary
			groupBy={groupBy}
			month={month}
			view={buildBreakdownView(data)}
			isLoading={flags.isLoading ?? false}
			hasError={flags.hasError ?? false}
		/>
	)
}

describe("BreakdownSummary", () => {
	it("shows the top item, item count and month total", () => {
		renderSummary("categories", items)
		expect(screen.getByText("Top category")).toBeInTheDocument()
		expect(screen.getByText("Groceries")).toBeInTheDocument()
		expect(screen.getByText("3")).toBeInTheDocument()
		expect(screen.getByText("$688.00")).toBeInTheDocument()
		expect(
			screen.getByText("September 2026 · personal expenses")
		).toBeInTheDocument()
	})

	it.each([
		["categories", "Top category", "Categories"],
		["paymentType", "Top payment type", "Payment types"],
		["banks", "Top bank", "Banks"],
		["stores", "Top store", "Stores"]
	] as const)("labels the cards for %s", (groupBy, top, count) => {
		renderSummary(groupBy, items)
		expect(screen.getByText(top)).toBeInTheDocument()
		expect(screen.getByText(count)).toBeInTheDocument()
	})

	it("shows the null bank entry as 'No bank' when it is the top item", () => {
		renderSummary("banks", [{ id: null, label: null, total: 500 }])
		const label = screen.getByText("No bank")
		expect(label).toHaveClass("italic")
	})

	it("shows dashes and a zero total when the month is empty", () => {
		renderSummary("categories", [])
		expect(screen.getAllByText("—")).toHaveLength(2)
		expect(screen.getByText("$0.00")).toBeInTheDocument()
	})

	it("shows dashes in every card on error", () => {
		renderSummary("categories", [], { hasError: true })
		expect(screen.getAllByText("—")).toHaveLength(3)
	})

	it("keeps the subtitles that do not depend on the data while loading", () => {
		renderSummary("categories", [], { isLoading: true })
		expect(screen.getByText("with expenses this month")).toBeInTheDocument()
		expect(
			screen.getByText("September 2026 · personal expenses")
		).toBeInTheDocument()
		// labels are known too
		expect(screen.getByText("Top category")).toBeInTheDocument()
		expect(screen.getByText("Categories")).toBeInTheDocument()
	})

	it("uses one decorative bar per unknown value and one for the top subtitle", () => {
		const { container } = renderSummary("categories", [], { isLoading: true })
		const bars = container.querySelectorAll(".animate-pulse")
		// Top (value + sub), Count (value), Total (value)
		expect(bars).toHaveLength(4)
		for (const bar of bars) expect(bar).toHaveAttribute("aria-hidden", "true")
	})

	it("tints the bars to the card they sit on", () => {
		const { container } = renderSummary("categories", [], { isLoading: true })
		const bars = Array.from(container.querySelectorAll(".animate-pulse"))
		expect(
			bars.slice(0, 3).every((b) => b.classList.contains("bg-blue-wood/15"))
		).toBe(true)
		expect(bars[3]).toHaveClass("bg-white/30") // the orange Total spent card
	})

	it("marks the cards as busy only while loading", () => {
		const { container, rerender } = renderSummary("categories", [], {
			isLoading: true
		})
		expect(container.querySelector("section")).toHaveAttribute(
			"aria-busy",
			"true"
		)
		rerender(
			<BreakdownSummary
				groupBy="categories"
				month={month}
				view={buildBreakdownView(items)}
				isLoading={false}
				hasError={false}
			/>
		)
		expect(container.querySelector("section")).toHaveAttribute(
			"aria-busy",
			"false"
		)
	})

	it("hides values behind skeletons while loading", () => {
		const { container } = renderSummary("categories", [], { isLoading: true })
		expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
			0
		)
		expect(screen.queryByText("—")).not.toBeInTheDocument()
	})
})

describe("BreakdownEmpty", () => {
	it("names the month", () => {
		render(<BreakdownEmpty monthLabel="September 2026" />)
		expect(
			screen.getByText("No personal expenses for September 2026.")
		).toBeInTheDocument()
	})
})
