"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { translations } from "@/constants/translations"
import { useTheme } from "@/providers/theme-provider"

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, toggleTheme } = useTheme()
	const isDark = theme === "dark"

	return (
		<Button
			variant="ghost"
			size="icon"
			type="button"
			onClick={toggleTheme}
			className={className}
			aria-label={
				isDark
					? translations.theme.switchToLight
					: translations.theme.switchToDark
			}
		>
			{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
		</Button>
	)
}
