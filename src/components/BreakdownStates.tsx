import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { translations } from "@/constants/translations"

const { breakdown } = translations.dashboards

export function BreakdownError({ onRetry }: { onRetry: () => void }) {
	return (
		<div
			role="alert"
			className="flex flex-col items-center justify-center gap-3 py-16"
		>
			<TriangleAlert className="h-8 w-8 text-danger" />
			<p className="text-sm text-muted-foreground">{breakdown.error}</p>
			<Button variant="outline" size="sm" onClick={onRetry}>
				{breakdown.retry}
			</Button>
		</div>
	)
}

export function BreakdownEmpty({ monthLabel }: { monthLabel: string }) {
	return (
		<p className="py-16 text-center text-sm text-muted-foreground">
			{breakdown.emptyMonth} {monthLabel}.
		</p>
	)
}

export function BreakdownSkeleton() {
	return (
		<div className="flex flex-col gap-2" aria-hidden="true">
			{Array.from({ length: 5 }).map((_, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
					key={index}
					className="h-12 rounded-md bg-muted animate-pulse"
				/>
			))}
		</div>
	)
}
