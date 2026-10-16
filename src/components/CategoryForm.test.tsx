// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { translations } from "@/constants/translations"
import { api } from "@/lib/api"
import { createQueryWrapper } from "@/test/query-wrapper"
import { CategoryForm } from "./CategoryForm"

vi.mock("@/lib/api", () => ({ api: { post: vi.fn() } }))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function setup() {
	const { wrapper } = createQueryWrapper()
	render(<CategoryForm />, { wrapper })
	return {
		user: userEvent.setup(),
		input: screen.getByPlaceholderText(
			translations.management.categoryPlaceholder
		),
		save: screen.getByRole("button", { name: translations.createExpense.save })
	}
}

describe("CategoryForm", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("disables save while the name is empty or blank", async () => {
		const { user, input, save } = setup()

		expect(save).toBeDisabled()

		await user.type(input, "   ")
		expect(save).toBeDisabled()

		await user.type(input, "Groceries")
		expect(save).toBeEnabled()
	})

	it("creates the category, notifies and clears the input on success", async () => {
		vi.mocked(api.post).mockResolvedValue({})
		const { user, input, save } = setup()

		await user.type(input, "Groceries")
		await user.click(save)

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				translations.management.categoryCreateSuccess
			)
		)
		expect(api.post).toHaveBeenCalledWith("categories", {
			description: "Groceries"
		})
		expect(input).toHaveValue("")
	})

	it("shows the API error and keeps the input when creation fails", async () => {
		vi.mocked(api.post).mockRejectedValue(new Error("Category already exists"))
		const { user, input, save } = setup()

		await user.type(input, "Groceries")
		await user.click(save)

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith("Category already exists")
		)
		expect(input).toHaveValue("Groceries")
	})

	it("falls back to the default error message when the error has none", async () => {
		vi.mocked(api.post).mockRejectedValue(new Error(""))
		const { user, input, save } = setup()

		await user.type(input, "Groceries")
		await user.click(save)

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				translations.management.categoryCreateError
			)
		)
	})

	it("disables save while the request is pending", async () => {
		vi.mocked(api.post).mockReturnValue(new Promise(() => {}))
		const { user, input, save } = setup()

		await user.type(input, "Groceries")
		await user.click(save)

		await waitFor(() => expect(screen.getByRole("button")).toBeDisabled())
	})
})
