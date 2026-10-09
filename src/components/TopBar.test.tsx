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
import { ThemeProvider } from "@/providers/theme-provider"
import { TopBar } from "./TopBar"

const renderBar = (path: string) => {
	pathname = path
	return render(
		<ThemeProvider>
			<PageToolbarProvider>
				<TopBar />
			</PageToolbarProvider>
		</ThemeProvider>
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

	it("shows the disabled theme toggle", () => {
		renderBar("/sharedDashboard")

		expect(
			screen.getByRole("button", { name: "Switch to light theme" })
		).toHaveAttribute("aria-disabled", "true")
	})
})
