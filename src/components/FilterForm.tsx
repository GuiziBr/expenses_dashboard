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
	const [filterBy, setFilterBy] = useState<string>(
		initialFilters.filterBy || ""
	)
	const [filterValue, setFilterValue] = useState<string>(
		initialFilters.filterValue || ""
	)
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

	// The month picker and the URL (back/forward) change the filters from outside
	useEffect(() => {
		setFilterBy(initialFilters.filterBy || "")
		setFilterValue(initialFilters.filterValue || "")
		setStartDate(initialFilters.startDate || "")
		setEndDate(initialFilters.endDate || "")
		setMinEndDate("")
		setMaxStartDate("")
	}, [
		initialFilters.filterBy,
		initialFilters.filterValue,
		initialFilters.startDate,
		initialFilters.endDate
	])

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
		<section className="w-full">
			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-5"
			>
				{/* Each group spans one column, like the balance cards above */}
				<div className="flex gap-2">
					<SelectMenu
						name="filterBy"
						options={COLUMN_FILTERS as unknown as SelectOption[]}
						placeholder={translations.filters.filterBy}
						className="min-w-0 flex-1"
						value={filterBy}
						onValueChange={handleFilterByChange}
					/>
					<SelectMenu
						name="filterValue"
						options={filterOptions}
						placeholder={translations.filters.filterValue}
						className="min-w-0 flex-1"
						disabled={!filterBy || isLoadingOptions}
						value={filterValue}
						onValueChange={setFilterValue}
					/>
				</div>

				{/* Inputs Group */}
				<div className="flex gap-2">
					<Input
						type="date"
						name="startDate"
						className="min-w-0 flex-1"
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
						className="min-w-0 flex-1"
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
					className="h-10 w-full font-semibold md:w-[5.5rem]"
				>
					{translations.common.search}
				</Button>
			</form>
		</section>
	)
}
