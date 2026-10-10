"use client"

import type { LucideIcon } from "lucide-react"
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight
} from "lucide-react"
import { translations } from "@/constants/translations"

interface PaginationProps {
	currentPage: number
	setCurrentPage: (page: number) => void
	pages: number[]
}

function PageButton({
	icon: Icon,
	label,
	disabled,
	onClick
}: {
	icon: LucideIcon
	label: string
	disabled: boolean
	onClick: () => void
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
		>
			<Icon className="size-4" aria-hidden="true" />
		</button>
	)
}

export function Pagination({
	currentPage,
	setCurrentPage,
	pages
}: PaginationProps) {
	const totalPages = pages.length

	if (totalPages <= 1) return null

	const isFirst = currentPage <= 1
	const isLast = currentPage >= totalPages
	const { common } = translations

	return (
		<>
			{/* Keeps the last rows clear of the fixed bar on desktop */}
			<div aria-hidden="true" className="hidden h-14 lg:block" />
			{/* On desktop the bar is pinned to the bottom of the viewport, left-aligned with the page content beside the sidebar (248px) */}
			<nav
				aria-label={common.pagination}
				className="flex w-full lg:pointer-events-none lg:fixed lg:right-0 lg:bottom-4 lg:left-[248px] lg:z-30 lg:w-auto"
			>
				<div className="mx-auto flex w-full max-w-[1120px] justify-start lg:px-5">
					<div className="flex items-center lg:pointer-events-auto lg:rounded-xl lg:border lg:border-border lg:bg-card lg:px-3 lg:py-1 lg:shadow-md">
						<p
							className="px-1 text-sm text-muted-foreground"
							aria-live="polite"
						>
							{common.page}{" "}
							<span className="font-semibold text-foreground">
								{currentPage}
							</span>{" "}
							{common.of}{" "}
							<span className="font-semibold text-foreground">
								{totalPages}
							</span>
						</p>
						<div className="flex items-center">
							<PageButton
								icon={ChevronsLeft}
								label={common.firstPage}
								disabled={isFirst}
								onClick={() => setCurrentPage(1)}
							/>
							<PageButton
								icon={ChevronLeft}
								label={common.previousPage}
								disabled={isFirst}
								onClick={() => setCurrentPage(currentPage - 1)}
							/>
							<PageButton
								icon={ChevronRight}
								label={common.nextPage}
								disabled={isLast}
								onClick={() => setCurrentPage(currentPage + 1)}
							/>
							<PageButton
								icon={ChevronsRight}
								label={common.lastPage}
								disabled={isLast}
								onClick={() => setCurrentPage(totalPages)}
							/>
						</div>
					</div>
				</div>
			</nav>
		</>
	)
}
