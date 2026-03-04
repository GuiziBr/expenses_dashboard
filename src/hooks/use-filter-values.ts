"use client"

import { useQuery } from "@tanstack/react-query"
import type { SelectOption } from "@/components/ui/select"
import { api } from "@/lib/api"

/**
 * Hook to fetch available values for a specific filter type.
 *
 * @param filterType The API endpoint segment (e.g. "categories", "banks")
 */
export function useFilterValues(filterType?: string) {
	return useQuery<SelectOption[]>({
		queryKey: ["filter-values", filterType],
		queryFn: async () => {
			if (!filterType) return []
			return api.get<SelectOption[]>(filterType)
		},
		enabled: !!filterType,
		staleTime: 5 * 60 * 1000 // 5 minutes cache
	})
}
