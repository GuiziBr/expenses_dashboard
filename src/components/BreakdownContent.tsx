"use client"

import { useEffect, useRef, useState } from "react"
import { isSameSelection } from "@/lib/balance-breakdown"
import type { BreakdownMonth } from "@/lib/balance-breakdown-params"
import type {
	BreakdownSelection,
	BreakdownView
} from "@/types/balance-breakdown"
import type { BalanceFilterKey } from "@/types/expenses"
import { BreakdownChart } from "./BreakdownChart"
import { BreakdownLegend } from "./BreakdownLegend"
import { BreakdownSkeleton } from "./BreakdownStates"

interface BreakdownContentProps {
	view: BreakdownView
	groupBy: BalanceFilterKey
	month: BreakdownMonth
	isLoading: boolean
}

/**
 * The chart and legend, sharing one selection (FR-40).
 * Render with a `key` of grouping + month: remounting resets the selection
 * (FR-16) and the legend's expanded state (FR-38).
 */
export function BreakdownContent({
	view,
	groupBy,
	month,
	isLoading
}: BreakdownContentProps) {
	const [selection, setSelection] = useState<BreakdownSelection | null>(null)
	const [preview, setPreview] = useState<BreakdownSelection | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	// Esc or a press outside the chart and legend clears the selection (FR-44)
	useEffect(() => {
		if (!selection) return

		const clearOnEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSelection(null)
		}
		const clearOnOutsidePress = (e: PointerEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) setSelection(null)
		}

		document.addEventListener("keydown", clearOnEscape)
		document.addEventListener("pointerdown", clearOnOutsidePress)
		return () => {
			document.removeEventListener("keydown", clearOnEscape)
			document.removeEventListener("pointerdown", clearOnOutsidePress)
		}
	}, [selection])

	// Pressing the selected slice or row again clears it
	const toggle = (next: BreakdownSelection) =>
		setSelection((current) => (isSameSelection(current, next) ? null : next))

	return (
		<div
			ref={containerRef}
			className="flex flex-col gap-6 md:flex-row md:items-start"
		>
			<BreakdownChart
				view={view}
				groupBy={groupBy}
				month={month}
				isLoading={isLoading}
				selection={selection}
				preview={preview}
				onSelect={toggle}
				onPreview={setPreview}
			/>
			<div className="min-w-0 flex-1">
				{isLoading ? (
					<BreakdownSkeleton />
				) : (
					<BreakdownLegend
						view={view}
						groupBy={groupBy}
						selection={selection}
						onSelect={toggle}
						onPreview={setPreview}
					/>
				)}
			</div>
		</div>
	)
}
