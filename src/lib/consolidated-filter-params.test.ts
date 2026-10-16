import { describe, expect, it } from "vitest"
import {
	parseConsolidatedUrlState,
	serializeConsolidatedParams
} from "./consolidated-filter-params"

const parse = (qs: string) => parseConsolidatedUrlState(new URLSearchParams(qs))

describe("parseConsolidatedUrlState", () => {
	it("reads the month and the balance type", () => {
		expect(parse("month=2026-08&type=payments")).toEqual({
			date: "2026-08",
			balanceType: "payments",
			period: { year: 2026, month: 8 }
		})
	})

	it("means not chosen when missing or invalid", () => {
		for (const qs of ["", "month=2026-13&type=nope", "month=abc"]) {
			expect(parse(qs)).toEqual({ date: "", balanceType: "", period: null })
		}
	})
})

describe("serializeConsolidatedParams", () => {
	it("sets the patched keys and keeps the others", () => {
		const next = serializeConsolidatedParams(
			new URLSearchParams("type=payments"),
			{
				month: "2026-08"
			}
		)
		expect(next.toString()).toBe("type=payments&month=2026-08")
	})

	it("removes empty values", () => {
		const next = serializeConsolidatedParams(
			new URLSearchParams("month=2026-08&type=payments"),
			{ type: "" }
		)
		expect(next.toString()).toBe("month=2026-08")
	})
})
