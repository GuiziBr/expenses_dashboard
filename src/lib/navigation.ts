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

const findMainItem = (href: string) => {
	const item = MAIN_NAV_ITEMS.find((candidate) => candidate.href === href)
	if (!item) throw new Error(`Unknown navigation route: ${href}`)
	return item
}

export const MOBILE_TAB_ITEMS: NavItem[] = [
	{
		...findMainItem("/sharedDashboard"),
		label: translations.navigation.tabs.shared
	},
	{
		...findMainItem("/personalDashboard"),
		label: translations.navigation.tabs.personal
	},
	{
		...findMainItem("/consolidatedBalance"),
		label: translations.navigation.tabs.balance
	}
]

export const MORE_NAV_ITEMS: NavItem[] = MAIN_NAV_ITEMS.filter(
	(item) => !MOBILE_TAB_ITEMS.some((tab) => tab.href === item.href)
)

export const isManagementPath = (pathname: string | null) =>
	pathname === MANAGEMENT_ROUTE ||
	!!pathname?.startsWith(`${MANAGEMENT_ROUTE}/`)

export const isNavItemActive = (pathname: string | null, href: string) =>
	pathname === href

export const isMoreTabActive = (pathname: string | null) =>
	isManagementPath(pathname) ||
	MORE_NAV_ITEMS.some((item) => isNavItemActive(pathname, item.href))

export const getPageTitle = (pathname: string | null) => {
	if (isManagementPath(pathname)) return translations.common.management
	return (
		MAIN_NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Dashboard"
	)
}

export const MONTH_ROUTES = [
	"/sharedDashboard",
	"/personalDashboard",
	"/balanceBreakdown"
]

const CREATE_EXPENSE_ROUTES = ["/sharedDashboard", "/personalDashboard"]

/** Balance Breakdown is left out: its group-by tabs are already sticky on mobile. */
const STICKY_MONTH_ROUTES = ["/sharedDashboard", "/personalDashboard"]

/** Pages that follow the month picked in the top bar. */
export const isMonthRoute = (pathname: string | null) =>
	!!pathname && MONTH_ROUTES.includes(pathname)

export const getPageMeta = (pathname: string | null) => ({
	title: getPageTitle(pathname),
	hasMonthPicker: isMonthRoute(pathname),
	hasStickyMonthPicker: !!pathname && STICKY_MONTH_ROUTES.includes(pathname),
	canCreateExpense: !!pathname && CREATE_EXPENSE_ROUTES.includes(pathname)
})
