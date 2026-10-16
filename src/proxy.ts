import { type NextRequest, NextResponse } from "next/server"
import {
	buildSignInUrl,
	DEFAULT_AUTHENTICATED_PATH,
	getSafeRedirect,
	REDIRECT_PARAM
} from "@/lib/redirect"

export async function proxy(request: NextRequest) {
	const rawToken = request.cookies.get("auth_token")?.value
	const { pathname, search } = request.nextUrl

	// Treat malformed or expired tokens as absent
	const isValidToken = (() => {
		if (typeof rawToken !== "string") return false
		const parts = rawToken.split(".")
		if (parts.length !== 3) return false
		try {
			const payload = JSON.parse(
				atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
			)
			if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now())
				return false
		} catch {
			return false
		}
		return true
	})()

	const token = isValidToken ? rawToken : undefined

	// Public routes (accessible only when NOT logged in)
	const isPublicRoute = pathname === "/"

	// If logged in and trying to access a public route, redirect to dashboard
	if (token && isPublicRoute) {
		const destination =
			getSafeRedirect(request.nextUrl.searchParams.get(REDIRECT_PARAM)) ??
			DEFAULT_AUTHENTICATED_PATH
		return NextResponse.redirect(new URL(destination, request.url))
	}

	// If NOT logged in and trying to access a protected route, redirect to login,
	// remembering the full URL (including filters) to return to after signing in
	if (!token && !isPublicRoute) {
		return NextResponse.redirect(
			new URL(buildSignInUrl(`${pathname}${search}`), request.url)
		)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - assets (public assets)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|assets).*)"
	]
}
