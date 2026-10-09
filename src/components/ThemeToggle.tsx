"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { translations } from "@/constants/translations"
import { useTheme } from "@/providers/theme-provider"

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme()
	const isDark = theme === "dark"

	return (
		<Button
			variant="outline"
			size="icon"
			type="button"
			onClick={toggleTheme}
			aria-label={
				isDark
					? translations.theme.switchToLight
					: translations.theme.switchToDark
			}
		>
			{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
		</Button>
	)
}
