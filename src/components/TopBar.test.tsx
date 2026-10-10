// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

let pathname = "/sharedDashboard"

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
	usePathname: () => pathname,
	useSearchParams: () => new URLSearchParams()
}))

vi.mock("@/components/NewExpenseAction", () => ({
	NewExpenseAction: () => <button type="button">New expense action</button>
}))

import { PageToolbarProvider } from "@/contexts/page-toolbar-context"
import { TopBar } from "./TopBar"

const renderBar = (path: string) => {
	pathname = path
	return render(
		<PageToolbarProvider>
			<TopBar />
		</PageToolbarProvider>
	)
}

describe("TopBar", () => {
	it("shows the title, month picker and create action on the dashboards", () => {
		renderBar("/personalDashboard")

		expect(
			screen.getByRole("heading", { level: 1, name: "Personal Dashboard" })
		).toBeInTheDocument()
		expect(screen.getByLabelText("Month")).toBeInTheDocument()
		expect(screen.getByText("New expense action")).toBeInTheDocument()
	})

	it("shows the month picker without a create action on Balance Breakdown", () => {
		renderBar("/balanceBreakdown")

		expect(screen.getByLabelText("Month")).toBeInTheDocument()
		expect(screen.queryByText("New expense action")).not.toBeInTheDocument()
	})

	it("shows neither on Consolidated Balance or management pages", () => {
		for (const path of ["/consolidatedBalance", "/management/banks"]) {
			const { unmount } = renderBar(path)
			expect(screen.queryByLabelText("Month")).not.toBeInTheDocument()
			expect(screen.queryByText("New expense action")).not.toBeInTheDocument()
			unmount()
		}
	})

	it("has no theme toggle, which lives in the user menu", () => {
		renderBar("/sharedDashboard")

		expect(
			screen.queryByRole("button", { name: /switch to (light|dark) theme/i })
		).not.toBeInTheDocument()
	})

	it("keeps the month picker pinned on the shared and personal dashboards", () => {
		for (const path of ["/sharedDashboard", "/personalDashboard"]) {
			const { container, unmount } = renderBar(path)
			expect(container.querySelector(".sticky")).toContainElement(
				screen.getByLabelText("Month")
			)
			unmount()
		}
	})

	it("does not pin the month picker on Balance Breakdown", () => {
		const { container } = renderBar("/balanceBreakdown")

		expect(container.querySelector(".sticky")).not.toBeInTheDocument()
	})
})
