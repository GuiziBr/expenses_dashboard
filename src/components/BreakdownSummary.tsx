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
	// Known before the data arrives (e.g. "September 2026 · personal expenses"),
	// so it is shown as real text while loading. Without it, a short bar is shown.
	loadingSub?: React.ReactNode
	loadingValueWidth: string
	variant?: "default" | "total"
	className?: string
}

/**
 * A rounded bar sized in `em`, so inside a text line it takes the line's own
 * height and swapping it for real text never shifts the layout. Tinted to the
 * card it sits on, not the page.
 */
function SkeletonBar({
	tone,
	className
}: {
	tone: "default" | "total"
	className: string
}) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"inline-block h-[0.7em] animate-pulse rounded-full align-middle",
				tone === "total" ? "bg-white/30" : "bg-foreground/10",
				className
			)}
		/>
	)
}

function SummaryCard({
	label,
	icon: Icon,
	value,
	sub,
	isLoading,
	loadingSub,
	loadingValueWidth,
	variant = "default",
	className
}: SummaryCardProps) {
	const isTotal = variant === "total"
	const tone = isTotal ? "total" : "default"

	return (
		<div
			className={cn(
				"flex flex-col gap-2 rounded-xl border p-4 text-center md:gap-3 md:p-5 md:text-left",
				isTotal
					? "border-primary bg-primary text-primary-foreground"
					: "border-border bg-card text-card-foreground",
				className
			)}
		>
			<header className="flex items-center justify-between gap-2 text-left">
				<p
					className={cn(
						"text-[13px] font-medium",
						isTotal ? "text-primary-foreground/80" : "text-muted-foreground"
					)}
				>
					{label}
				</p>
				<span
					aria-hidden="true"
					className={cn(
						"flex size-8 shrink-0 items-center justify-center rounded-lg",
						isTotal
							? "bg-white/20 text-primary-foreground"
							: "bg-primary-soft text-primary-text"
					)}
				>
					<Icon className="size-4" />
				</span>
			</header>
			<div className="flex flex-col gap-1 min-w-0">
				<p className="truncate text-[1.375rem] font-semibold tracking-tight md:text-3xl">
					{isLoading ? (
						<SkeletonBar tone={tone} className={loadingValueWidth} />
					) : (
						value
					)}
				</p>
				<p
					className={cn(
						"text-xs md:text-sm",
						isTotal ? "text-primary-foreground/80" : "text-muted-foreground"
					)}
				>
					{isLoading
						? (loadingSub ?? <SkeletonBar tone={tone} className="w-2/5" />)
						: // Keeps the line's height when there is nothing to say (empty, error)
							(sub ?? "\u00A0")}
				</p>
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
		<span
			className={cn(topLabel.isPlaceholder && "italic text-muted-foreground")}
		>
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

	const countSub = (
		<>
			<span className="hidden md:inline">{summary.countSub}</span>
			<span className="md:hidden">{summary.countSubShort}</span>
		</>
	)
	const totalSub = `${formatMonthLabel(month)} · ${summary.totalSub}`

	return (
		<section
			aria-busy={isLoading}
			className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5"
		>
			<SummaryCard
				label={summary.top[groupBy]}
				icon={Trophy}
				value={topValue || dash}
				sub={topSub}
				isLoading={isLoading}
				loadingValueWidth="w-3/5"
			/>
			<SummaryCard
				label={summary.count[groupBy]}
				icon={Layers}
				value={showValues ? view.rows.length : dash}
				sub={showValues ? countSub : null}
				isLoading={isLoading}
				loadingSub={countSub}
				loadingValueWidth="w-10"
			/>
			<SummaryCard
				label={summary.total}
				icon={DollarSign}
				value={hasError ? dash : formatCurrency(view.monthTotal)}
				sub={hasError ? null : totalSub}
				isLoading={isLoading}
				loadingSub={totalSub}
				loadingValueWidth="w-1/2"
				variant="total"
				className="col-span-2 order-first md:col-span-1 md:order-last"
			/>
		</section>
	)
}
