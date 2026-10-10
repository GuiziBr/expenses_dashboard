"use client"

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { translations } from "@/constants/translations"
import { usePageToolbar } from "@/contexts/page-toolbar-context"
import { useSelectedMonth } from "@/hooks/use-selected-month"
import {
	formatMonthLabel,
	formatMonthParam
} from "@/lib/balance-breakdown-params"
import { cn } from "@/lib/utils"

const focusRing =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

const arrowClass = cn(
	"flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent",
	focusRing
)

export function MonthPicker({ className }: { className?: string }) {
	const { month, setMonth, shift } = useSelectedMonth()
	const { isCustomRange } = usePageToolbar()

	const handleMonthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		// A cleared native picker keeps the previous month (never request without one)
		const [year, monthNumber] = e.target.value.split("-").map(Number)
		if (year && monthNumber) setMonth({ year, month: monthNumber })
	}

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<button
				type="button"
				aria-label={translations.monthPicker.previous}
				onClick={() => shift(-1)}
				className={arrowClass}
			>
				<ChevronLeft className="size-4" aria-hidden="true" />
			</button>

			<div className="relative flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground focus-within:ring-2 focus-within:ring-ring md:w-[190px] md:flex-none">
				<Calendar
					className="size-4 shrink-0 text-muted-foreground"
					aria-hidden="true"
				/>
				<span className="truncate">
					{isCustomRange
						? translations.monthPicker.customRange
						: formatMonthLabel(month)}
				</span>
				<input
					type="month"
					aria-label={translations.monthPicker.label}
					min="1900-01"
					value={formatMonthParam(month)}
					onChange={handleMonthInput}
					onClick={(e) => e.currentTarget.showPicker?.()}
					className="absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none"
				/>
			</div>

			<button
				type="button"
				aria-label={translations.monthPicker.next}
				onClick={() => shift(1)}
				className={arrowClass}
			>
				<ChevronRight className="size-4" aria-hidden="true" />
			</button>
		</div>
	)
}
