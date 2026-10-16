import { describe, expect, it } from "vitest"
import {
	parseExpenseUrlState,
	serializeExpenseParams
} from "./expense-filter-params"

const MONTH = { year: 2026, month: 2 }
const parse = (qs: string) =>
	parseExpenseUrlState(new URLSearchParams(qs), MONTH)

describe("parseExpenseUrlState", () => {
	it("defaults to the month range, no filter, no sort, first page", () => {
		expect(parse("")).toEqual({
			filterBy: undefined,
			filterValue: undefined,
			startDate: "2026-02-01",
			endDate: "2026-02-28",
			orderBy: undefined,
			orderType: undefined,
			page: 1
		})
	})

	it("reads every param", () => {
		expect(
			parse(
				"filterBy=banks&filterValue=b1&startDate=2026-02-05&endDate=2026-02-10&orderBy=amount&orderType=desc&page=3"
			)
		).toEqual({
			filterBy: "banks",
			filterValue: "b1",
			startDate: "2026-02-05",
			endDate: "2026-02-10",
			orderBy: "amount",
			orderType: "desc",
			page: 3
		})
	})

	it("ignores invalid values", () => {
		const state = parse(
			"filterBy=nope&filterValue=x&orderBy=nope&orderType=desc&page=-3"
		)
		expect(state.filterBy).toBeUndefined()
		expect(state.filterValue).toBeUndefined()
		expect(state.orderBy).toBeUndefined()
		expect(state.orderType).toBeUndefined()
		expect(state.page).toBe(1)
	})

	it("falls back to asc for an unknown order type", () => {
		expect(parse("orderBy=amount&orderType=x").orderType).toBe("asc")
	})

	it("falls back to the month range for a bad or reversed range", () => {
		for (const qs of [
			"startDate=2026-02-30&endDate=2026-03-01",
			"startDate=2026-02-10&endDate=2026-02-01",
			"startDate=2026-02-10"
		]) {
			const state = parse(qs)
			expect([state.startDate, state.endDate]).toEqual([
				"2026-02-01",
				"2026-02-28"
			])
		}
	})
})

describe("serializeExpenseParams", () => {
	it("keeps unrelated params and sets the patched ones", () => {
		const next = serializeExpenseParams(new URLSearchParams("month=2026-02"), {
			filterBy: "banks",
			filterValue: "b1"
		})
		expect(next.toString()).toBe("month=2026-02&filterBy=banks&filterValue=b1")
	})

	it("drops empty values and the first page", () => {
		const next = serializeExpenseParams(
			new URLSearchParams("filterBy=banks&filterValue=b1&page=2"),
			{ filterBy: "", page: 1 }
		)
		expect(next.toString()).toBe("")
	})

	it("drops a direction left without a column", () => {
		const next = serializeExpenseParams(
			new URLSearchParams("orderBy=amount&orderType=desc"),
			{ orderBy: undefined }
		)
		expect(next.toString()).toBe("")
	})
})
