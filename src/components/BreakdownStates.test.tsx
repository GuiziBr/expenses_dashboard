// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { translations } from "@/constants/translations"
import {
	BreakdownEmpty,
	BreakdownError,
	BreakdownSkeleton
} from "./BreakdownStates"

const { breakdown } = translations.dashboards

describe("BreakdownError", () => {
	it("announces the error and retries on click", async () => {
		const onRetry = vi.fn()
		render(<BreakdownError onRetry={onRetry} />)

		expect(screen.getByRole("alert")).toHaveTextContent(breakdown.error)
		await userEvent.click(screen.getByRole("button", { name: breakdown.retry }))

		expect(onRetry).toHaveBeenCalledTimes(1)
	})
})

describe("BreakdownEmpty", () => {
	it("names the month that has no data", () => {
		render(<BreakdownEmpty monthLabel="March 2026" />)

		expect(
			screen.getByText(`${breakdown.emptyMonth} March 2026.`)
		).toBeVisible()
	})
})

describe("BreakdownSkeleton", () => {
	it("renders five placeholder rows hidden from assistive tech", () => {
		const { container } = render(<BreakdownSkeleton />)

		const wrapper = container.firstElementChild
		expect(wrapper).toHaveAttribute("aria-hidden", "true")
		expect(wrapper?.children).toHaveLength(5)
	})
})
