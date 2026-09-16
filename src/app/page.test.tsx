// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: vi.fn(), push: vi.fn() })
}))

vi.mock("@/contexts/auth-context", () => ({
	useAuth: vi.fn()
}))

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() }
}))

import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api"
import Home from "./page"

async function submitLoginForm() {
	fireEvent.change(screen.getByPlaceholderText("E-mail"), {
		target: { value: "jane@example.com" }
	})
	fireEvent.change(screen.getByPlaceholderText("Password"), {
		target: { value: "hunter2" }
	})
	fireEvent.click(screen.getByRole("button", { name: /sign in/i }))
}

describe("Home (login page)", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("shows a friendly message on a 401 (invalid credentials)", async () => {
		const signIn = vi.fn().mockRejectedValue(new ApiError("Unauthorized", 401))
		vi.mocked(useAuth).mockReturnValue({
			signIn,
			isLoading: false,
			user: null,
			signOut: vi.fn()
		})

		render(<Home />)
		await submitLoginForm()

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				"Invalid email or password. Please try again."
			)
		})
	})

	it("shows the backend's real message on a non-401 failure", async () => {
		const signIn = vi
			.fn()
			.mockRejectedValue(
				new ApiError("email Invalid input: expected string", 400)
			)
		vi.mocked(useAuth).mockReturnValue({
			signIn,
			isLoading: false,
			user: null,
			signOut: vi.fn()
		})

		render(<Home />)
		await submitLoginForm()

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				"email Invalid input: expected string"
			)
		})
	})

	it("shows the friendly message when the thrown error isn't an ApiError", async () => {
		const signIn = vi.fn().mockRejectedValue(new Error("network down"))
		vi.mocked(useAuth).mockReturnValue({
			signIn,
			isLoading: false,
			user: null,
			signOut: vi.fn()
		})

		render(<Home />)
		await submitLoginForm()

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				"Invalid email or password. Please try again."
			)
		})
	})
})
