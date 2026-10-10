"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from "@/components/ui/tooltip"
import { translations } from "@/constants/translations"
import { THEME_SWITCHING_ENABLED } from "@/lib/theme"
import { cn } from "@/lib/utils"
import { useTheme } from "@/providers/theme-provider"

interface ThemeToggleProps {
	disabled?: boolean
	className?: string
}

export function ThemeToggle({
	disabled = !THEME_SWITCHING_ENABLED,
	className
}: ThemeToggleProps) {
	const { theme, toggleTheme } = useTheme()
	const isDark = theme === "dark"

	const button = (
		<Button
			variant="ghost"
			size="icon"
			type="button"
			onClick={disabled ? undefined : toggleTheme}
			aria-disabled={disabled}
			className={cn(disabled && "opacity-50 cursor-not-allowed", className)}
			aria-label={
				isDark
					? translations.theme.switchToLight
					: translations.theme.switchToDark
			}
		>
			{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
		</Button>
	)

	if (!disabled) return button

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent>{translations.theme.comingSoon}</TooltipContent>
		</Tooltip>
	)
}
