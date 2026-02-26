/**
 * Date utilities for expense filters.
 */

/**
 * Format a Date to "yyyy-MM-dd" string.
 */
function toISODateString(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	return `${year}-${month}-${day}`
}

/**
 * Get the first day of the current month as "yyyy-MM-dd".
 * @example "2026-02-01"
 */
export function getFirstDayOfMonth(): string {
	const now = new Date()
	return toISODateString(new Date(now.getFullYear(), now.getMonth(), 1))
}

/**
 * Get the last day of the current month as "yyyy-MM-dd".
 * @example "2026-02-28"
 */
export function getLastDayOfMonth(): string {
	const now = new Date()
	// Day 0 of the next month = last day of the current month
	return toISODateString(new Date(now.getFullYear(), now.getMonth() + 1, 0))
}

/**
 * Get today's date as "yyyy-MM-dd".
 * @example "2026-02-25"
 */
export function getTodayString(): string {
	return toISODateString(new Date())
}
