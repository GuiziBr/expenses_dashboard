"use client"

import { Check, ChevronDown } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"
import type * as React from "react"

import { cn } from "@/lib/utils"
import type { SelectOption } from "./select"

export interface SelectMenuProps {
	options: SelectOption[]
	value: string
	onValueChange: (value: string) => void
	placeholder?: string
	icon?: React.ElementType
	name?: string
	id?: string
	disabled?: boolean
	error?: string
	className?: string
}

const getLabel = (option: SelectOption) => option.description || option.name

/**
 * A select that renders its own popover list (Radix Select) instead of the
 * operating system's picker, so the menu follows the app theme.
 */
export function SelectMenu({
	options,
	value,
	onValueChange,
	placeholder,
	icon: Icon,
	name,
	id,
	disabled,
	error,
	className
}: SelectMenuProps) {
	return (
		<SelectPrimitive.Root
			value={value}
			onValueChange={onValueChange}
			name={name}
			disabled={disabled}
		>
			<SelectPrimitive.Trigger
				id={id}
				aria-invalid={!!error}
				className={cn(
					"flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-input bg-card px-3 text-left text-sm text-foreground shadow-xs outline-none transition-colors",
					"focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30",
					"data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-ring/30",
					"data-[placeholder]:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
					error && "border-danger text-danger",
					className
				)}
			>
				{Icon && (
					<Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
				)}
				<span className="min-w-0 flex-1 truncate">
					<SelectPrimitive.Value placeholder={placeholder} />
				</span>
				<SelectPrimitive.Icon asChild>
					<ChevronDown
						className="size-4 shrink-0 text-muted-foreground"
						aria-hidden="true"
					/>
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>

			<SelectPrimitive.Portal>
				<SelectPrimitive.Content
					position="popper"
					sideOffset={6}
					align="start"
					className={cn(
						"z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md",
						"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
					)}
				>
					<SelectPrimitive.Viewport className="p-1">
						{options.map((option) => (
							<SelectPrimitive.Item
								key={option.id}
								value={option.id}
								className="relative flex w-full cursor-pointer items-center rounded-md py-2 pr-8 pl-2 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
							>
								<SelectPrimitive.ItemText>
									{getLabel(option)}
								</SelectPrimitive.ItemText>
								<SelectPrimitive.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
									<Check className="size-4 text-primary-text" aria-hidden="true" />
								</SelectPrimitive.ItemIndicator>
							</SelectPrimitive.Item>
						))}
					</SelectPrimitive.Viewport>
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	)
}
