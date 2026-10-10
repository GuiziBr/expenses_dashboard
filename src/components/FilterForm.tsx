"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { translations } from "@/constants/translations"
import { useFilterValues } from "@/hooks/use-filter-values"
import { COLUMN_FILTERS } from "@/lib/constants"
import { getErrorMessage } from "@/lib/get-error-message"
import type { ExpenseFilters } from "@/types/expenses"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { SelectMenu, type SelectOption } from "./ui/select-menu"

interface FilterFormProps {
	onSubmit: (filters: ExpenseFilters) => void
	initialFilters: ExpenseFilters
}

export function FilterForm({ onSubmit, initialFilters }: FilterFormProps) {
	const [filterBy, setFilterBy] = useState<string>("")
	const [filterValue, setFilterValue] = useState<string>("")
	const [startDate, setStartDate] = useState<string>(
		initialFilters.startDate || ""
	)
	const [endDate, setEndDate] = useState<string>(initialFilters.endDate || "")

	// Date constraints logic
	const [minEndDate, setMinEndDate] = useState<string>("")
	const [maxStartDate, setMaxStartDate] = useState<string>("")

	const {
		data: filterOptions = [],
		isLoading: isLoadingOptions,
		error: filterOptionsError
	} = useFilterValues(filterBy)

	// The month picker in the top bar resets the range from outside
	useEffect(() => {
		setStartDate(initialFilters.startDate || "")
		setEndDate(initialFilters.endDate || "")
		setMinEndDate("")
		setMaxStartDate("")
	}, [initialFilters.startDate, initialFilters.endDate])

	useEffect(() => {
		if (filterOptionsError) {
			toast.error(
				getErrorMessage(
					filterOptionsError,
					translations.common.errorLoadingOptions
				)
			)
		}
	}, [filterOptionsError])

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault()
		onSubmit({
			filterBy,
			filterValue,
			startDate,
			endDate
		})
	}

	const handleFilterByChange = (value: string) => {
		setFilterBy(value)
		setFilterValue("") // Reset value when category changes
	}

	return (
		<section className="flex w-full flex-col items-center justify-start gap-4 lg:flex-row">
			<form
				onSubmit={handleSubmit}
				className="flex flex-col lg:flex-row items-center justify-start gap-3 w-full lg:w-auto"
			>
				{/* Filters Group */}
				<div className="flex gap-2 w-full lg:w-auto">
					<SelectMenu
						name="filterBy"
						options={COLUMN_FILTERS as unknown as SelectOption[]}
						placeholder={translations.filters.filterBy}
						className="flex-1 lg:w-36"
						value={filterBy}
						onValueChange={handleFilterByChange}
					/>
					<SelectMenu
						name="filterValue"
						options={filterOptions}
						placeholder={translations.filters.filterValue}
						className="flex-1 lg:w-44"
						disabled={!filterBy || isLoadingOptions}
						value={filterValue}
						onValueChange={setFilterValue}
					/>
				</div>

				{/* Inputs Group */}
				<div className="flex gap-2 w-full lg:w-auto">
					<Input
						type="date"
						name="startDate"
						className="flex-1 lg:w-44"
						value={startDate}
						max={maxStartDate}
						onChange={(e) => {
							setStartDate(e.target.value)
							setMinEndDate(e.target.value)
						}}
					/>
					<Input
						type="date"
						name="endDate"
						className="flex-1 lg:w-44"
						value={endDate}
						min={minEndDate}
						onChange={(e) => {
							setEndDate(e.target.value)
							setMaxStartDate(e.target.value)
						}}
					/>
				</div>

				<Button
					type="submit"
					variant="outline"
					className="h-10 w-full font-semibold lg:w-[5.5rem]"
				>
					{translations.common.search}
				</Button>
			</form>
		</section>
	)
}
