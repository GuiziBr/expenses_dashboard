import {
	ChartPie,
	CreditCard,
	Landmark,
	type LucideIcon,
	Scale,
	Store,
	Tags,
	User,
	Users
} from "lucide-react"
import { translations } from "@/constants/translations"

export interface NavItem {
	label: string
	href: string
	icon: LucideIcon
}

export interface NavGroup {
	id: "dashboards" | "reports"
	label: string
	items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
	{
		id: "dashboards",
		label: translations.navigation.dashboards,
		items: [
			{
				label: translations.dashboards.shared.title,
				href: "/sharedDashboard",
				icon: Users
			},
			{
				label: translations.dashboards.personal.title,
				href: "/personalDashboard",
				icon: User
			}
		]
	},
	{
		id: "reports",
		label: translations.navigation.reports,
		items: [
			{
				label: translations.dashboards.consolidated.title,
				href: "/consolidatedBalance",
				icon: Scale
			},
			{
				label: translations.dashboards.breakdown.title,
				href: "/balanceBreakdown",
				icon: ChartPie
			}
		]
	}
]

export const MAIN_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(
	(group) => group.items
)

export const MANAGEMENT_ROUTE = "/management"

export const MANAGEMENT_NAV_ITEMS: NavItem[] = [
	{
		label: translations.management.banks,
		href: `${MANAGEMENT_ROUTE}/banks`,
		icon: Landmark
	},
	{
		label: translations.management.categories,
		href: `${MANAGEMENT_ROUTE}/categories`,
		icon: Tags
	},
	{
		label: translations.management.paymentTypes,
		href: `${MANAGEMENT_ROUTE}/paymentTypes`,
		icon: CreditCard
	},
	{
		label: translations.management.stores,
		href: `${MANAGEMENT_ROUTE}/stores`,
		icon: Store
	}
]

export const isManagementPath = (pathname: string | null) =>
	pathname === MANAGEMENT_ROUTE ||
	!!pathname?.startsWith(`${MANAGEMENT_ROUTE}/`)

export const isNavItemActive = (pathname: string | null, href: string) =>
	pathname === href

export const getPageTitle = (pathname: string | null) => {
	if (isManagementPath(pathname)) return translations.common.management
	return (
		MAIN_NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Dashboard"
	)
}
