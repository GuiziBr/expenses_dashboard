// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
	applyTheme,
	DEFAULT_THEME,
	getOppositeTheme,
	getStoredTheme,
	isTheme,
	storeTheme,
	THEME_INIT_SCRIPT,
	THEME_STORAGE_KEY,
	THEME_SWITCHING_ENABLED
} from "./theme"

beforeEach(() => {
	window.localStorage.clear()
	document.documentElement.className = ""
})

describe("theme helpers", () => {
	it("defaults to dark, the app's original look", () => {
		expect(DEFAULT_THEME).toBe("dark")
		expect(getStoredTheme()).toBe("dark")
	})

	it("keeps switching off until the feature ships", () => {
		expect(THEME_SWITCHING_ENABLED).toBe(false)
	})

	it("reads and writes the stored theme", () => {
		storeTheme("light")
		expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
		expect(getStoredTheme()).toBe("light")
	})

	it("ignores an invalid stored value", () => {
		window.localStorage.setItem(THEME_STORAGE_KEY, "sepia")
		expect(getStoredTheme()).toBe("dark")
	})

	it("validates themes", () => {
		expect(isTheme("light")).toBe(true)
		expect(isTheme("dark")).toBe(true)
		expect(isTheme("system")).toBe(false)
		expect(isTheme(null)).toBe(false)
	})

	it("toggles the dark class on <html>", () => {
		applyTheme("dark")
		expect(document.documentElement).toHaveClass("dark")
		applyTheme("light")
		expect(document.documentElement).not.toHaveClass("dark")
	})

	it("returns the opposite theme", () => {
		expect(getOppositeTheme("dark")).toBe("light")
		expect(getOppositeTheme("light")).toBe("dark")
	})
})

describe("THEME_INIT_SCRIPT", () => {
	const run = () => new Function(THEME_INIT_SCRIPT)()

	it("keeps dark when nothing is stored", () => {
		run()
		expect(document.documentElement).toHaveClass("dark")
	})

	it("applies a stored light preference", () => {
		document.documentElement.classList.add("dark")
		window.localStorage.setItem(THEME_STORAGE_KEY, "light")
		run()
		expect(document.documentElement).not.toHaveClass("dark")
	})

	it("falls back to dark for an invalid stored value", () => {
		window.localStorage.setItem(THEME_STORAGE_KEY, "sepia")
		run()
		expect(document.documentElement).toHaveClass("dark")
	})
})
