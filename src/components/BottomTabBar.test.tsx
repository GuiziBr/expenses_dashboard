// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

let pathname = "/sharedDashboard"
const signOut = vi.fn()

vi.mock("next/navigation", () => ({
	usePathname: () => pathname
}))

vi.mock("@/contexts/auth-context", () => ({
	useAuth: () => ({ user: null, signOut })
}))

import { BottomTabBar } from "./BottomTabBar"

beforeEach(() => {
	pathname = "/sharedDashboard"
	signOut.mockClear()
})

const openMore = async () => {
	const user = userEvent.setup()
	render(<BottomTabBar />)
	await user.click(screen.getByRole("button", { name: "More" }))
	return { user, dialog: await screen.findByRole("dialog") }
}

describe("BottomTabBar tabs", () => {
	it("renders the three primary tabs and More", () => {
		render(<BottomTabBar />)
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
		render(<BottomTabBar />)

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
			const { unmount } = render(<BottomTabBar />)
			expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
				"data-active",
				"true"
			)
			unmount()
		}
	})

	it("does not highlight More on a primary tab", () => {
		render(<BottomTabBar />)
		expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
			"data-active",
			"false"
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
})
