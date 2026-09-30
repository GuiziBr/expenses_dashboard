import { Pointer, Sparkles } from "lucide-react"
import { translations } from "@/constants/translations"
import {
	formatShare,
	getItemLabel,
	getSelectedSlice,
	getSliceSelection,
	isSliceSelected
} from "@/lib/balance-breakdown"
import {
	type BreakdownMonth,
	formatMonthLabel
} from "@/lib/balance-breakdown-params"
import { buildDonutPaths } from "@/lib/donut"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type {
	BreakdownSelection,
	BreakdownSlice,
	BreakdownView
} from "@/types/balance-breakdown"
import type { BalanceFilterKey } from "@/types/expenses"

const { chart, summary } = translations.dashboards.breakdown

const VIEWBOX = 280
const INNER_RATIO = 0.72
const SELECTED_GROWTH = 8 // px the selected slice grows outward (FR-41)

interface BreakdownChartProps {
	view: BreakdownView
	groupBy: BalanceFilterKey
	month: BreakdownMonth
	isLoading: boolean
	selection?: BreakdownSelection | null
	preview?: BreakdownSelection | null
	onSelect?: (selection: BreakdownSelection) => void
	onPreview?: (selection: BreakdownSelection | null) => void
}

function CenterLabel({
	slice,
	view,
	groupBy,
	month
}: {
	slice: BreakdownSlice | null
	view: BreakdownView
	groupBy: BalanceFilterKey
	month: BreakdownMonth
}) {
	const itemsLabel = summary.count[groupBy].toLowerCase()
	const item =
		slice?.kind === "item" ? getItemLabel(slice.row.label, groupBy) : null

	const lines = !slice
		? {
				name: summary.total,
				value: formatCurrency(view.monthTotal),
				sub: formatMonthLabel(month)
			}
		: slice.kind === "item"
			? {
					name: item?.text ?? "",
					value: formatCurrency(slice.row.total),
					sub: `${formatShare(slice.row.share)} ${summary.ofTheMonth} · #${slice.row.rank}`
				}
			: {
					name: chart.other,
					value: formatCurrency(slice.total),
					sub: `${formatShare(slice.share)} ${summary.ofTheMonth}`,
					extra: `${slice.count} ${itemsLabel}`
				}

	return (
		// pointer-events-none: this overlay covers the whole donut, and must not
		// swallow clicks and hovers meant for the slices underneath
		<div className="pointer-events-none absolute inset-0 flex items-center justify-center px-10 md:px-12">
			{/* The three main lines stay centred and in place in every state */}
			<div className="relative flex w-full flex-col items-center gap-0.5 md:gap-1">
				<span
					className={cn(
						"max-w-full truncate text-xs text-light-gray md:text-sm",
						item?.isPlaceholder && "italic"
					)}
				>
					{lines.name}
				</span>
				<span className="max-w-full truncate text-[1.625rem] font-medium text-input-text md:text-[2rem]">
					{lines.value}
				</span>
				<span className="max-w-full truncate text-[0.6875rem] text-iron-gray md:text-[0.8125rem]">
					{lines.sub}
				</span>
				{/* Hangs below the block so it does not push the lines above it up */}
				{lines.extra && (
					<span className="absolute top-full mt-0.5 max-w-full truncate text-[0.6875rem] text-iron-gray md:mt-1 md:text-[0.8125rem]">
						{lines.extra}
					</span>
				)}
			</div>
		</div>
	)
}

export function BreakdownChart({
	view,
	groupBy,
	month,
	isLoading,
	selection = null,
	preview = null,
	onSelect,
	onPreview
}: BreakdownChartProps) {
	const selectedSlice = getSelectedSlice(view, selection)
	// A selection locks the centre; hover only previews while nothing is selected
	const displayedSlice = selectedSlice ?? getSelectedSlice(view, preview)

	const paths = buildDonutPaths(
		view.slices.map((slice) =>
			slice.kind === "item" ? slice.row.share : slice.share
		),
		VIEWBOX,
		INNER_RATIO,
		view.slices.map((slice) =>
			selectedSlice && isSliceSelected(slice, selection) ? SELECTED_GROWTH : 0
		)
	)
	const [placeholderRing] = buildDonutPaths([1], VIEWBOX, INNER_RATIO)
	const itemsLabel = summary.count[groupBy].toLowerCase()

	return (
		<div className="flex flex-col items-center gap-5 rounded-[0.625rem] bg-container-background p-6 md:w-[400px] md:shrink-0 md:gap-6 md:p-8">
			<h2 className="w-full text-[0.8125rem] text-light-gray md:text-sm">
				{chart.title} {chart.item[groupBy]}
			</h2>

			<div className="relative aspect-square w-[220px] md:w-[280px]">
				{/* Decorative: the legend is the accessible version of the chart */}
				<svg
					viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
					aria-hidden="true"
					data-testid="donut"
					className="h-full w-full overflow-visible"
				>
					{isLoading ? (
						<path
							d={placeholderRing}
							fillRule="evenodd"
							fill="var(--muted)"
							className="animate-pulse"
						/>
					) : (
						paths.map((d, index) => {
							const slice = view.slices[index]
							const color =
								slice.kind === "item" ? slice.row.color : slice.color
							const faded =
								selectedSlice !== null && !isSliceSelected(slice, selection)
							return (
								// biome-ignore lint/a11y/noStaticElementInteractions: decorative; the legend rows are the keyboard-accessible controls
								<path
									key={slice.kind === "item" ? slice.row.rank : "other"}
									d={d}
									fillRule="evenodd"
									fill={`var(${color})`}
									stroke="var(--container-background)"
									strokeWidth={2}
									className={cn(
										"cursor-pointer transition-opacity duration-200",
										faded && "opacity-30"
									)}
									onClick={() => onSelect?.(getSliceSelection(slice))}
									onPointerEnter={(e) =>
										e.pointerType === "mouse" &&
										onPreview?.(getSliceSelection(slice))
									}
									onPointerLeave={(e) =>
										e.pointerType === "mouse" && onPreview?.(null)
									}
								/>
							)
						})
					)}
				</svg>

				{!isLoading && (
					<CenterLabel
						slice={displayedSlice}
						view={view}
						groupBy={groupBy}
						month={month}
					/>
				)}
			</div>

			{!isLoading && (
				<>
					{view.topThreeShare !== null && (
						<p className="hidden w-full items-center gap-2.5 rounded-md bg-white/5 px-4 py-3 text-[0.8125rem] text-input-text md:flex">
							<Sparkles className="h-[18px] w-[18px] shrink-0 text-orange" />
							{chart.topThree} {itemsLabel} {chart.accountFor}{" "}
							{formatShare(view.topThreeShare)} {summary.ofTheMonth}
						</p>
					)}
					<p className="flex w-full items-center gap-2 rounded-md bg-white/5 px-3 py-2.5 text-xs text-input-text md:hidden">
						<Pointer className="h-4 w-4 shrink-0 text-orange" />
						{selectedSlice ? chart.hintSelected : chart.hint}
					</p>
				</>
			)}
		</div>
	)
}
