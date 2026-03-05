import { AlertCircle, Calendar, ChevronDown, Loader2 } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
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
		<section className="mt-12 flex justify-end md:mt-8 items-center">
			<form
				onSubmit={handleSubmit}
				className="flex flex-col md:flex-row items-center justify-center w-full md:w-auto gap-2 md:gap-1"
				noValidate
			>
				{/* Inputs Row */}
				<div className="flex flex-row gap-2 w-full md:w-auto">
					{/* Select Container */}
					<div className="flex-1 md:w-[15rem]">
						<Select
							icon={ChevronDown}
							name="balanceType"
							options={SHARED_BALANCE_TYPES}
							placeholder={translations.dashboards.consolidated.selectType}
							value={balanceType}
							onChange={(e) => {
								onBalanceTypeChange(e.target.value)
								if (errors.balanceType)
									setErrors((prev) => ({ ...prev, balanceType: "" }))
							}}
							error={errors.balanceType}
							className="px-2 md:px-4 text-input-text text-xs md:text-sm border-container-background"
						/>
					</div>

					{/* Input Container */}
					<div
						className={cn(
							"flex-1 md:w-[14rem] relative flex items-center h-11 rounded-md bg-container-background border-2 border-container-background px-3 transition-colors focus-within:border-orange",
							errors.date && "border-red text-red"
						)}
					>
						<div className="text-iron-gray">
							<Calendar
								className={cn(
									"h-4 w-4 md:h-5 md:w-5",
									errors.date && "text-red"
								)}
							/>
						</div>
						<input
							type="month"
							name="date"
							value={date}
							onChange={(e) => {
								setDate(e.target.value)
								if (errors.date) setErrors((prev) => ({ ...prev, date: "" }))
							}}
							className="h-full w-full bg-transparent pl-2 pr-2 pt-1 text-xs md:text-sm text-input-text shadow-sm outline-none appearance-none"
						/>
						{errors.date && (
							<div className="relative flex items-center group h-5">
								<AlertCircle className="h-5 w-5 shrink-0 text-red" />
								<span
									role="alert"
									className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-red text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
								>
									{errors.date}
									<div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-t-red border-x-transparent border-b-transparent" />
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Button */}
				<Button
					type="submit"
					disabled={isLoading}
					className="h-10 w-full md:w-[5.5rem] bg-orange text-background text-xs md:text-sm font-medium hover:brightness-90 transition-all rounded-[0.3rem] border-none"
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
