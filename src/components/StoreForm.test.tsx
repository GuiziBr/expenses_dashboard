// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { translations } from "@/constants/translations"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import { StoreForm } from "./StoreForm"

vi.mock("@/lib/api", () => ({ api: { post: vi.fn() } }))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function setup() {
	const { wrapper } = createQueryWrapper()
	render(<StoreForm />, { wrapper })
	return {
		user: userEvent.setup(),
		input: screen.getByPlaceholderText(
			translations.management.storePlaceholder
		),
		save: screen.getByRole("button", { name: translations.createExpense.save })
	}
}

describe("StoreForm", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("disables save while the name is empty or blank", async () => {
		const { user, input, save } = setup()

		expect(save).toBeDisabled()

		await user.type(input, "   ")
		expect(save).toBeDisabled()

		await user.type(input, "Carrefour")
		expect(save).toBeEnabled()
	})

	it("creates the store, notifies and clears the input on success", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { user, input, save } = setup()

		await user.type(input, "Carrefour")
		await user.click(save)

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				translations.management.storeCreateSuccess
			)
		)
		expect(api.post).toHaveBeenCalledWith("stores", { name: "Carrefour" })
		expect(input).toHaveValue("")
	})

	it("shows the API error and keeps the input when creation fails", async () => {
		vi.mocked(api.post).mockRejectedValue(new Error("Store already exists"))
		const { user, input, save } = setup()

		await user.type(input, "Carrefour")
		await user.click(save)

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith("Store already exists")
		)
		expect(input).toHaveValue("Carrefour")
	})

	it("falls back to the default error message when the error has none", async () => {
		vi.mocked(api.post).mockRejectedValue(new Error(""))
		const { user, input, save } = setup()

		await user.type(input, "Carrefour")
		await user.click(save)

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				translations.management.storeCreateError
			)
		)
	})

	it("disables save while the request is pending", async () => {
		vi.mocked(api.post).mockReturnValue(new Promise(() => {}))
		const { user, input, save } = setup()

		await user.type(input, "Carrefour")
		await user.click(save)

		await waitFor(() => expect(screen.getByRole("button")).toBeDisabled())
	})
})
