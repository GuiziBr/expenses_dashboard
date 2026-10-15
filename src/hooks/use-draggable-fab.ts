"use client"

import {
	type CSSProperties,
	type PointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState
} from "react"

type Side = "left" | "right"

interface FabPosition {
	side: Side
	top: number
}

const STORAGE_KEY = "expenses:create-fab-position"
const SIZE = 56
const EDGE_MARGIN = 20
const MIN_TOP = 16
/** Keeps the button clear of the fixed bottom tab bar. */
const BOTTOM_RESERVED = 100
const DRAG_THRESHOLD = 6

const clampTop = (top: number) =>
	Math.min(
		Math.max(top, MIN_TOP),
		Math.max(MIN_TOP, window.innerHeight - SIZE - BOTTOM_RESERVED)
	)

const leftFor = (side: Side) =>
	side === "left" ? EDGE_MARGIN : window.innerWidth - SIZE - EDGE_MARGIN

const readStored = (): FabPosition | null => {
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
		if (
			(parsed?.side === "left" || parsed?.side === "right") &&
			typeof parsed.top === "number"
		) {
			return { side: parsed.side, top: parsed.top }
		}
	} catch {}
	return null
}

const writeStored = (position: FabPosition) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(position))
	} catch {}
}

/**
 * Lets a fixed floating button be dragged anywhere, then snaps it to the
 * nearest horizontal edge and remembers where it was left. Until it has been
 * moved, `style` is undefined so the button keeps its default CSS position.
 */
export function useDraggableFab() {
	const [position, setPosition] = useState<FabPosition | null>(null)
	const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(
		null
	)
	const [, setViewportVersion] = useState(0)
	const grab = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 })
	const hasMoved = useRef(false)

	useEffect(() => {
		setPosition(readStored())
		const onResize = () => setViewportVersion((version) => version + 1)
		window.addEventListener("resize", onResize)
		return () => window.removeEventListener("resize", onResize)
	}, [])

	const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
		const rect = event.currentTarget.getBoundingClientRect()
		grab.current = {
			startX: event.clientX,
			startY: event.clientY,
			offsetX: event.clientX - rect.left,
			offsetY: event.clientY - rect.top
		}
		hasMoved.current = false
		event.currentTarget.setPointerCapture?.(event.pointerId)
	}, [])

	const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
		if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) return
		const { startX, startY, offsetX, offsetY } = grab.current
		if (
			!hasMoved.current &&
			Math.hypot(event.clientX - startX, event.clientY - startY) <
				DRAG_THRESHOLD
		) {
			return
		}
		hasMoved.current = true
		setDragPoint({
			x: event.clientX - offsetX,
			y: event.clientY - offsetY
		})
	}, [])

	const onPointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
		event.currentTarget.releasePointerCapture?.(event.pointerId)
		if (!hasMoved.current) return
		const { offsetX, offsetY } = grab.current
		const centerX = event.clientX - offsetX + SIZE / 2
		const next: FabPosition = {
			side: centerX < window.innerWidth / 2 ? "left" : "right",
			top: clampTop(event.clientY - offsetY)
		}
		setDragPoint(null)
		setPosition(next)
		writeStored(next)
	}, [])

	const onPointerCancel = useCallback(() => setDragPoint(null), [])

	/** True right after a drag, so the click that follows it can be ignored. */
	const consumeDrag = useCallback(() => {
		const wasDrag = hasMoved.current
		hasMoved.current = false
		return wasDrag
	}, [])

	let style: CSSProperties | undefined
	if (dragPoint) {
		style = {
			left: dragPoint.x,
			top: dragPoint.y,
			right: "auto",
			bottom: "auto",
			transition: "none"
		}
	} else if (position) {
		style = {
			left: leftFor(position.side),
			top: clampTop(position.top),
			right: "auto",
			bottom: "auto"
		}
	}

	return {
		style,
		isDragging: dragPoint !== null,
		consumeDrag,
		handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel }
	}
}
