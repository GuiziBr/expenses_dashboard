"use client"

import { ChevronDown, ChevronUp, LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const PAGE_TITLES: Record<string, string> = {
	"/sharedDashboard": "Shared Dashboard",
	"/personalDashboard": "Personal Dashboard",
	"/consolidatedBalance": "Consolidated Balance"
}

export function Header() {
	const [isManagementOpen, setIsManagementOpen] = useState(false)
	const pathname = usePathname()
	const { signOut } = useAuth()

	const getClassName = (path: string) =>
		pathname === path ? "text-orange" : "text-white hover:text-orange/60"

	const getPageTitle = () => {
		if (pathname?.startsWith("/management")) return "Management"
		return PAGE_TITLES[pathname] ?? "Dashboard"
	}

	return (
		<div className="bg-[var(--light-blue)] py-8">
			<header className="max-w-[1120px] mx-auto px-5 flex items-center justify-between relative">
				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-8">
					<Link
						href="/sharedDashboard"
						className={cn(
							"text-base transition-opacity duration-200 no-underline font-medium",
							getClassName("/sharedDashboard")
						)}
					>
						Shared Dashboard
					</Link>
					<Link
						href="/personalDashboard"
						className={cn(
							"text-base transition-opacity duration-200 no-underline font-medium",
							getClassName("/personalDashboard")
						)}
					>
						Personal Dashboard
					</Link>
					<Link
						href="/consolidatedBalance"
						className={cn(
							"text-base transition-opacity duration-200 no-underline font-medium",
							getClassName("/consolidatedBalance")
						)}
					>
						Consolidated Balance
					</Link>
				</nav>

				{/* Desktop Right Side */}
				<nav className="hidden md:flex items-center gap-8">
					<DropdownMenu onOpenChange={setIsManagementOpen}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								type="button"
								className={cn(
									"bg-transparent border-none outline-none flex items-center gap-1 transition-colors duration-200 cursor-pointer text-base font-medium px-0 hover:bg-transparent",
									isManagementOpen || pathname?.startsWith("/management")
										? "text-orange"
										: "text-white hover:text-orange/60"
								)}
							>
								Management
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
							<DropdownMenuItem
								asChild
								className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white"
							>
								<Link href="/management/users" className="w-full">
									Users
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								asChild
								className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white"
							>
								<Link href="/management/categories" className="w-full">
									Categories
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								asChild
								className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white"
							>
								<Link href="/management/settings" className="w-full">
									Settings
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						variant="ghost"
						type="button"
						onClick={() => signOut()}
						className="bg-transparent border-none outline-none text-white hover:text-orange/60 transition-colors duration-200 text-base font-medium flex items-center gap-2 px-0 hover:bg-transparent"
					>
						Logout
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
						<DropdownMenuItem
							asChild
							className="focus:bg-white/10 focus:text-white cursor-pointer px-4 py-3"
						>
							<Link
								href="/sharedDashboard"
								className={cn(
									"text-lg font-medium w-full",
									getClassName("/sharedDashboard")
								)}
							>
								Shared Dashboard
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							asChild
							className="focus:bg-white/10 focus:text-white cursor-pointer px-4 py-3"
						>
							<Link
								href="/personalDashboard"
								className={cn(
									"text-lg font-medium w-full",
									getClassName("/personalDashboard")
								)}
							>
								Personal Dashboard
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							asChild
							className="focus:bg-white/10 focus:text-white cursor-pointer px-4 py-3"
						>
							<Link
								href="/consolidatedBalance"
								className={cn(
									"text-lg font-medium w-full",
									getClassName("/consolidatedBalance")
								)}
							>
								Consolidated Balance
							</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator className="bg-white/10 my-2" />

						<div className="px-4 pt-2 pb-1 text-white/40 text-xs uppercase tracking-wider font-bold">
							Management
						</div>
						<DropdownMenuItem
							asChild
							className="focus:bg-white/10 focus:text-white cursor-pointer px-6 py-2"
						>
							<Link href="/management/users" className="w-full">
								Users
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							asChild
							className="focus:bg-white/10 focus:text-white cursor-pointer px-6 py-2"
						>
							<Link href="/management/categories" className="w-full">
								Categories
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							asChild
							className="focus:bg-white/10 focus:text-white cursor-pointer px-6 py-2"
						>
							<Link href="/management/settings" className="w-full">
								Settings
							</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator className="bg-white/10 my-2" />

						<DropdownMenuItem
							onClick={() => signOut()}
							className="focus:bg-white/10 focus:text-orange text-orange font-bold cursor-pointer px-4 py-3 flex items-center justify-between"
						>
							Logout
							<LogOut className="w-5 h-5" />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Mobile Logo / Page Title */}
				<div className="md:hidden font-bold text-white text-lg">
					{getPageTitle()}
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
