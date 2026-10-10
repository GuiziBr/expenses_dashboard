// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

let pathname = "/sharedDashboard"
let search = ""
const signOut = vi.fn()

vi.mock("next/navigation", () => ({
	usePathname: () => pathname,
	useSearchParams: () => new URLSearchParams(search)
}))

vi.mock("@/contexts/auth-context", () => ({
	useAuth: () => ({ user: null, signOut })
}))

import { THEME_STORAGE_KEY } from "@/lib/theme"
import { ThemeProvider } from "@/providers/theme-provider"
import { BottomTabBar } from "./BottomTabBar"

const renderBar = () =>
	render(
		<ThemeProvider>
			<BottomTabBar />
		</ThemeProvider>
	)

beforeEach(() => {
	window.localStorage.clear()
	document.documentElement.className = "dark"
	pathname = "/sharedDashboard"
	search = ""
	signOut.mockClear()
})

const openMore = async () => {
	const user = userEvent.setup()
	renderBar()
	await user.click(screen.getByRole("button", { name: "More" }))
	return { user, dialog: await screen.findByRole("dialog") }
}

describe("BottomTabBar tabs", () => {
	it("renders the three primary tabs and More", () => {
		renderBar()
		const nav = screen.getByRole("navigation", { name: "Primary" })

		for (const [label, href] of [
			["Shared", "/sharedDashboard"],
			["Personal", "/personalDashboard"],
			["Balance", "/consolidatedBalance"]
		]) {
			expect(within(nav).getByRole("link", { name: label })).toHaveAttribute(
				"href",
				href
			)
		}
		expect(
			within(nav).getByRole("button", { name: "More" })
		).toBeInTheDocument()
	})

	it("marks the current tab with aria-current", () => {
		pathname = "/personalDashboard"
		renderBar()

		expect(screen.getByRole("link", { name: "Personal" })).toHaveAttribute(
			"aria-current",
			"page"
		)
		expect(screen.getByRole("link", { name: "Shared" })).not.toHaveAttribute(
			"aria-current"
		)
	})

	it("highlights More for pages that live inside it", () => {
		for (const path of ["/balanceBreakdown", "/management/banks"]) {
			pathname = path
			const { unmount } = renderBar()
			expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
				"data-active",
				"true"
			)
			unmount()
		}
	})

	it("does not highlight More on a primary tab", () => {
		renderBar()
		expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
			"data-active",
			"false"
		)
	})
})

describe("BottomTabBar month carry-over", () => {
	it("keeps the selected month on the month tabs", () => {
		search = "month=2026-08"
		renderBar()

		expect(screen.getByRole("link", { name: "Personal" })).toHaveAttribute(
			"href",
			"/personalDashboard?month=2026-08"
		)
		expect(screen.getByRole("link", { name: "Balance" })).toHaveAttribute(
			"href",
			"/consolidatedBalance"
		)
	})
})

describe("BottomTabBar More sheet", () => {
	it("lists Balance Breakdown and every management page", async () => {
		const { dialog } = await openMore()

		for (const [label, href] of [
			["Balance Breakdown", "/balanceBreakdown"],
			["Banks", "/management/banks"],
			["Categories", "/management/categories"],
			["Payment Types", "/management/paymentTypes"],
			["Stores", "/management/stores"]
		]) {
			expect(within(dialog).getByRole("link", { name: label })).toHaveAttribute(
				"href",
				href
			)
		}
	})

	it("marks the current page inside the sheet", async () => {
		pathname = "/management/stores"
		const { dialog } = await openMore()

		expect(
			within(dialog).getByRole("link", { name: "Stores" })
		).toHaveAttribute("aria-current", "page")
	})

	it("closes after choosing a page", async () => {
		const { user, dialog } = await openMore()

		await user.click(within(dialog).getByRole("link", { name: "Banks" }))

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
	})

	it("signs out from the sheet", async () => {
		const { user, dialog } = await openMore()

		await user.click(within(dialog).getByRole("button", { name: "Logout" }))

		expect(signOut).toHaveBeenCalledTimes(1)
	})

	it("offers the light theme while dark is active", async () => {
		const { dialog } = await openMore()

		expect(
			within(dialog).getByRole("button", { name: "Switch to light theme" })
		).toBeInTheDocument()
	})

	it("switches the theme, keeps the choice and stays open", async () => {
		const { user, dialog } = await openMore()

		await user.click(
			within(dialog).getByRole("button", { name: "Switch to light theme" })
		)

		expect(document.documentElement).not.toHaveClass("dark")
		expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
		expect(screen.getByRole("dialog")).toBeInTheDocument()
		expect(
			within(screen.getByRole("dialog")).getByRole("button", {
				name: "Switch to dark theme"
			})
		).toBeInTheDocument()
	})
})
