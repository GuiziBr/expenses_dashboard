"use client"

import { useEffect } from "react"
import { Header } from "@/components/Header"
import { useConsolidatedBalance } from "@/hooks/use-consolidated-balance"

export default function ConsolidatedBalance() {
	const currentYear = new Date().getFullYear()
	const currentMonth = new Date().getMonth() + 1 // 1-indexed

	const { data, isLoading, error } = useConsolidatedBalance(
		currentYear,
		currentMonth
	)

	useEffect(() => {
		if (data) {
			console.log("Consolidated Balance Data:", data)
		}
		if (error) {
			console.error("Error fetching consolidated balance:", error)
		}
	}, [data, error])

	return (
		<div className="min-h-screen bg-background">
			<div className="bg-light-blue pb-32">
				<Header />
			</div>
			<div className="container mx-auto p-4">
				{isLoading && <p>Loading consolidated balance...</p>}
			</div>
		</div>
	)
}
