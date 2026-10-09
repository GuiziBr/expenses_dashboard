// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
	PageToolbarProvider,
	useCustomRangeIndicator
} from "@/contexts/page-toolbar-context"

const push = vi.fn()

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
	usePathname: () => "/sharedDashboard",
	useSearchParams: () => new URLSearchParams("month=2026-09")
}))

import { MonthPicker } from "./MonthPicker"

function CustomRange() {
	useCustomRangeIndicator(true)
	return null
}

const renderPicker = (custom = false) =>
	render(
		<PageToolbarProvider>
			{custom && <CustomRange />}
			<MonthPicker />
		</PageToolbarProvider>
	)

beforeEach(() => push.mockClear())

describe("MonthPicker", () => {
	it("shows the selected month as MMMM YYYY", () => {
		renderPicker()
		expect(screen.getByText("September 2026")).toBeInTheDocument()
	})

	it("names the previous and next buttons and shifts by one month", () => {
		renderPicker()
		fireEvent.click(screen.getByRole("button", { name: "Previous month" }))
		fireEvent.click(screen.getByRole("button", { name: "Next month" }))

		expect(push).toHaveBeenNthCalledWith(1, "/sharedDashboard?month=2026-08", {
			scroll: false
		})
		expect(push).toHaveBeenNthCalledWith(2, "/sharedDashboard?month=2026-10", {
			scroll: false
		})
	})

	it("changes the month from the native input", () => {
		renderPicker()
		fireEvent.change(screen.getByLabelText("Month"), {
			target: { value: "2027-01" }
		})

		expect(push).toHaveBeenCalledWith("/sharedDashboard?month=2027-01", {
			scroll: false
		})
	})

	it("ignores a cleared native input", () => {
		renderPicker()
		fireEvent.change(screen.getByLabelText("Month"), { target: { value: "" } })

		expect(push).not.toHaveBeenCalled()
	})

	it("shows Custom range when the page is not on a whole month", () => {
		renderPicker(true)

		expect(screen.getByText("Custom range")).toBeInTheDocument()
		expect(screen.queryByText("September 2026")).not.toBeInTheDocument()
	})
})
