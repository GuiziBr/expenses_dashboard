import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import * as React from "react"

export interface SelectOption {
	id: string
	description?: string
	name?: string
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
					"flex h-11 w-full items-center rounded-md bg-container-background border-2 border-container-background px-3 text-sm shadow-sm transition-colors focus-within:border-orange text-input-text",
					error && "border-red text-red",
					className
				)}
			>
				{Icon && <Icon className="mr-2 h-5 w-5 text-iron-gray" />}
				<select
					className="h-full w-full bg-transparent p-0 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
					ref={ref}
					{...props}
				>
					{placeholder && (
						<option
							value=""
							disabled
							className="bg-container-background text-iron-gray"
						>
							{placeholder}
						</option>
					)}
					{options.map((option) => (
						<option
							key={option.id}
							value={option.id}
							className="bg-container-background text-input-text"
						>
							{option.description || option.name}
						</option>
					))}
				</select>
				{error && (
					<div className="relative flex items-center group ml-2 h-5">
						<AlertCircle className="h-5 w-5 shrink-0 text-red" />
						<span
							role="alert"
							className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-red text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
						>
							{error}
							<div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-t-red border-x-transparent border-b-transparent" />
						</span>
					</div>
				)}
			</div>
		)
	}
)
Select.displayName = "Select"

export { Select }
