import { AlertCircle, Calendar, Loader2 } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { SelectMenu } from "@/components/ui/select-menu"
import { translations } from "@/constants/translations"
import { SHARED_BALANCE_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface ConsolidatedFiltersProps {
	onSearch: (filters: { date: string }) => void
	balanceType: string
	onBalanceTypeChange: (type: string) => void
	isLoading?: boolean
}

export function ConsolidatedFilters({
	onSearch,
	balanceType,
	onBalanceTypeChange,
	isLoading
}: ConsolidatedFiltersProps) {
	const [date, setDate] = React.useState("")
	const [errors, setErrors] = React.useState<{ [key: string]: string }>({})

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault()

		const newErrors: { [key: string]: string } = {}
		if (!balanceType)
			newErrors.balanceType = translations.dashboards.consolidated.typeRequired
		if (!date)
			newErrors.date = translations.dashboards.consolidated.monthRequired

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		setErrors({})
		onSearch({ date })
	}

	return (
		<section>
			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-5"
				noValidate
			>
				{/* Same columns as the balance cards above */}
				{/* Select Container */}
				<div>
					<SelectMenu
						name="balanceType"
						options={SHARED_BALANCE_TYPES}
						placeholder={translations.dashboards.consolidated.selectType}
						value={balanceType}
						onValueChange={(value) => {
							onBalanceTypeChange(value)
							if (errors.balanceType)
								setErrors((prev) => ({ ...prev, balanceType: "" }))
						}}
						error={errors.balanceType}
					/>
				</div>

				{/* Input Container */}
				<div
					className={cn(
						"relative flex h-10 items-center rounded-lg border border-input bg-card px-3 shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30",
						errors.date && "border-danger text-danger"
					)}
				>
					<div className="text-muted-foreground">
						<Calendar className={cn("size-4", errors.date && "text-danger")} />
					</div>
					<input
						type="month"
						name="date"
						value={date}
						onChange={(e) => {
							setDate(e.target.value)
							if (errors.date) setErrors((prev) => ({ ...prev, date: "" }))
						}}
						className="h-full min-w-0 flex-1 appearance-none bg-transparent pl-2 pr-2 text-sm text-foreground outline-none"
					/>
					{errors.date && (
						<div className="relative flex items-center group h-5">
							<AlertCircle className="h-5 w-5 shrink-0 text-danger" />
							<span
								role="alert"
								className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
							>
								{errors.date}
								<div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-t-destructive border-x-transparent border-b-transparent" />
							</span>
						</div>
					)}
				</div>

				{/* Button */}
				<Button
					type="submit"
					disabled={isLoading}
					variant="outline"
					className="col-span-2 h-10 w-full font-semibold md:col-span-1 md:w-[5.5rem]"
				>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						translations.common.search
					)}
				</Button>
			</form>
		</section>
	)
}
