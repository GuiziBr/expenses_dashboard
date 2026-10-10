"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

interface PageToolbarContextValue {
	isCustomRange: boolean
	setIsCustomRange: (value: boolean) => void
}

const PageToolbarContext = createContext<PageToolbarContextValue>({
	isCustomRange: false,
	setIsCustomRange: () => {}
})

/** Lets a page tell the top bar that it is not showing one whole month. */
export function PageToolbarProvider({
	children
}: {
	children: React.ReactNode
}) {
	const [isCustomRange, setIsCustomRange] = useState(false)
	const value = useMemo(
		() => ({ isCustomRange, setIsCustomRange }),
		[isCustomRange]
	)

	return (
		<PageToolbarContext.Provider value={value}>
			{children}
		</PageToolbarContext.Provider>
	)
}

export const usePageToolbar = () => useContext(PageToolbarContext)

export function useCustomRangeIndicator(isCustomRange: boolean) {
	const { setIsCustomRange } = usePageToolbar()

	useEffect(() => {
		setIsCustomRange(isCustomRange)
		return () => setIsCustomRange(false)
	}, [isCustomRange, setIsCustomRange])
}
