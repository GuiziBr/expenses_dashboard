// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/hooks/use-filter-values", () => ({
	useFilterValues: vi.fn()
}))

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() }
}))

import { useFilterValues } from "@/hooks/use-filter-values"
import { FilterForm } from "./FilterForm"

const VALUES: Record<string, { id: string; description: string }[]> = {
	categories: [{ id: "cat-1", description: "Food" }],
	banks: [{ id: "bank-1", description: "TD" }]
}

const setup = () => {
	vi.mocked(useFilterValues).mockImplementation(
		(filterBy) =>
			({ data: VALUES[filterBy ?? ""] ?? [], isLoading: false }) as ReturnType<
				typeof useFilterValues
			>
	)
	const onSubmit = vi.fn()
	render(
		<FilterForm
			onSubmit={onSubmit}
			initialFilters={{ startDate: "2026-02-01", endDate: "2026-02-28" }}
		/>
	)
	return { onSubmit, user: userEvent.setup() }
}

const triggers = () => screen.getAllByRole("combobox")

beforeEach(() => vi.clearAllMocks())

describe("FilterForm selects", () => {
	it("keeps Filter value disabled until a Filter by is chosen", async () => {
		const { user } = setup()

		expect(triggers()[1]).toBeDisabled()

		await user.click(triggers()[0])
		await user.click(await screen.findByRole("option", { name: "Category" }))

		expect(triggers()[1]).toBeEnabled()
	})

	it("submits the chosen filter and value", async () => {
		const { user, onSubmit } = setup()

		await user.click(triggers()[0])
		await user.click(await screen.findByRole("option", { name: "Category" }))
		await user.click(triggers()[1])
		await user.click(await screen.findByRole("option", { name: "Food" }))
		await user.click(screen.getByRole("button", { name: "Search" }))

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ filterBy: "categories", filterValue: "cat-1" })
		)
	})

	it("clears the value when Filter by changes", async () => {
		const { user, onSubmit } = setup()

		await user.click(triggers()[0])
		await user.click(await screen.findByRole("option", { name: "Category" }))
		await user.click(triggers()[1])
		await user.click(await screen.findByRole("option", { name: "Food" }))
		await user.click(triggers()[0])
		await user.click(await screen.findByRole("option", { name: "Bank" }))
		await user.click(screen.getByRole("button", { name: "Search" }))

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({ filterBy: "banks", filterValue: "" })
		)
	})
})
