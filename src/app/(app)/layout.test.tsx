// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
	usePathname: () => "/sharedDashboard"
}))

vi.mock("@/contexts/auth-context", () => ({
	useAuth: () => ({
		user: { id: "1", name: "Ricardo Guizi", email: "r@test.com" },
		signOut: vi.fn()
	})
}))

import AppLayout from "./layout"

describe("AppLayout", () => {
	it("renders the sidebar, the tab bar and the page content", () => {
		render(
			<AppLayout>
				<main>Page content</main>
			</AppLayout>
		)

		expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument()
		expect(
			screen.getByRole("navigation", { name: "Primary" })
		).toBeInTheDocument()
		expect(screen.getByRole("main")).toHaveTextContent("Page content")
	})
})
