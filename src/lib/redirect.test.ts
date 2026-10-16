import { describe, expect, it } from "vitest"
import { buildSignInUrl, getSafeRedirect } from "./redirect"

describe("getSafeRedirect", () => {
	it("accepts relative paths with query strings", () => {
		const url = "/personal-dashboard?month=2026-09&filterBy=categories"
		expect(getSafeRedirect(url)).toBe(url)
	})

	it.each([
		null,
		undefined,
		"",
		"https://evil.com",
		"//evil.com",
		"/\\evil.com",
		"evil.com",
		"/a\nb",
		"/",
		"/?redirectTo=/x"
	])("rejects %j", (value) => {
		expect(getSafeRedirect(value)).toBeNull()
	})
})

describe("buildSignInUrl", () => {
	it("encodes the destination", () => {
		expect(buildSignInUrl("/a?b=1&c=2")).toBe(
			"/?redirectTo=%2Fa%3Fb%3D1%26c%3D2"
		)
	})

	it("falls back to the plain sign-in page for unsafe input", () => {
		expect(buildSignInUrl("//evil.com")).toBe("/")
		expect(buildSignInUrl()).toBe("/")
	})
})
