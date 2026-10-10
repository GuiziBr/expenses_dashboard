"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { MONTH_PARAM } from "@/hooks/use-selected-month"
import { isValidMonthParam } from "@/lib/balance-breakdown-params"
import { isMonthRoute } from "@/lib/navigation"

type MonthAwareLinkProps = React.ComponentProps<typeof Link> & { href: string }

function CarryMonthLink({ href, ...props }: MonthAwareLinkProps) {
	const month = useSearchParams().get(MONTH_PARAM)
	const target = isValidMonthParam(month)
		? `${href}?${MONTH_PARAM}=${month}`
		: href

	return <Link href={target} {...props} />
}

/**
 * A link that keeps the selected month when it points at another page that
 * follows the month. Other links render as plain links.
 */
export function MonthAwareLink({ href, ...props }: MonthAwareLinkProps) {
	if (!isMonthRoute(href)) return <Link href={href} {...props} />

	return (
		<Suspense fallback={<Link href={href} {...props} />}>
			<CarryMonthLink href={href} {...props} />
		</Suspense>
	)
}
