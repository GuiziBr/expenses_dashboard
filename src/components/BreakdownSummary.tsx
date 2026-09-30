import { DollarSign, Layers, Trophy } from "lucide-react"
import type React from "react"
import { translations } from "@/constants/translations"
import { formatShare, getItemLabel } from "@/lib/balance-breakdown"
import type { BreakdownMonth } from "@/lib/balance-breakdown-params"
import { formatMonthLabel } from "@/lib/balance-breakdown-params"
import { formatCurrency } from "@/lib/format-currency"
import { cn } from "@/lib/utils"
import type { BreakdownView } from "@/types/balance-breakdown"
import type { BalanceFilterKey } from "@/types/expenses"

const { summary } = translations.dashboards.breakdown

interface SummaryCardProps {
	label: string
	icon: React.ElementType
	value: React.ReactNode
	sub: React.ReactNode
	isLoading: boolean
	variant?: "default" | "total"
	className?: string
}

function SummaryCard({
	label,
	icon: Icon,
	value,
	sub,
	isLoading,
	variant = "default",
	className
}: SummaryCardProps) {
	const isTotal = variant === "total"

	return (
		<div
			className={cn(
				"flex flex-col gap-2 md:gap-4 rounded-[0.3rem] p-4 md:px-8 md:py-6",
				isTotal
					? "bg-orange text-white gap-3 px-6 py-5"
					: "bg-white text-blue-wood",
				className
			)}
		>
			<header className="flex items-center justify-between">
				<p className="text-[0.8125rem] md:text-base">{label}</p>
				<Icon
					className={cn(
						"w-5 h-5 md:w-8 md:h-8",
						isTotal ? "w-7 h-7 text-white" : "text-orange"
					)}
					strokeWidth={1.5}
				/>
			</header>
			<div className="flex flex-col gap-1 min-w-0">
				{isLoading ? (
					<>
						<div className="h-8 md:h-10 w-2/3 rounded-md bg-muted animate-pulse" />
						<div className="h-4 w-1/2 rounded-md bg-muted animate-pulse" />
					</>
				) : (
					<>
						<p
							className={cn(
								"truncate text-[1.375rem] font-medium md:text-4xl md:font-normal",
								isTotal && "text-4xl font-normal"
							)}
						>
							{value}
						</p>
						<p
							className={cn(
								"text-xs md:text-sm",
								isTotal ? "text-white/80 text-[0.8125rem]" : "text-light-gray"
							)}
						>
							{sub}
						</p>
					</>
				)}
			</div>
		</div>
	)
}

interface BreakdownSummaryProps {
	groupBy: BalanceFilterKey
	month: BreakdownMonth
	view: BreakdownView
	isLoading: boolean
	hasError: boolean
}

export function BreakdownSummary({
	groupBy,
	month,
	view,
	isLoading,
	hasError
}: BreakdownSummaryProps) {
	const { top } = view
	const dash = summary.empty
	const showValues = !hasError && top !== null
	const topLabel = top ? getItemLabel(top.label, groupBy) : null

	const topValue = showValues && topLabel && (
		<span className={cn(topLabel.isPlaceholder && "italic text-iron-gray")}>
			{topLabel.text}
		</span>
	)
	const topSub =
		showValues && top ? (
			<>
				<span className="hidden md:inline">
					{formatCurrency(top.total)} · {formatShare(top.share)}{" "}
					{summary.ofTheMonth}
				</span>
				<span className="md:hidden">
					{formatShare(top.share)} · {formatCurrency(top.total)}
				</span>
			</>
		) : null

	return (
		<section className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-8">
			<SummaryCard
				label={summary.top[groupBy]}
				icon={Trophy}
				value={topValue || dash}
				sub={topSub}
				isLoading={isLoading}
			/>
			<SummaryCard
				label={summary.count[groupBy]}
				icon={Layers}
				value={showValues ? view.rows.length : dash}
				sub={
					showValues ? (
						<>
							<span className="hidden md:inline">{summary.countSub}</span>
							<span className="md:hidden">{summary.countSubShort}</span>
						</>
					) : null
				}
				isLoading={isLoading}
			/>
			<SummaryCard
				label={summary.total}
				icon={DollarSign}
				value={hasError ? dash : formatCurrency(view.monthTotal)}
				sub={
					hasError ? null : `${formatMonthLabel(month)} · ${summary.totalSub}`
				}
				isLoading={isLoading}
				variant="total"
				className="col-span-2 order-first md:col-span-1 md:order-last"
			/>
		</section>
	)
}
