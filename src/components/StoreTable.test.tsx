// @vitest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { translations } from "@/constants/translations"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import type { FormattedStore } from "@/types/expenses"
import { StoreTable } from "./StoreTable"

vi.mock("@/lib/api", () => ({ api: { patch: vi.fn(), delete: vi.fn() } }))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const stores: FormattedStore[] = [
	{
		id: "store-1",
		name: "Carrefour",
		createdAt: "2026-01-10T12:00:00.000Z",
		updatedAt: null,
		formattedCreatedAt: "10/01/2026",
		formattedUpdatedAt: "11/01/2026"
	},
	{
		id: "store-2",
		name: "Costco",
		createdAt: "2026-02-10T12:00:00.000Z",
		updatedAt: null,
		formattedCreatedAt: "10/02/2026",
		formattedUpdatedAt: "11/02/2026"
	}
]

function setup(rows = stores) {
	const { wrapper } = createQueryWrapper()
	render(<StoreTable stores={rows} />, { wrapper })
	return userEvent.setup()
}

async function openRowMenu(
	user: ReturnType<typeof userEvent.setup>,
	rowName: string,
	action: string
) {
	const row = screen.getByRole("row", { name: new RegExp(rowName) })
	await user.click(within(row).getByRole("button"))
	await user.click(await screen.findByRole("menuitem", { name: action }))
}

describe("StoreTable", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("renders a row per store with its dates", () => {
		setup()

		expect(screen.getByRole("cell", { name: "Carrefour" })).toBeVisible()
		expect(screen.getByRole("cell", { name: "Costco" })).toBeVisible()
		expect(screen.getByText("10/01/2026")).toBeVisible()
		expect(screen.getByText("11/02/2026")).toBeInTheDocument()
	})

	it("renders only the header when there are no stores", () => {
		setup([])

		expect(screen.getAllByRole("row")).toHaveLength(1)
	})

	it("edits a store and closes the modal on success", async () => {
		vi.mocked(api.patch).mockResolvedValue({})
		const user = setup()

		await openRowMenu(user, "Carrefour", translations.management.edit)
		const dialog = await screen.findByRole("dialog", {
			name: translations.management.editStoreTitle
		})
		const input = within(dialog).getByPlaceholderText(
			translations.management.storePlaceholder
		)
		expect(input).toHaveValue("Carrefour")

		await user.clear(input)
		await user.type(input, "Carre")
		await user.click(
			within(dialog).getByRole("button", {
				name: translations.createExpense.save
			})
		)

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				translations.management.storeUpdateSuccess
			)
		)
		expect(api.patch).toHaveBeenCalledWith("stores/store-1", { name: "Carre" })
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		)
	})

	it("shows the update error and keeps the modal open on failure", async () => {
		vi.mocked(api.patch).mockRejectedValue(new Error("Already taken"))
		const user = setup()

		await openRowMenu(user, "Costco", translations.management.edit)
		const dialog = await screen.findByRole("dialog")
		await user.type(
			within(dialog).getByPlaceholderText(
				translations.management.storePlaceholder
			),
			"x"
		)
		await user.click(
			within(dialog).getByRole("button", {
				name: translations.createExpense.save
			})
		)

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith("Already taken")
		)
		expect(screen.getByRole("dialog")).toBeVisible()
	})

	it("asks for confirmation and deletes a store", async () => {
		vi.mocked(api.delete).mockResolvedValue({})
		const user = setup()

		await openRowMenu(user, "Costco", translations.management.delete)
		const dialog = await screen.findByRole("dialog", {
			name: translations.management.confirmDeleteStoreTitle
		})
		expect(within(dialog).getByText(/Costco/)).toBeVisible()

		await user.click(
			within(dialog).getByRole("button", {
				name: translations.management.delete
			})
		)

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				translations.management.storeDeleteSuccess
			)
		)
		expect(api.delete).toHaveBeenCalledWith("stores/store-2")
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		)
	})

	it("does not delete when the confirmation is cancelled", async () => {
		const user = setup()

		await openRowMenu(user, "Carrefour", translations.management.delete)
		await user.click(await screen.findByRole("button", { name: "Cancel" }))

		expect(api.delete).not.toHaveBeenCalled()
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		)
	})

	it("shows the delete error and keeps the dialog open on failure", async () => {
		vi.mocked(api.delete).mockRejectedValue(new Error("In use"))
		const user = setup()

		await openRowMenu(user, "Carrefour", translations.management.delete)
		await user.click(
			await screen.findByRole("button", {
				name: translations.management.delete
			})
		)

		await waitFor(() => expect(toast.error).toHaveBeenCalledWith("In use"))
		expect(screen.getByRole("dialog")).toBeVisible()
	})
})
