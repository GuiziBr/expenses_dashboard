import type { LucideProps } from "lucide-react"
import type React from "react"
import { cn } from "@/lib/utils"

type BalanceTone = "income" | "outcome" | "neutral"

interface BalanceCardProps {
	label: string
	value: string
	icon: React.ElementType<LucideProps>
	tone?: BalanceTone
	variant?: "default" | "total"
	className?: string
}

const CHIP_CLASS: Record<BalanceTone, string> = {
	income: "bg-success-soft text-success",
	outcome: "bg-danger-soft text-danger",
	neutral: "bg-primary-soft text-primary-text"
}

export function BalanceCard({
	label,
	value,
	icon: Icon,
	tone = "neutral",
	variant = "default",
	className
}: BalanceCardProps) {
	const isTotal = variant === "total"

	return (
		<div
			className={cn(
				"flex flex-col gap-3 rounded-xl border p-4 text-center font-[family-name:var(--font-roboto)] md:p-5 md:text-left",
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
						isTotal ? "bg-white/20 text-primary-foreground" : CHIP_CLASS[tone]
					)}
				>
					<Icon className="size-4" />
				</span>
			</header>
			<p className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
				{value}
			</p>
		</div>
	)
}
