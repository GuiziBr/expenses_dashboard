const FULL_TURN = 360
const round = (value: number) => Math.round(value * 1000) / 1000

/**
 * Build one SVG path per slice of a donut, starting at 12 o'clock and running
 * clockwise. Shares are normalised, so they only need to be proportional.
 * A slice covering the whole ring is drawn as two arcs (a single arc cannot
 * span 360°), so paths must use `fillRule="evenodd"`.
 *
 * @param shares      Slice sizes, in order
 * @param size        Width and height of the square the donut fits in
 * @param innerRatio  Inner radius as a fraction of the outer radius
 */
export function buildDonutPaths(
	shares: number[],
	size: number,
	innerRatio: number
): string[] {
	const total = shares.reduce((sum, share) => sum + share, 0)
	if (total <= 0) return []

	const center = size / 2
	const outer = size / 2
	const inner = outer * innerRatio

	const point = (radius: number, angle: number) => {
		const radians = (angle * Math.PI) / 180
		return `${round(center + radius * Math.sin(radians))},${round(center - radius * Math.cos(radians))}`
	}

	let start = 0
	return shares.map((share) => {
		const sweep = (share / total) * FULL_TURN
		const end = start + sweep
		const from = start
		start = end

		if (sweep >= FULL_TURN - 0.001) {
			return [
				`M ${point(outer, 0)} A ${outer} ${outer} 0 1 1 ${point(outer, 180)} A ${outer} ${outer} 0 1 1 ${point(outer, 0)} Z`,
				`M ${point(inner, 0)} A ${inner} ${inner} 0 1 0 ${point(inner, 180)} A ${inner} ${inner} 0 1 0 ${point(inner, 0)} Z`
			].join(" ")
		}

		const largeArc = sweep > 180 ? 1 : 0
		return [
			`M ${point(outer, from)}`,
			`A ${outer} ${outer} 0 ${largeArc} 1 ${point(outer, end)}`,
			`L ${point(inner, end)}`,
			`A ${inner} ${inner} 0 ${largeArc} 0 ${point(inner, from)}`,
			"Z"
		].join(" ")
	})
}
