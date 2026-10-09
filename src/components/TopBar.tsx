"use client"

import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { MonthPicker } from "@/components/MonthPicker"
import { NewExpenseAction } from "@/components/NewExpenseAction"
import { ThemeToggle } from "@/components/ThemeToggle"
import { getPageMeta } from "@/lib/navigation"

export function TopBar() {
	const { title, hasMonthPicker, canCreateExpense } = getPageMeta(usePathname())

	return (
		<div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-5 pb-6 md:flex-row md:items-center md:justify-between">
			<h1 className="text-2xl font-bold tracking-tight text-foreground">
				{title}
			</h1>
			<div className="flex items-center gap-2.5">
				{hasMonthPicker && (
					<Suspense fallback={<div className="h-10 w-full md:w-[270px]" />}>
						<MonthPicker className="w-full md:w-auto" />
					</Suspense>
				)}
				<ThemeToggle className="hidden border border-border bg-card md:inline-flex" />
				{canCreateExpense && <NewExpenseAction />}
			</div>
		</div>
	)
}
