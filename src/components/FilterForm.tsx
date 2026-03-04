"use client"

import { useState } from "react"
import { HiOutlineSelector } from "react-icons/hi"
import { translations } from "@/constants/translations"
import { useFilterValues } from "@/hooks/use-filter-values"
import { COLUMN_FILTERS } from "@/lib/constants"
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

	const { data: filterOptions = [], isLoading: isLoadingOptions } =
		useFilterValues(filterBy)

	const handleSubmit = (e: React.FormEvent) => {
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
		<section className="mt-6 w-full flex flex-col md:flex-row justify-between items-center gap-4">
			<form
				onSubmit={handleSubmit}
				className="flex flex-col md:flex-row items-center justify-end gap-3 w-full md:w-auto ml-auto"
			>
				{/* Filters Group */}
				<div className="flex gap-2 w-full md:w-auto">
					<Select
						icon={HiOutlineSelector}
						name="filterBy"
						options={COLUMN_FILTERS as unknown as SelectOption[]}
						placeholder={translations.filters.filterBy}
						className="md:w-36"
						value={filterBy}
						onChange={handleFilterByChange}
					/>
					<Select
						icon={HiOutlineSelector}
						name="filterValue"
						options={filterOptions}
						placeholder={translations.filters.filterValue}
						className="md:w-44"
						disabled={!filterBy || isLoadingOptions}
						value={filterValue}
						onChange={(e) => setFilterValue(e.target.value)}
					/>
				</div>

				{/* Inputs Group */}
				<div className="flex gap-2 w-full md:w-auto">
					<div className="relative w-1/2 md:w-40 h-11 flex items-center bg-container-background rounded-md border-2 border-container-background px-3 transition-colors focus-within:border-orange">
						{/* <MdDateRange className="mr-2 h-5 w-5 text-iron-gray shrink-0" /> */}
						<Input
							type="date"
							name="startDate"
							className="bg-transparent border-none p-0 h-full w-full text-input-text focus-visible:ring-0"
							value={startDate}
							max={maxStartDate}
							onChange={(e) => {
								setStartDate(e.target.value)
								setMinEndDate(e.target.value)
							}}
						/>
					</div>
					<div className="relative w-1/2 md:w-40 h-11 flex items-center bg-container-background rounded-md border-2 border-container-background px-3 transition-colors focus-within:border-orange">
						{/* <MdDateRange className="mr-2 h-5 w-5 text-iron-gray shrink-0" /> */}
						<Input
							type="date"
							name="endDate"
							className="bg-transparent border-none p-0 h-full w-full text-input-text focus-visible:ring-0"
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
					className="w-full md:w-36 h-11 font-bold text-base"
				>
					{translations.common.search}
				</Button>
			</form>
		</section>
	)
}
