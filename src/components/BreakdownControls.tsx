"use client"

import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	CreditCard,
	Landmark,
	Store,
	Tag
} from "lucide-react"
import type React from "react"
import { translations } from "@/constants/translations"
import {
	type BreakdownMonth,
	formatMonthLabel,
	formatMonthParam
} from "@/lib/balance-breakdown-params"
import { cn } from "@/lib/utils"
import type { BalanceFilterKey } from "@/types/expenses"

const { tabs } = translations.dashboards.breakdown

const TABS: {
	key: BalanceFilterKey
	label: string
	shortLabel?: string
	icon: React.ElementType
}[] = [
	{ key: "categories", label: tabs.categories, icon: Tag },
	{
		key: "paymentType",
		label: tabs.paymentType,
		shortLabel: tabs.paymentTypeShort,
		icon: CreditCard
	},
	{ key: "banks", label: tabs.banks, icon: Landmark },
	{ key: "stores", label: tabs.stores, icon: Store }
]

const focusRing =
	"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

interface BreakdownControlsProps {
	groupBy: BalanceFilterKey
	month: BreakdownMonth
	onGroupByChange: (groupBy: BalanceFilterKey) => void
	onMonthChange: (month: BreakdownMonth) => void
	onShiftMonth: (delta: number) => void
}

export function BreakdownControls({
	groupBy,
	month,
	onGroupByChange,
	onMonthChange,
	onShiftMonth
}: BreakdownControlsProps) {
	const handleMonthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		// A cleared native picker keeps the previous month (never request without one)
		const [year, monthNumber] = e.target.value.split("-").map(Number)
		if (year && monthNumber) onMonthChange({ year, month: monthNumber })
	}

	return (
		<section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div
				role="tablist"
				aria-label={translations.dashboards.breakdown.groupingLabel}
				className="flex gap-1 rounded-md bg-container-background p-1"
			>
				{TABS.map(({ key, label, shortLabel, icon: Icon }) => {
					const isActive = key === groupBy
					return (
						<button
							key={key}
							type="button"
							role="tab"
							aria-selected={isActive}
							onClick={() => onGroupByChange(key)}
							className={cn(
								"flex flex-1 md:flex-none flex-col md:flex-row items-center justify-center gap-1 md:gap-2 h-14 md:h-10 md:px-4 rounded-[0.25rem] text-xs md:text-[0.9375rem] transition-colors cursor-pointer",
								focusRing,
								isActive
									? "bg-orange text-background font-bold"
									: "text-light-gray font-medium hover:text-input-text"
							)}
						>
							<Icon className="w-[18px] h-[18px]" />
							{shortLabel ? (
								<>
									<span className="md:hidden">{shortLabel}</span>
									<span className="hidden md:inline">{label}</span>
								</>
							) : (
								label
							)}
						</button>
					)
				})}
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					aria-label={translations.dashboards.breakdown.previousMonth}
					onClick={() => onShiftMonth(-1)}
					className={cn(
						"flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-container-background text-input-text hover:text-orange transition-colors cursor-pointer",
						focusRing
					)}
				>
					<ChevronLeft className="w-5 h-5" />
				</button>

				<div className="relative flex h-12 flex-1 md:w-[220px] md:flex-none items-center gap-2 rounded-md bg-container-background px-3 text-input-text focus-within:ring-1 focus-within:ring-ring">
					<Calendar className="w-5 h-5 shrink-0 text-orange" />
					<span>{formatMonthLabel(month)}</span>
					<input
						type="month"
						aria-label={translations.dashboards.breakdown.month}
						min="1900-01"
						value={formatMonthParam(month)}
						onChange={handleMonthInput}
						onClick={(e) => e.currentTarget.showPicker?.()}
						className="absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none"
					/>
				</div>

				<button
					type="button"
					aria-label={translations.dashboards.breakdown.nextMonth}
					onClick={() => onShiftMonth(1)}
					className={cn(
						"flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-container-background text-input-text hover:text-orange transition-colors cursor-pointer",
						focusRing
					)}
				>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</section>
	)
}
