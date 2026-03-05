"use client"

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient
} from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatPaymentType } from "@/lib/format-expense"
import type {
	FormattedPaymentType,
	PaymentType,
	PaymentTypeQueryParams
} from "@/types/expenses"

interface UsePaymentTypesResult {
	paymentTypes: FormattedPaymentType[]
	totalCount: number
}

function buildPaymentTypeSearchParams(params: PaymentTypeQueryParams): string {
	const entries: [string, string][] = []
	entries.push(["offset", String(params.offset)])
	entries.push(["limit", String(params.limit)])
	return new URLSearchParams(entries).toString()
}

export function usePaymentTypes(params: PaymentTypeQueryParams) {
	return useQuery<UsePaymentTypesResult>({
		queryKey: ["paymentTypes", params],
		queryFn: async () => {
			const qs = buildPaymentTypeSearchParams(params)
			const { data, totalCount } = await api.getWithHeaders<PaymentType[]>(
				`paymentType?${qs}`
			)

			return {
				paymentTypes: data.map((pt) => formatPaymentType(pt)),
				totalCount
			}
		},
		placeholderData: keepPreviousData,
		staleTime: 30_000
	})
}

export function useCreatePaymentType() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			description,
			hasStatement
		}: {
			description: string
			hasStatement: boolean
		}) => {
			return api.post("paymentType", {
				description,
				hasStatement
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["paymentTypes"] })
			queryClient.invalidateQueries({ queryKey: ["paymentType"] })
		}
	})
}

export function useUpdatePaymentType() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			description,
			hasStatement
		}: {
			id: string
			description: string
			hasStatement: boolean
		}) => {
			return api.patch(`paymentType/${id}`, {
				description,
				hasStatement
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["paymentTypes"] })
			queryClient.invalidateQueries({ queryKey: ["paymentType"] })
		}
	})
}

export function useDeletePaymentType() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			return api.delete(`paymentType/${id}`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["paymentTypes"] })
			queryClient.invalidateQueries({ queryKey: ["paymentType"] })
		}
	})
}
