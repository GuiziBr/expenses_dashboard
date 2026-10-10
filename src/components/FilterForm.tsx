"use client"

import { useEffect, useState } from "react"
import { HiOutlineSelector } from "react-icons/hi"
import { toast } from "sonner"
import { translations } from "@/constants/translations"
import { useFilterValues } from "@/hooks/use-filter-values"
import { COLUMN_FILTERS } from "@/lib/constants"
import { getErrorMessage } from "@/lib/get-error-message"
import type { ExpenseFilters } from "@/types/expenses"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, type SelectOption } from "./ui/select"

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

	const handleFilterByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value
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
					<Select
						icon={HiOutlineSelector}
						name="filterBy"
						options={COLUMN_FILTERS as unknown as SelectOption[]}
						placeholder={translations.filters.filterBy}
						className="flex-1 lg:w-36"
						value={filterBy}
						onChange={handleFilterByChange}
					/>
					<Select
						icon={HiOutlineSelector}
						name="filterValue"
						options={filterOptions}
						placeholder={translations.filters.filterValue}
						className="flex-1 lg:w-44"
						disabled={!filterBy || isLoadingOptions}
						value={filterValue}
						onChange={(e) => setFilterValue(e.target.value)}
					/>
				</div>

				{/* Inputs Group */}
				<div className="flex gap-2 w-full lg:w-auto">
					<div className="relative flex-1 lg:w-44 h-10 flex items-center bg-card rounded-lg border border-input px-3 shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
						<Input
							type="date"
							name="startDate"
							className="bg-transparent border-none p-0 h-full w-full text-foreground focus-visible:ring-0 text-sm"
							value={startDate}
							max={maxStartDate}
							onChange={(e) => {
								setStartDate(e.target.value)
								setMinEndDate(e.target.value)
							}}
						/>
					</div>
					<div className="relative flex-1 lg:w-44 h-10 flex items-center bg-card rounded-lg border border-input px-3 shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
						<Input
							type="date"
							name="endDate"
							className="bg-transparent border-none p-0 h-full w-full text-foreground focus-visible:ring-0 text-sm"
							value={endDate}
							min={minEndDate}
							onChange={(e) => {
								setEndDate(e.target.value)
								setMaxStartDate(e.target.value)
							}}
						/>
					</div>
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
