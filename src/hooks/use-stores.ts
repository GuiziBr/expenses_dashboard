"use client"

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient
} from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatStore } from "@/lib/format-expense"
import type { FormattedStore, Store, StoreQueryParams } from "@/types/expenses"

interface UseStoresResult {
	stores: FormattedStore[]
	totalCount: number
}

function buildStoreSearchParams(params: StoreQueryParams): string {
	const entries: [string, string][] = []
	entries.push(["offset", String(params.offset)])
	entries.push(["limit", String(params.limit)])
	return new URLSearchParams(entries).toString()
}

export function useStores(params: StoreQueryParams) {
	return useQuery<UseStoresResult>({
		queryKey: ["stores", params],
		queryFn: async () => {
			const qs = buildStoreSearchParams(params)
			const { data, totalCount } = await api.getWithHeaders<Store[]>(
				`stores?${qs}`
			)

			return {
				stores: data.map((store) => formatStore(store)),
				totalCount
			}
		},
		placeholderData: keepPreviousData,
		staleTime: 30_000
	})
}

export function useCreateStore() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (name: string) => {
			return api.post("stores", { name })
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stores"] })
		}
	})
}

export function useUpdateStore() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, name }: { id: string; name: string }) => {
			return api.patch(`stores/${id}`, { name })
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stores"] })
		}
	})
}

export function useDeleteStore() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			return api.delete(`stores/${id}`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stores"] })
		}
	})
}
