/**
 * Format a number (in cents) as a Canadian Dollar currency string.
 * @example formatCurrency(150000) → "CA$1,500.00"
 */
export function formatCurrency(valueInCents: number): string {
	return new Intl.NumberFormat("en-CA", {
		style: "currency",
		currency: "CAD"
	}).format(valueInCents / 100)
}
