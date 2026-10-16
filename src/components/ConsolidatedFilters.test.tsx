// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { translations } from "@/constants/translations"
import { ConsolidatedFilters } from "./ConsolidatedFilters"

const { consolidated } = translations.dashboards

function getMonthInput() {
	const input = document.querySelector<HTMLInputElement>('input[name="date"]')
	if (!input) throw new Error("month input not found")
	return input
}

function setup(
	props: Partial<React.ComponentProps<typeof ConsolidatedFilters>> = {}
) {
	const onSearch = vi.fn()
	const onBalanceTypeChange = vi.fn()
	const utils = render(
		<ConsolidatedFilters
			onSearch={onSearch}
			balanceType="categories"
			onBalanceTypeChange={onBalanceTypeChange}
			{...props}
		/>
	)
	return { ...utils, onSearch, onBalanceTypeChange, user: userEvent.setup() }
}

describe("ConsolidatedFilters", () => {
	it("shows the initial month and the selected balance type", () => {
		setup({ initialDate: "2026-03" })

		expect(getMonthInput()).toHaveValue("2026-03")
		expect(screen.getByRole("combobox")).toHaveTextContent(
			translations.filters.categories
		)
	})

	it("submits the chosen month", async () => {
		const { user, onSearch } = setup({ initialDate: "2026-03" })

		fireEvent.change(getMonthInput(), { target: { value: "2026-05" } })
		await user.click(
			screen.getByRole("button", { name: translations.common.search })
		)

		expect(onSearch).toHaveBeenCalledWith({ date: "2026-05" })
	})

	it("requires a month and does not search without one", async () => {
		const { user, onSearch } = setup()

		await user.click(
			screen.getByRole("button", { name: translations.common.search })
		)

		expect(await screen.findByRole("alert")).toHaveTextContent(
			consolidated.monthRequired
		)
		expect(onSearch).not.toHaveBeenCalled()
	})

	it("clears the month error once a month is picked", async () => {
		const { user, onSearch } = setup()
		await user.click(
			screen.getByRole("button", { name: translations.common.search })
		)
		await screen.findByRole("alert")

		fireEvent.change(getMonthInput(), { target: { value: "2026-01" } })

		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
		await user.click(
			screen.getByRole("button", { name: translations.common.search })
		)
		expect(onSearch).toHaveBeenCalledWith({ date: "2026-01" })
	})

	it("requires a balance type and does not search without one", async () => {
		const { user, onSearch } = setup({
			balanceType: "",
			initialDate: "2026-03"
		})

		await user.click(
			screen.getByRole("button", { name: translations.common.search })
		)

		expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true")
		expect(screen.getByText(consolidated.typeRequired)).toBeInTheDocument()
		expect(onSearch).not.toHaveBeenCalled()
	})

	it("reports a newly picked balance type and clears its error", async () => {
		const { user, onBalanceTypeChange } = setup({
			balanceType: "",
			initialDate: "2026-03"
		})
		await user.click(
			screen.getByRole("button", { name: translations.common.search })
		)

		await user.click(screen.getByRole("combobox"))
		await user.click(
			await screen.findByRole("option", {
				name: translations.filters.paymentType
			})
		)

		expect(onBalanceTypeChange).toHaveBeenCalledWith("payments")
		expect(
			screen.queryByText(consolidated.typeRequired)
		).not.toBeInTheDocument()
	})

	it("re-syncs the month when initialDate changes", () => {
		const { rerender, onSearch, onBalanceTypeChange } = setup({
			initialDate: "2026-03"
		})

		rerender(
			<ConsolidatedFilters
				onSearch={onSearch}
				balanceType="categories"
				onBalanceTypeChange={onBalanceTypeChange}
				initialDate="2026-08"
			/>
		)

		expect(getMonthInput()).toHaveValue("2026-08")
	})

	it("disables the button and hides its label while loading", () => {
		setup({ isLoading: true, initialDate: "2026-03" })

		expect(screen.getByRole("button")).toBeDisabled()
		expect(screen.queryByText(translations.common.search)).toBeNull()
	})
})
