import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import * as React from "react"

export interface SelectOption {
	id: string
	description?: string
	name?: string
	has_statement?: boolean
}

export interface SelectProps
	extends React.SelectHTMLAttributes<HTMLSelectElement> {
	icon?: React.ElementType
	options: SelectOption[]
	placeholder?: string
	error?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ className, icon: Icon, options, placeholder, error, ...props }, ref) => {
		return (
			<div
				className={cn(
					"flex h-10 w-full items-center rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30",
					error && "border-destructive text-destructive",
					className
				)}
			>
				{Icon && <Icon className="mr-2 size-4 shrink-0 text-muted-foreground" />}
				<select
					className="h-full w-full bg-transparent p-0 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
					ref={ref}
					{...props}
				>
					{placeholder && (
						<option
							value=""
							disabled
							className="bg-card text-muted-foreground"
						>
							{placeholder}
						</option>
					)}
					{options.map((option) => (
						<option
							key={option.id}
							value={option.id}
							className="bg-card text-foreground"
						>
							{option.description || option.name}
						</option>
					))}
				</select>
				{error && (
					<div className="relative flex items-center group ml-2 h-5">
						<AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
						<span
							role="alert"
							className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-destructive text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
						>
							{error}
							<div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-t-destructive border-x-transparent border-b-transparent" />
						</span>
					</div>
				)}
			</div>
		)
	}
)
Select.displayName = "Select"

export { Select }
