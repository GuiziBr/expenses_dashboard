"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface PaginationProps {
	currentPage: number
	setCurrentPage: (page: number) => void
	pages: number[]
}

export function Pagination({
	currentPage,
	setCurrentPage,
	pages
}: PaginationProps) {
	const pageNumberLimit = 10
	const [maxPageNumberLimit, setMaxPageNumberLimit] = useState(pageNumberLimit)
	const [minPageNumberLimit, setMinPageNumberLimit] = useState(0)

	const handleNextButton = () => {
		setCurrentPage(currentPage + 1)
		if (currentPage + 1 > maxPageNumberLimit) {
			setMaxPageNumberLimit(maxPageNumberLimit + pageNumberLimit)
			setMinPageNumberLimit(minPageNumberLimit + pageNumberLimit)
		}
	}

	const handlePreviousButton = () => {
		setCurrentPage(currentPage - 1)
		if ((currentPage - 1) % pageNumberLimit === 0) {
			setMaxPageNumberLimit(maxPageNumberLimit - pageNumberLimit)
			setMinPageNumberLimit(minPageNumberLimit - pageNumberLimit)
		}
	}

	return (
		<div className="mb-8 flex w-full justify-center md:mt-4">
			<div className="flex gap-2">
				<button
					type="button"
					onClick={handlePreviousButton}
					disabled={currentPage <= 1}
					className={cn(
						"px-3 py-1 cursor-pointer hover:brightness-75 transition-all text-light-gray disabled:opacity-50 disabled:pointer-events-none"
					)}
				>
					Previous
				</button>

				{pages.map((page) => {
					if (page < maxPageNumberLimit + 1 && page > minPageNumberLimit) {
						const isSelected = page === currentPage
						return (
							<button
								type="button"
								key={page}
								onClick={() => setCurrentPage(page)}
								className={cn(
									"px-3 py-1 cursor-pointer hover:brightness-75 transition-all",
									isSelected
										? "bg-orange text-white rounded-[0.3rem] pointer-events-none"
										: "text-light-gray"
								)}
							>
								{page}
							</button>
						)
					}
					return null
				})}

				<button
					type="button"
					onClick={handleNextButton}
					disabled={currentPage === pages.length || pages.length === 0}
					className={cn(
						"px-3 py-1 cursor-pointer hover:brightness-75 transition-all text-light-gray disabled:opacity-50 disabled:pointer-events-none"
					)}
				>
					Next
				</button>
			</div>
		</div>
	)
}
