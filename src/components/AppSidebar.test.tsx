// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

let pathname = "/sharedDashboard"
let search = ""
const signOut = vi.fn()

vi.mock("next/navigation", () => ({
	usePathname: () => pathname,
	useSearchParams: () => new URLSearchParams(search)
}))

let avatar: string | null = null

vi.mock("@/contexts/auth-context", () => ({
	useAuth: () => ({
		user: { id: "1", name: "Ricardo Guizi", email: "ricardo@test.com", avatar },
		signOut
	})
}))

import { AppSidebar } from "./AppSidebar"

beforeAll(() => {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

beforeEach(() => {
	pathname = "/sharedDashboard"
	search = ""
	signOut.mockClear()
	avatar = null
})

describe("AppSidebar navigation", () => {
	it("renders the main navigation with grouped links", () => {
		render(<AppSidebar />)
		const nav = screen.getByRole("navigation", { name: "Main" })

		for (const [label, href] of [
			["Shared Dashboard", "/sharedDashboard"],
			["Personal Dashboard", "/personalDashboard"],
			["Consolidated Balance", "/consolidatedBalance"],
			["Balance Breakdown", "/balanceBreakdown"]
		]) {
			expect(within(nav).getByRole("link", { name: label })).toHaveAttribute(
				"href",
				href
			)
		}
		expect(
			within(nav).getByRole("list", { name: "Dashboards" })
		).toBeInTheDocument()
		expect(
			within(nav).getByRole("list", { name: "Reports" })
		).toBeInTheDocument()
	})

	it("marks only the current page with aria-current", () => {
		pathname = "/balanceBreakdown"
		render(<AppSidebar />)

		expect(
			screen.getByRole("link", { name: "Balance Breakdown" })
		).toHaveAttribute("aria-current", "page")
		expect(
			screen.getByRole("link", { name: "Shared Dashboard" })
		).not.toHaveAttribute("aria-current")
	})
})

describe("AppSidebar month carry-over", () => {
	it("keeps the selected month on links to month pages only", () => {
		search = "month=2026-08"
		render(<AppSidebar />)

		expect(
			screen.getByRole("link", { name: "Personal Dashboard" })
		).toHaveAttribute("href", "/personalDashboard?month=2026-08")
		expect(
			screen.getByRole("link", { name: "Balance Breakdown" })
		).toHaveAttribute("href", "/balanceBreakdown?month=2026-08")
		expect(
			screen.getByRole("link", { name: "Consolidated Balance" })
		).toHaveAttribute("href", "/consolidatedBalance")
	})

	it("ignores an invalid month", () => {
		search = "month=nope"
		render(<AppSidebar />)

		expect(
			screen.getByRole("link", { name: "Personal Dashboard" })
		).toHaveAttribute("href", "/personalDashboard")
	})
})

describe("AppSidebar management section", () => {
	it("is collapsed by default and expands on click", async () => {
		const user = userEvent.setup()
		render(<AppSidebar />)
		const toggle = screen.getByRole("button", { name: "Management" })

		expect(toggle).toHaveAttribute("aria-expanded", "false")
		expect(
			screen.queryByRole("link", { name: "Stores" })
		).not.toBeInTheDocument()

		await user.click(toggle)

		expect(toggle).toHaveAttribute("aria-expanded", "true")
		for (const [label, href] of [
			["Banks", "/management/banks"],
			["Categories", "/management/categories"],
			["Payment Types", "/management/paymentTypes"],
			["Stores", "/management/stores"]
		]) {
			expect(screen.getByRole("link", { name: label })).toHaveAttribute(
				"href",
				href
			)
		}
	})

	it("starts expanded with the current page marked on a management route", () => {
		pathname = "/management/stores"
		render(<AppSidebar />)

		expect(screen.getByRole("button", { name: "Management" })).toHaveAttribute(
			"aria-expanded",
			"true"
		)
		expect(screen.getByRole("link", { name: "Stores" })).toHaveAttribute(
			"aria-current",
			"page"
		)
	})
})

describe("AppSidebar user menu", () => {
	it("shows the user's initials and name", () => {
		render(<AppSidebar />)
		const trigger = screen.getByRole("button", { name: "Account menu" })

		expect(trigger).toHaveTextContent("RG")
		expect(trigger).toHaveTextContent("Ricardo Guizi")
	})

	it("shows the user's picture instead of the initials when there is one", () => {
		avatar = "https://example.com/me.png"
		render(<AppSidebar />)
		const trigger = screen.getByRole("button", { name: "Account menu" })

		expect(trigger.querySelector("img")).toHaveAttribute(
			"src",
			"https://example.com/me.png"
		)
		expect(trigger).not.toHaveTextContent("RG")
	})

	it("signs out from the menu", async () => {
		const user = userEvent.setup()
		render(<AppSidebar />)

		await user.click(screen.getByRole("button", { name: "Account menu" }))
		expect(await screen.findByText("ricardo@test.com")).toBeInTheDocument()
		await user.click(screen.getByRole("menuitem", { name: "Logout" }))

		expect(signOut).toHaveBeenCalledTimes(1)
	})
})
