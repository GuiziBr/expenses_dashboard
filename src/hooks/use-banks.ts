"use client"

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient
} from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatBank } from "@/lib/format-expense"
import type { Bank, BankQueryParams, FormattedBank } from "@/types/expenses"

interface UseBanksResult {
	banks: FormattedBank[]
	totalCount: number
}

function buildBankSearchParams(params: BankQueryParams): string {
	const entries: [string, string][] = []
	entries.push(["offset", String(params.offset)])
	entries.push(["limit", String(params.limit)])
	return new URLSearchParams(entries).toString()
}

export function useBanks(params: BankQueryParams) {
	return useQuery<UseBanksResult>({
		queryKey: ["banks", params],
		queryFn: async () => {
			const qs = buildBankSearchParams(params)
			const { data, totalCount } = await api.getWithHeaders<Bank[]>(
				`banks?${qs}`
			)

			return {
				banks: data.map((bank) => formatBank(bank)),
				totalCount
			}
		},
		placeholderData: keepPreviousData,
		staleTime: 30_000
	})
}

export function useCreateBank() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (name: string) => {
			return api.post("banks", { name })
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["banks"] })
		}
	})
}
