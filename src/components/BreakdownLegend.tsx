"use client"

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import Link from "next/link"
import type React from "react"
import { useState } from "react"
import { translations } from "@/constants/translations"
import {
	formatShare,
	getItemLabel,
	getRowSelection,
	isRowSelected
} from "@/lib/balance-breakdown"
import type { BreakdownMonth } from "@/lib/balance-breakdown-params"
import { buildPersonalDashboardHref } from "@/lib/expense-filter-params"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type {
	BreakdownSelection,
	BreakdownView
} from "@/types/balance-breakdown"
import type { BalanceFilterKey } from "@/types/expenses"

const { legend, summary } = translations.dashboards.breakdown

export const MAX_COLLAPSED_ROWS = 10

const Dot = ({ color }: { color: string }) => (
	<span
		aria-hidden="true"
		className="h-2.5 w-2.5 shrink-0 rounded-full"
		style={{ backgroundColor: `var(${color})` }}
	/>
)

interface BreakdownLegendProps {
	view: BreakdownView
	groupBy: BalanceFilterKey
	month: BreakdownMonth
	selection?: BreakdownSelection | null
	onSelect?: (selection: BreakdownSelection) => void
	onPreview?: (selection: BreakdownSelection | null) => void
}

const focusRing =
	"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export function BreakdownLegend({
	view,
	groupBy,
	month,
	selection = null,
	onSelect,
	onPreview
}: BreakdownLegendProps) {
	const [expanded, setExpanded] = useState(false)

	const { rows } = view
	const hasOverflow = rows.length > MAX_COLLAPSED_ROWS
	const visibleRows =
		hasOverflow && !expanded ? rows.slice(0, MAX_COLLAPSED_ROWS) : rows
	const otherSlice = view.slices.find((slice) => slice.kind === "other")
	const firstOtherRank = rows.find((row) => row.inOther)?.rank
	const itemsLabel = summary.count[groupBy].toLowerCase()
	const hasSelection = selection !== null
	const otherSelected = selection?.kind === "other"

	const previewProps = (target: BreakdownSelection) => ({
		onPointerEnter: (e: React.PointerEvent) =>
			e.pointerType === "mouse" && onPreview?.(target),
		onPointerLeave: (e: React.PointerEvent) =>
			e.pointerType === "mouse" && onPreview?.(null)
	})

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-col gap-2">
				{visibleRows.map((row) => {
					const label = getItemLabel(row.label, groupBy)
					return (
						<li key={row.id ?? `none-${row.rank}`} className="contents">
							{otherSlice?.kind === "other" && row.rank === firstOtherRank && (
								<button
									type="button"
									aria-pressed={otherSelected}
									onClick={() => onSelect?.({ kind: "other" })}
									{...previewProps({ kind: "other" })}
									className={cn(
										"flex items-center justify-between rounded-md px-1 pt-2 text-muted-foreground transition-opacity cursor-pointer",
										focusRing,
										otherSelected && "text-foreground",
										hasSelection && !otherSelected && "opacity-[0.55]"
									)}
								>
									<span className="flex items-center gap-2 text-xs">
										<Dot color={otherSlice.color} />
										<span className="font-bold tracking-[1px]">
											{legend.other}
										</span>
										<span>
											· {otherSlice.count} {itemsLabel}
										</span>
									</span>
									<span className="text-xs font-semibold">
										{formatShare(otherSlice.share)} ·{" "}
										{formatCurrency(otherSlice.total)}
									</span>
								</button>
							)}
							<div
								className={cn(
									"flex h-12 items-center rounded-lg border border-border bg-card text-sm font-medium text-foreground transition-opacity hover:bg-accent/40 md:text-[0.9375rem]",
									isRowSelected(row, selection) && "ring-2 ring-primary",
									hasSelection &&
										!isRowSelected(row, selection) &&
										"opacity-[0.55]"
								)}
							>
								<button
									type="button"
									aria-label={`${label.text}, ${formatShare(row.share)}, ${formatCurrency(row.total)}`}
									aria-pressed={isRowSelected(row, selection)}
									onClick={() => onSelect?.(getRowSelection(row))}
									{...previewProps(getRowSelection(row))}
									className={cn(
										"flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-lg pl-4 text-left cursor-pointer",
										row.id ? "pr-2" : "pr-4",
										focusRing
									)}
								>
									<Dot color={row.color} />
									<span
										className={cn(
											"min-w-0 flex-1 truncate",
											label.isPlaceholder && "italic text-muted-foreground"
										)}
									>
										{label.text}
									</span>
									<span className="flex h-[22px] items-center rounded-full bg-background px-2 text-[0.6875rem] text-muted-foreground">
										{formatShare(row.share)}
									</span>
									<span className="min-w-[76px] whitespace-nowrap text-right md:min-w-[110px]">
										{formatCurrency(row.total)}
									</span>
								</button>
								{row.id && (
									<Link
										href={buildPersonalDashboardHref(groupBy, row.id, month)}
										aria-label={`${legend.viewExpenses}: ${label.text}`}
										title={legend.viewExpenses}
										className={cn(
											"mr-1 flex h-10 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
											focusRing
										)}
									>
										<ChevronRight aria-hidden="true" className="h-4 w-4" />
									</Link>
								)}
							</div>
						</li>
					)
				})}
			</ul>

			{hasOverflow && (
				<button
					type="button"
					aria-expanded={expanded}
					onClick={() => setExpanded((current) => !current)}
					className="flex h-11 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				>
					{expanded
						? legend.showLess
						: `${legend.showAll} ${rows.length} ${itemsLabel}`}
					{expanded ? (
						<ChevronUp className="h-4 w-4" />
					) : (
						<ChevronDown className="h-4 w-4" />
					)}
				</button>
			)}
		</div>
	)
}
