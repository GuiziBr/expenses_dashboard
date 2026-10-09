"use client"

import {
	ChevronDown,
	ChevronsUpDown,
	LogOut,
	Settings2,
	Wallet
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useState } from "react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { translations } from "@/constants/translations"
import { useAuth } from "@/contexts/auth-context"
import { getInitials } from "@/lib/get-initials"
import {
	isManagementPath,
	isNavItemActive,
	MANAGEMENT_NAV_ITEMS,
	NAV_GROUPS,
	type NavItem
} from "@/lib/navigation"
import { cn } from "@/lib/utils"

const ITEM_CLASS =
	"flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium no-underline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"

const itemClass = (isActive: boolean) =>
	cn(
		ITEM_CLASS,
		isActive
			? "bg-primary-soft font-semibold text-primary-text"
			: "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
	)

function SidebarLink({
	item,
	isActive,
	indented
}: {
	item: NavItem
	isActive: boolean
	indented?: boolean
}) {
	const Icon = item.icon
	return (
		<Link
			href={item.href}
			aria-current={isActive ? "page" : undefined}
			className={cn(itemClass(isActive), indented && "pl-5")}
		>
			<Icon className="size-[18px] shrink-0" aria-hidden="true" />
			{item.label}
		</Link>
	)
}

function SectionTitle({ id, children }: { id: string; children: string }) {
	return (
		<p
			id={id}
			className="px-3 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
		>
			{children}
		</p>
	)
}

function ManagementSection({ pathname }: { pathname: string | null }) {
	const titleId = useId()
	const listId = useId()
	const isCurrentSection = isManagementPath(pathname)
	const [isOpen, setIsOpen] = useState(isCurrentSection)

	useEffect(() => {
		if (isCurrentSection) setIsOpen(true)
	}, [isCurrentSection])

	return (
		<div>
			<SectionTitle id={titleId}>{translations.navigation.manage}</SectionTitle>
			<button
				type="button"
				aria-expanded={isOpen}
				aria-controls={listId}
				onClick={() => setIsOpen((open) => !open)}
				className={cn(
					ITEM_CLASS,
					"cursor-pointer",
					isCurrentSection && !isOpen
						? "text-primary-text"
						: "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
				)}
			>
				<Settings2 className="size-[18px] shrink-0" aria-hidden="true" />
				<span className="flex-1 text-left">
					{translations.common.management}
				</span>
				<ChevronDown
					className={cn(
						"size-4 shrink-0 transition-transform",
						isOpen && "rotate-180"
					)}
					aria-hidden="true"
				/>
			</button>
			{isOpen && (
				<ul id={listId} aria-labelledby={titleId} className="mt-1 space-y-1">
					{MANAGEMENT_NAV_ITEMS.map((item) => (
						<li key={item.href}>
							<SidebarLink
								item={item}
								isActive={isNavItemActive(pathname, item.href)}
								indented
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

function UserMenu() {
	const { user, signOut } = useAuth()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={translations.navigation.userMenu}
				className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-sidebar-border p-2.5 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring"
			>
				<span
					aria-hidden="true"
					className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-text"
				>
					{getInitials(user?.name)}
				</span>
				<span className="min-w-0 flex-1">
					<span className="block truncate text-[13px] font-semibold text-sidebar-foreground">
						{user?.name}
					</span>
					<span className="block text-[11px] text-muted-foreground">
						{translations.navigation.account}
					</span>
				</span>
				<ChevronsUpDown
					className="size-4 shrink-0 text-muted-foreground"
					aria-hidden="true"
				/>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				side="top"
				align="start"
				className="w-(--radix-dropdown-menu-trigger-width)"
			>
				{user?.email && (
					<>
						<DropdownMenuLabel className="truncate font-normal text-muted-foreground">
							{user.email}
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
					</>
				)}
				<DropdownMenuItem onSelect={() => signOut()} className="cursor-pointer">
					<LogOut aria-hidden="true" />
					{translations.common.logout}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export function AppSidebar({ className }: { className?: string }) {
	const pathname = usePathname()
	const groupId = useId()

	return (
		<aside
			className={cn(
				"flex h-full w-[248px] shrink-0 flex-col gap-1 border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground",
				className
			)}
		>
			<div className="flex items-center gap-2.5 px-2 pb-5">
				<span
					aria-hidden="true"
					className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
				>
					<Wallet className="size-[18px]" />
				</span>
				<span className="text-[17px] font-bold tracking-tight">
					{translations.common.appName}
				</span>
			</div>

			<nav
				aria-label={translations.navigation.mainLabel}
				className="flex-1 overflow-y-auto"
			>
				{NAV_GROUPS.map((group) => {
					const titleId = `${groupId}-${group.id}`
					return (
						<div key={group.id}>
							<SectionTitle id={titleId}>{group.label}</SectionTitle>
							<ul aria-labelledby={titleId} className="space-y-1">
								{group.items.map((item) => (
									<li key={item.href}>
										<SidebarLink
											item={item}
											isActive={isNavItemActive(pathname, item.href)}
										/>
									</li>
								))}
							</ul>
						</div>
					)
				})}
				<ManagementSection pathname={pathname} />
			</nav>

			<UserMenu />
		</aside>
	)
}
