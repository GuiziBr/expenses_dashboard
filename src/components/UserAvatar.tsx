"use client"

import { useState } from "react"
import { getInitials } from "@/lib/get-initials"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
	name?: string | null
	src?: string | null
	className?: string
}

/** The user's picture, or their initials when there is none or it fails to load. */
export function UserAvatar({ name, src, className }: UserAvatarProps) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null)
	const showImage = !!src && src !== failedSrc

	return (
		<span
			aria-hidden="true"
			className={cn(
				"flex size-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-xs font-bold text-primary-text",
				className
			)}
		>
			{showImage ? (
				// biome-ignore lint/performance/noImgElement: avatar URLs come from arbitrary hosts, so next/image would need every host allow-listed
				<img
					src={src}
					alt=""
					referrerPolicy="no-referrer"
					onError={() => setFailedSrc(src)}
					className="size-full object-cover"
				/>
			) : (
				getInitials(name)
			)}
		</span>
	)
}
