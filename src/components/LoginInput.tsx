import { AlertCircle, LucideIcon } from "lucide-react"
import React, { forwardRef, useState } from "react"
import { useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"

interface LoginInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string
	icon?: LucideIcon
	containerClassName?: string
}

const LoginInput = forwardRef<HTMLInputElement, LoginInputProps>(
	({ name, icon: Icon, containerClassName, className, ...props }, ref) => {
		const {
			register,
			formState: { errors },
			watch
		} = useFormContext()

		const [isFocused, setIsFocused] = useState(false)
		const value = watch(name)
		const isFilled = !!value
		const error = errors[name]

		return (
			<div
				className={cn(
					"flex items-center w-full p-4 rounded-[0.3rem] border-2 border-container-background bg-container-background text-iron-gray transition-colors duration-300",
					error && "border-red text-red",
					isFocused && "border-light-orange text-light-orange",
					!error && isFilled && "text-light-orange",
					containerClassName
				)}
			>
				{Icon && <Icon className="mr-4 h-5 w-5" />}
				<input
					{...props}
					{...register(name, {
						onBlur: (e) => {
							setIsFocused(false)
							props.onBlur?.(e)
						}
					})}
					onFocus={(e) => {
						setIsFocused(true)
						props.onFocus?.(e)
					}}
					aria-label={props.placeholder || name}
					aria-invalid={!!error}
					aria-describedby={error ? `${name}-error` : undefined}
					className={cn(
						"flex-1 bg-transparent border-0 text-input-text placeholder:text-iron-gray focus:outline-none focus:ring-0",
						className
					)}
					ref={(e) => {
						register(name).ref(e)
						if (typeof ref === "function") {
							ref(e)
						} else if (ref) {
							;(ref as React.RefObject<HTMLInputElement | null>).current = e
						}
					}}
				/>
				{error && (
					<div className="relative flex items-center group ml-4 h-5">
						<AlertCircle className="h-5 w-5 shrink-0 text-red" />
						<span
							id={`${name}-error`}
							role="alert"
							className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-red text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
						>
							{error.message as string}
							<div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-t-red border-x-transparent border-b-transparent" />
						</span>
					</div>
				)}
			</div>
		)
	}
)

LoginInput.displayName = "LoginInput"

export { LoginInput }
