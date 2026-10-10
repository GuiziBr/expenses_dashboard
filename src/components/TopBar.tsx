"use client"

import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { MonthPicker } from "@/components/MonthPicker"
import { NewExpenseAction } from "@/components/NewExpenseAction"
import { getPageMeta } from "@/lib/navigation"
import { cn } from "@/lib/utils"

/**
 * Below `md` the wrappers use `display: contents`, so the title and the month
 * picker become direct children of the page column. That lets the picker stay
 * pinned to the top of the screen while the page scrolls (the sticky range is
 * the whole column, not just the top bar).
 */
export function TopBar() {
	const { title, hasMonthPicker, hasStickyMonthPicker, canCreateExpense } =
		getPageMeta(usePathname())

	return (
		<div className="contents md:mx-auto md:flex md:w-full md:max-w-[1120px] md:shrink-0 md:items-center md:justify-between md:px-5 md:pb-6">
			<h1 className="px-5 pb-4 text-2xl font-bold tracking-tight text-foreground md:p-0">
				{title}
			</h1>
			<div className="contents md:flex md:items-center md:gap-2.5">
				{hasMonthPicker && (
					<Suspense fallback={<div className="h-10 w-full md:w-[270px]" />}>
						<div
							className={cn(
								"px-5 pb-4 md:static md:bg-transparent md:p-0",
								hasStickyMonthPicker && "sticky top-0 z-20 bg-background pt-2"
							)}
						>
							<MonthPicker className="w-full md:w-auto" />
						</div>
					</Suspense>
				)}
				{canCreateExpense && <NewExpenseAction />}
			</div>
		</div>
	)
}
