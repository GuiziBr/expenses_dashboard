import type { LucideProps } from "lucide-react"
import type React from "react"
import { cn } from "@/lib/utils"

interface BalanceCardProps {
	label: string
	value: string
	icon: React.ElementType<LucideProps>
	iconClassName?: string
	variant?: "default" | "total"
}

export function BalanceCard({
	label,
	value,
	icon: Icon,
	iconClassName,
	variant = "default"
}: BalanceCardProps) {
	const isTotal = variant === "total"

	return (
		<div
			className={cn(
				"px-8 py-6 rounded-[0.3rem] font-[family-name:var(--font-roboto)] flex flex-col items-center md:items-start",
				isTotal ? "bg-orange text-white" : "bg-white text-blue-wood"
			)}
		>
			<header className="flex items-center justify-between w-full">
				<p className="text-base">{label}</p>
				<Icon className={cn("w-8 h-8", iconClassName)} strokeWidth={1.5} />
			</header>
			<p className="mt-4 text-[2.25rem] font-normal leading-[3.5rem] text-center md:text-left w-full">
				{value}
			</p>
		</div>
	)
}
