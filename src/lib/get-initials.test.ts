import { describe, expect, it } from "vitest"
import { getInitials } from "./get-initials"

describe("getInitials", () => {
	it("uses the first letters of the first and last words", () => {
		expect(getInitials("Ricardo Guizi")).toBe("RG")
		expect(getInitials("Ana Maria de Souza")).toBe("AS")
	})

	it("uses a single letter for a single word", () => {
		expect(getInitials("ricardo")).toBe("R")
	})

	it("ignores extra whitespace", () => {
		expect(getInitials("  ricardo   guizi ")).toBe("RG")
	})

	it("falls back to a question mark without a name", () => {
		expect(getInitials("")).toBe("?")
		expect(getInitials("   ")).toBe("?")
		expect(getInitials(null)).toBe("?")
		expect(getInitials(undefined)).toBe("?")
	})
})
