"use client"

import { useState } from "react"
import { HiOutlineSelector, HiPlus } from "react-icons/hi"
import { translations } from "@/constants/translations"
import { useFilterValues } from "@/hooks/use-filter-values"
import { COLUMN_FILTERS } from "@/lib/constants"
import type { ExpenseFilters } from "@/types/expenses"
import { NewExpenseModal } from "./NewExpenseModal"
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
	const [isModalOpen, setIsModalOpen] = useState(false)

	// Date constraints logic
	const [minEndDate, setMinEndDate] = useState<string>("")
	const [maxStartDate, setMaxStartDate] = useState<string>("")

	const { data: filterOptions = [], isLoading: isLoadingOptions } =
		useFilterValues(filterBy)

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
		<section className="mt-6 w-full flex flex-col lg:flex-row justify-between items-center gap-4">
			<Button
				type="button"
				onClick={() => setIsModalOpen(true)}
				className="h-10 w-full lg:w-auto px-4 bg-orange text-background text-sm md:text-base font-medium hover:brightness-90 transition-all rounded-[0.3rem] border-none flex items-center justify-center gap-2"
			>
				<HiPlus className="size-5" />
				<span>{translations.createExpense.title}</span>
			</Button>

			<form
				onSubmit={handleSubmit}
				className="flex flex-col lg:flex-row items-center justify-end gap-3 w-full lg:w-auto ml-auto"
			>
				{/* Filters Group */}
				<div className="flex gap-2 w-full lg:w-auto">
					<Select
						icon={HiOutlineSelector}
						name="filterBy"
						options={COLUMN_FILTERS as unknown as SelectOption[]}
						placeholder={translations.filters.filterBy}
						className="flex-1 lg:w-36 text-sm md:text-base"
						value={filterBy}
						onChange={handleFilterByChange}
					/>
					<Select
						icon={HiOutlineSelector}
						name="filterValue"
						options={filterOptions}
						placeholder={translations.filters.filterValue}
						className="flex-1 lg:w-44 text-sm md:text-base"
						disabled={!filterBy || isLoadingOptions}
						value={filterValue}
						onChange={(e) => setFilterValue(e.target.value)}
					/>
				</div>

				{/* Inputs Group */}
				<div className="flex gap-2 w-full lg:w-auto">
					<div className="relative flex-1 lg:w-44 h-11 flex items-center bg-container-background rounded-md border-2 border-container-background px-3 transition-colors focus-within:border-orange">
						<Input
							type="date"
							name="startDate"
							className="bg-transparent border-none p-0 h-full w-full text-input-text focus-visible:ring-0 text-sm md:text-base"
							value={startDate}
							max={maxStartDate}
							onChange={(e) => {
								setStartDate(e.target.value)
								setMinEndDate(e.target.value)
							}}
						/>
					</div>
					<div className="relative flex-1 lg:w-44 h-11 flex items-center bg-container-background rounded-md border-2 border-container-background px-3 transition-colors focus-within:border-orange">
						<Input
							type="date"
							name="endDate"
							className="bg-transparent border-none p-0 h-full w-full text-input-text focus-visible:ring-0 text-sm md:text-base"
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
					className="h-10 w-full lg:w-[5.5rem] bg-orange text-background text-sm md:text-base font-medium hover:brightness-90 transition-all rounded-[0.3rem] border-none"
				>
					{translations.common.search}
				</Button>
			</form>

			<NewExpenseModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</section>
	)
}
