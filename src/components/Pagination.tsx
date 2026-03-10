"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { translations } from "@/constants/translations"
import { cn } from "@/lib/utils"

interface PaginationProps {
	currentPage: number
	setCurrentPage: (page: number) => void
	pages: number[]
}

function getVisiblePages(
	currentPage: number,
	totalPages: number
): (number | "...")[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1)
	}

	const delta = 1
	const left = currentPage - delta
	const right = currentPage + delta
	const result: (number | "...")[] = [1]

	if (left > 2) result.push("...")

	for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) {
		result.push(i)
	}

	if (right < totalPages - 1) result.push("...")

	result.push(totalPages)
	return result
}

export function Pagination({
	currentPage,
	setCurrentPage,
	pages
}: PaginationProps) {
	const totalPages = pages.length

	if (totalPages <= 1) return null

	const visiblePages = getVisiblePages(currentPage, totalPages)

	return (
		<div className="mb-8 flex w-full justify-center md:mt-4">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => setCurrentPage(currentPage - 1)}
					disabled={currentPage <= 1}
					aria-label={translations.common.previous}
					className="px-2 py-1 cursor-pointer hover:brightness-75 transition-all text-light-gray disabled:opacity-50 disabled:pointer-events-none"
				>
					<ChevronLeft className="h-4 w-4 md:hidden" />
					<span className="hidden md:inline">
						{translations.common.previous}
					</span>
				</button>

				{visiblePages.map((page, index) => {
					if (page === "...") {
						return (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: ellipsis markers have no stable key
								key={`ellipsis-${index}`}
								className="px-1 py-1 text-light-gray select-none"
							>
								&hellip;
							</span>
						)
					}

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
				})}

				<button
					type="button"
					onClick={() => setCurrentPage(currentPage + 1)}
					disabled={currentPage === totalPages}
					aria-label={translations.common.next}
					className="px-2 py-1 cursor-pointer hover:brightness-75 transition-all text-light-gray disabled:opacity-50 disabled:pointer-events-none"
				>
					<ChevronRight className="h-4 w-4 md:hidden" />
					<span className="hidden md:inline">{translations.common.next}</span>
				</button>
			</div>
		</div>
	)
}
