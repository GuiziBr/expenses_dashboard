"use client"

import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function ConsolidatedBalance() {
	const { user } = useAuth()

	return (
		<div className="min-h-screen bg-background">
			<div className="bg-light-blue pb-32">
				<Header />
			</div>
		</div>
	)
}
