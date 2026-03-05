import { AlertCircle, LucideIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	icon?: LucideIcon | React.ElementType
	error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, icon: Icon, error, ...props }, ref) => {
		return (
			<div
				className={cn(
					"flex h-11 w-full items-center rounded-md bg-container-background border-2 border-container-background px-3 text-base shadow-sm transition-colors focus-within:border-orange text-input-text",
					error && "border-red text-red",
					className
				)}
			>
				{Icon && <Icon className="mr-2 h-5 w-5 text-iron-gray shrink-0" />}
				<input
					type={type}
					className="flex-1 bg-transparent border-none p-0 h-full w-full text-input-text focus:outline-none focus:ring-0 placeholder:text-iron-gray"
					ref={ref}
					{...props}
				/>
				{error && (
					<div className="relative flex items-center group ml-2 h-5 shrink-0">
						<AlertCircle className="h-5 w-5 text-red" />
						<span
							role="alert"
							className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-red text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg"
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
Input.displayName = "Input"

export { Input }
