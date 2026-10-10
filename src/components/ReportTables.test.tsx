// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { SharedReport } from "@/types/expenses"
import { ReportTables } from "./ReportTables"

const data = {
	requester: {
		name: "Ricardo",
		total: 10000,
		payments: [
			{
				id: "p1",
				description: "Credit",
				total: 5000,
				banks: [{ id: "b1", name: "RBC", total: 5000 }]
			}
		],
		categories: [{ id: "c1", description: "Food", total: 5000 }]
	},
	partner: {
		name: "Ana",
		total: 2000,
		payments: [],
		categories: []
	}
} as unknown as SharedReport

describe("ReportTables", () => {
	it("renders nothing without data", () => {
		const { container } = render(<ReportTables shareType="payments" />)
		expect(container).toBeEmptyDOMElement()
	})

	it("lists payments with their banks and total", () => {
		render(<ReportTables data={data} shareType="payments" />)

		expect(screen.getByText("Ricardo")).toBeInTheDocument()
		expect(screen.getByText("Credit")).toBeInTheDocument()
		expect(screen.getByText("RBC")).toBeInTheDocument()
		expect(screen.getAllByText(/\$50\.00/).length).toBeGreaterThan(0)
	})

	it("lists categories when that type is chosen", () => {
		render(<ReportTables data={data} shareType="categories" />)

		const table = screen.getByRole("table")
		expect(within(table).getByText("Food")).toBeInTheDocument()
	})

	it("hides a person's table when they have no rows for the type", () => {
		render(<ReportTables data={data} shareType="payments" />)

		expect(screen.queryByText("Ana")).not.toBeInTheDocument()
	})
})
