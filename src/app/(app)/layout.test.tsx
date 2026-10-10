// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
	usePathname: () => "/sharedDashboard",
	useSearchParams: () => new URLSearchParams()
}))

vi.mock("@/components/TopBar", () => ({
	TopBar: () => <header>Top bar</header>
}))

vi.mock("@/contexts/auth-context", () => ({
	useAuth: () => ({
		user: { id: "1", name: "Ricardo Guizi", email: "r@test.com" },
		signOut: vi.fn()
	})
}))

import { ThemeProvider } from "@/providers/theme-provider"
import AppLayout from "./layout"

describe("AppLayout", () => {
	it("renders the sidebar, the tab bar and the page content", () => {
		render(
			<ThemeProvider>
				<AppLayout>
					<main>Page content</main>
				</AppLayout>
			</ThemeProvider>
		)

		expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument()
		expect(
			screen.getByRole("navigation", { name: "Primary" })
		).toBeInTheDocument()
		expect(screen.getByText("Top bar")).toBeInTheDocument()
		expect(screen.getByRole("main")).toHaveTextContent("Page content")
	})
})
