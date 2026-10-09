"use client"

import { ChevronDown, ChevronUp, LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { translations } from "@/constants/translations"
import { useAuth } from "@/contexts/auth-context"
import {
	getPageTitle,
	isManagementPath,
	isNavItemActive,
	MAIN_NAV_ITEMS,
	MANAGEMENT_NAV_ITEMS
} from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function Header() {
	const [isManagementOpen, setIsManagementOpen] = useState(false)
	const pathname = usePathname()
	const { signOut } = useAuth()

	const getClassName = (href: string) =>
		isNavItemActive(pathname, href)
			? "text-orange"
			: "text-white hover:text-orange/60"

	return (
		<div className="bg-[var(--light-blue)] py-8">
			<header className="max-w-[1120px] mx-auto px-5 flex items-center justify-between relative">
				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-8">
					{MAIN_NAV_ITEMS.map(({ href, label }) => (
						<Link
							key={href}
							href={href}
							className={cn(
								"text-base transition-opacity duration-200 no-underline font-medium",
								getClassName(href)
							)}
						>
							{label}
						</Link>
					))}
				</nav>

				{/* Desktop Right Side */}
				<nav className="hidden md:flex items-center gap-8">
					<ThemeToggle className="text-white hover:bg-white/10 hover:text-white" />
					<DropdownMenu onOpenChange={setIsManagementOpen}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								type="button"
								className={cn(
									"bg-transparent border-none outline-none flex items-center gap-1 transition-colors duration-200 cursor-pointer text-base font-medium px-0 hover:bg-transparent",
									isManagementOpen || isManagementPath(pathname)
										? "text-orange"
										: "text-white hover:text-orange/60"
								)}
							>
								{translations.common.management}
								{isManagementOpen ? (
									<ChevronUp className="w-4 h-4" />
								) : (
									<ChevronDown className="w-4 h-4" />
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="bg-[var(--light-blue)] border-none text-white min-w-[160px]"
						>
							{MANAGEMENT_NAV_ITEMS.map(({ href, label }) => (
								<DropdownMenuItem
									key={href}
									asChild
									className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white"
								>
									<Link href={href} className="w-full">
										{label}
									</Link>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						variant="ghost"
						type="button"
						onClick={() => signOut()}
						className="bg-transparent border-none outline-none text-white hover:text-orange/60 transition-colors duration-200 text-base font-medium flex items-center gap-2 px-0 hover:bg-transparent"
					>
						{translations.common.logout}
						<LogOut className="w-4 h-4" />
					</Button>
				</nav>

				{/* Mobile Toggle & Menu (Lighter Dropdown Version) */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							type="button"
							className="md:hidden text-white hover:bg-transparent"
						>
							<Menu className="w-6 h-6" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						className="w-[calc(100vw-40px)] md:hidden bg-[var(--light-blue)] border-none text-white p-2 shadow-xl mt-2 z-50"
					>
						{MAIN_NAV_ITEMS.map(({ href, label }) => (
							<DropdownMenuItem
								key={href}
								asChild
								className="focus:bg-white/10 focus:text-white cursor-pointer px-4 py-3"
							>
								<Link
									href={href}
									className={cn(
										"text-lg font-medium w-full",
										getClassName(href)
									)}
								>
									{label}
								</Link>
							</DropdownMenuItem>
						))}

						<DropdownMenuSeparator className="bg-white/10 my-2" />

						<div className="px-4 pt-2 pb-1 text-white/40 text-xs uppercase tracking-wider font-bold">
							{translations.common.management}
						</div>
						{MANAGEMENT_NAV_ITEMS.map(({ href, label }) => (
							<DropdownMenuItem
								key={href}
								asChild
								className="focus:bg-white/10 focus:text-white cursor-pointer px-6 py-2"
							>
								<Link href={href} className="w-full">
									{label}
								</Link>
							</DropdownMenuItem>
						))}

						<DropdownMenuSeparator className="bg-white/10 my-2" />

						<DropdownMenuItem
							onClick={() => signOut()}
							className="focus:bg-white/10 focus:text-orange text-orange font-bold cursor-pointer px-4 py-3 flex items-center justify-between"
						>
							{translations.common.logout}
							<LogOut className="w-5 h-5" />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Mobile Logo / Page Title */}
				<div className="md:hidden font-bold text-white text-lg">
					{getPageTitle(pathname)}
				</div>

				{/* Mobile Logout (Icon only) */}
				<Button
					variant="ghost"
					size="icon"
					type="button"
					onClick={() => signOut()}
					className="md:hidden hover:text-orange"
				>
					<LogOut className="w-6 h-6" />
				</Button>
			</header>
		</div>
	)
}
