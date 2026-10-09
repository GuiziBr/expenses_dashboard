import { AppSidebar } from "@/components/AppSidebar"
import { BottomTabBar } from "@/components/BottomTabBar"

export default function AppLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className="min-h-screen bg-background lg:flex">
			<AppSidebar className="sticky top-0 hidden h-screen lg:flex" />
			<div className="min-w-0 flex-1 py-8 pb-28 lg:pb-12">{children}</div>
			<BottomTabBar className="lg:hidden" />
		</div>
	)
}
