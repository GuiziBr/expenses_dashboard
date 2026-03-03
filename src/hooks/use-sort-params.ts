"use client"

import { useState } from "react"
import { EXPENSE_COLUMNS } from "@/lib/constants"

type ColumnName = (typeof EXPENSE_COLUMNS)[keyof typeof EXPENSE_COLUMNS]

interface SortColumn {
	orderBy: ColumnName
	orderType: "asc" | "desc"
	isCurrent: boolean
}

interface UseSortParamsReturn {
	orderBy?: string
	orderType?: "asc" | "desc"
	toggleSort: (column: string) => void
	getSortIndicator: (column: string) => "↑" | "↓" | ""
}

/**
 * Manages column sort state.
 *
 * - Initialises all columns to `asc / isCurrent: false`.
 * - `toggleSort` flips `asc ↔ desc` when the same column is clicked; resets to `asc` for a new one.
 */
export function useSortParams(): UseSortParamsReturn {
	const [columns, setColumns] = useState<SortColumn[]>(
		Object.values(EXPENSE_COLUMNS).map((col) => ({
			orderBy: col,
			orderType: "asc",
			isCurrent: false
		}))
	)

	const current = columns.find((c) => c.isCurrent)

	const toggleSort = (column: string) => {
		setColumns((prev) =>
			prev.map((c) => {
				const isTarget = c.orderBy === column
				if (!isTarget) return { ...c, isCurrent: false }

				// If it's already current, toggle it. If it's new, set isCurrent=true and keep its orderType (default asc).
				return {
					...c,
					orderType: c.isCurrent
						? c.orderType === "asc"
							? "desc"
							: "asc"
						: "asc", // Always start with asc on a fresh click
					isCurrent: true
				}
			})
		)
	}

	const getSortIndicator = (column: string): "↑" | "↓" | "" => {
		const col = columns.find((c) => c.orderBy === column)
		if (!col?.isCurrent) return ""
		return col.orderType === "asc" ? "↑" : "↓"
	}

	return {
		orderBy: current?.orderBy,
		orderType: current?.orderType,
		toggleSort,
		getSortIndicator
	}
}
