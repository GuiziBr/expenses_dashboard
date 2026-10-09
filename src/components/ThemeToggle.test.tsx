// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { THEME_STORAGE_KEY } from "@/lib/theme"
import { ThemeProvider } from "@/providers/theme-provider"
import { ThemeToggle } from "./ThemeToggle"

const renderToggle = () =>
	render(
		<ThemeProvider>
			<ThemeToggle />
		</ThemeProvider>
	)

beforeEach(() => {
	window.localStorage.clear()
	document.documentElement.className = "dark"
})

describe("ThemeToggle", () => {
	it("offers the light theme while dark is active", () => {
		renderToggle()
		expect(
			screen.getByRole("button", { name: "Switch to light theme" })
		).toBeInTheDocument()
	})

	it("switches to light, updates <html> and persists the choice", async () => {
		const user = userEvent.setup()
		renderToggle()

		await user.click(
			screen.getByRole("button", { name: "Switch to light theme" })
		)

		expect(document.documentElement).not.toHaveClass("dark")
		expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
		expect(
			screen.getByRole("button", { name: "Switch to dark theme" })
		).toBeInTheDocument()
	})

	it("switches back to dark", async () => {
		const user = userEvent.setup()
		renderToggle()

		await user.click(
			screen.getByRole("button", { name: "Switch to light theme" })
		)
		await user.click(
			screen.getByRole("button", { name: "Switch to dark theme" })
		)

		expect(document.documentElement).toHaveClass("dark")
		expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")
	})

	it("restores a stored light preference on mount", async () => {
		window.localStorage.setItem(THEME_STORAGE_KEY, "light")
		renderToggle()

		expect(
			await screen.findByRole("button", { name: "Switch to dark theme" })
		).toBeInTheDocument()
	})
})
