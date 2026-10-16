// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MonthAwareLink } from "./MonthAwareLink"

const searchParams = vi.hoisted(() => ({ value: new URLSearchParams() }))

vi.mock("next/navigation", () => ({
	useSearchParams: () => searchParams.value
}))

describe("MonthAwareLink", () => {
	beforeEach(() => {
		searchParams.value = new URLSearchParams()
	})

	it("carries a valid selected month to month-aware routes", () => {
		searchParams.value = new URLSearchParams("month=2026-03")
		render(<MonthAwareLink href="/shared-dashboard">Shared</MonthAwareLink>)

		expect(screen.getByRole("link", { name: "Shared" })).toHaveAttribute(
			"href",
			"/shared-dashboard?month=2026-03"
		)
	})

	it("keeps the plain href when no month is selected", () => {
		render(<MonthAwareLink href="/balance-breakdown">Breakdown</MonthAwareLink>)

		expect(screen.getByRole("link", { name: "Breakdown" })).toHaveAttribute(
			"href",
			"/balance-breakdown"
		)
	})

	it("ignores an invalid month param", () => {
		searchParams.value = new URLSearchParams("month=2026-13")
		render(<MonthAwareLink href="/personal-dashboard">Personal</MonthAwareLink>)

		expect(screen.getByRole("link", { name: "Personal" })).toHaveAttribute(
			"href",
			"/personal-dashboard"
		)
	})

	it("does not append the month to routes that ignore it", () => {
		searchParams.value = new URLSearchParams("month=2026-03")
		render(<MonthAwareLink href="/banks">Banks</MonthAwareLink>)

		expect(screen.getByRole("link", { name: "Banks" })).toHaveAttribute(
			"href",
			"/banks"
		)
	})

	it("passes extra props through to the link", () => {
		searchParams.value = new URLSearchParams("month=2026-03")
		render(
			<MonthAwareLink href="/shared-dashboard" className="nav" title="Go">
				Shared
			</MonthAwareLink>
		)

		const link = screen.getByRole("link", { name: "Shared" })
		expect(link).toHaveClass("nav")
		expect(link).toHaveAttribute("title", "Go")
	})
})
