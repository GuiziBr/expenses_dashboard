"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import type { ToasterProps } from "sonner"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="dark"
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-container-background group-[.toaster]:text-input-text group-[.toaster]:border-iron-gray group-[.toaster]:shadow-lg group-[.toaster]:rounded-md group-[.toaster]:p-4",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
					cancelButton:
						"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
					success: "group-[.toast]:text-green-500",
					error: "group-[.toast]:text-red"
				}
			}}
			icons={{
				success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
				error: <XCircle className="h-5 w-5 text-red" />
			}}
			{...props}
		/>
	)
}

export { Toaster }
