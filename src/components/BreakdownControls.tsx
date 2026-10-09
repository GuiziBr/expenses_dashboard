"use client"

import { CreditCard, Landmark, Store, Tag } from "lucide-react"
import type React from "react"
import { useRef } from "react"
import { translations } from "@/constants/translations"
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

export const BREAKDOWN_PANEL_ID = "breakdown-tabpanel"
export const getTabId = (key: BalanceFilterKey) => `breakdown-tab-${key}`

const focusRing =
	"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

interface BreakdownControlsProps {
	groupBy: BalanceFilterKey
	onGroupByChange: (groupBy: BalanceFilterKey) => void
}

export function BreakdownControls({
	groupBy,
	onGroupByChange
}: BreakdownControlsProps) {
	const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

	// Arrow keys, Home and End move between tabs and activate them (A11Y-01)
	const handleTabKeyDown = (
		e: React.KeyboardEvent<HTMLButtonElement>,
		index: number
	) => {
		const lastIndex = TABS.length - 1
		const nextIndex =
			e.key === "ArrowRight"
				? (index + 1) % TABS.length
				: e.key === "ArrowLeft"
					? (index - 1 + TABS.length) % TABS.length
					: e.key === "Home"
						? 0
						: e.key === "End"
							? lastIndex
							: null
		if (nextIndex === null) return

		e.preventDefault()
		const { key } = TABS[nextIndex]
		tabRefs.current[key]?.focus()
		onGroupByChange(key)
	}

	return (
		// Mobile: sticks to the top once the summary cards scroll away (spec section 8)
		<section className="sticky top-0 z-20 -mx-5 flex flex-col gap-3 bg-background px-5 py-3 md:static md:mx-0 md:bg-transparent md:p-0">
			<div
				role="tablist"
				aria-label={translations.dashboards.breakdown.groupingLabel}
				className="flex gap-1 rounded-md bg-container-background p-1"
			>
				{TABS.map(({ key, label, shortLabel, icon: Icon }, index) => {
					const isActive = key === groupBy
					return (
						<button
							key={key}
							ref={(node) => {
								tabRefs.current[key] = node
							}}
							id={getTabId(key)}
							type="button"
							role="tab"
							aria-selected={isActive}
							aria-controls={BREAKDOWN_PANEL_ID}
							tabIndex={isActive ? 0 : -1}
							onClick={() => onGroupByChange(key)}
							onKeyDown={(e) => handleTabKeyDown(e, index)}
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
		</section>
	)
}
