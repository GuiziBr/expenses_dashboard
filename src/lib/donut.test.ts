import { describe, expect, it } from "vitest"
import { buildDonutPaths } from "./donut"

const SIZE = 200
const RATIO = 0.5

// Pull the numbers out of a path, e.g. "M 100,0 A 100 100 0 0 1 ..." → [100, 0, ...]
const numbers = (path: string) =>
	(path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

describe("buildDonutPaths", () => {
	it("returns one path per slice", () => {
		expect(buildDonutPaths([50, 30, 20], SIZE, RATIO)).toHaveLength(3)
	})

	it("returns nothing when there is nothing to draw", () => {
		expect(buildDonutPaths([], SIZE, RATIO)).toEqual([])
		expect(buildDonutPaths([0, 0], SIZE, RATIO)).toEqual([])
	})

	it("starts at 12 o'clock", () => {
		const [first] = buildDonutPaths([50, 50], SIZE, RATIO)
		expect(first.startsWith("M 100,0 ")).toBe(true)
	})

	it("runs clockwise: a first half ends at 6 o'clock", () => {
		const [first, second] = buildDonutPaths([50, 50], SIZE, RATIO)
		expect(first).toContain("A 100 100 0 0 1 100,200")
		expect(second.startsWith("M 100,200 ")).toBe(true)
	})

	it("has each slice start where the previous one ended", () => {
		const paths = buildDonutPaths([40, 35, 25], SIZE, RATIO)
		const outerEnd = (path: string) => path.match(/A 100 100 0 \d 1 (\S+)/)?.[1]
		const outerStart = (path: string) => path.match(/^M (\S+)/)?.[1]
		expect(outerStart(paths[1])).toBe(outerEnd(paths[0]))
		expect(outerStart(paths[2])).toBe(outerEnd(paths[1]))
	})

	it("uses the large-arc flag only for slices over half", () => {
		const [big, small] = buildDonutPaths([70, 30], SIZE, RATIO)
		expect(big).toContain("A 100 100 0 1 1")
		expect(small).toContain("A 100 100 0 0 1")
	})

	it("normalises shares that do not add up to exactly 100", () => {
		const [first, second] = buildDonutPaths([16.8, 16.8], SIZE, RATIO)
		expect(first).toContain("A 100 100 0 0 1 100,200")
		expect(second.startsWith("M 100,200 ")).toBe(true)
	})

	it("draws a single full slice as an outer and an inner ring", () => {
		const [ring] = buildDonutPaths([1234], SIZE, RATIO)
		expect(ring.match(/M /g)).toHaveLength(2)
		expect(ring).toContain("A 100 100")
		expect(ring).toContain("A 50 50")
	})

	it("keeps every coordinate inside the square", () => {
		for (const path of buildDonutPaths([40, 30, 20, 10], SIZE, RATIO)) {
			for (const value of numbers(path)) expect(value).toBeLessThanOrEqual(200)
		}
	})
})
