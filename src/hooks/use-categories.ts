"use client"

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient
} from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatCategory } from "@/lib/format-expense"
import type {
	Category,
	CategoryQueryParams,
	FormattedCategory
} from "@/types/expenses"

interface UseCategoriesResult {
	categories: FormattedCategory[]
	totalCount: number
}

function buildCategorySearchParams(params: CategoryQueryParams): string {
	const entries: [string, string][] = []
	entries.push(["offset", String(params.offset)])
	entries.push(["limit", String(params.limit)])
	return new URLSearchParams(entries).toString()
}

export function useCategories(params: CategoryQueryParams) {
	return useQuery<UseCategoriesResult>({
		queryKey: ["categories-management", params],
		queryFn: async () => {
			const qs = buildCategorySearchParams(params)
			const { data, totalCount } = await api.getWithHeaders<Category[]>(
				`categories?${qs}`
			)

			return {
				categories: data.map((cat) => formatCategory(cat)),
				totalCount
			}
		},
		placeholderData: keepPreviousData,
		staleTime: 30_000
	})
}

export function useCreateCategory() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (description: string) => {
			return api.post("categories", { description })
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories-management"] })
			queryClient.invalidateQueries({ queryKey: ["categories"] }) // Also refresh filter options
		}
	})
}

export function useUpdateCategory() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			description
		}: {
			id: string
			description: string
		}) => {
			return api.patch(`categories/${id}`, { description })
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories-management"] })
			queryClient.invalidateQueries({ queryKey: ["categories"] })
		}
	})
}

export function useDeleteCategory() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			return api.delete(`categories/${id}`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories-management"] })
			queryClient.invalidateQueries({ queryKey: ["categories"] })
		}
	})
}
