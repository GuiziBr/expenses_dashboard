import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
	const token = request.cookies.get("auth_token")?.value
	const { pathname } = request.nextUrl

	// Public routes (accessible only when NOT logged in)
	const isPublicRoute = pathname === "/"

	// If logged in and trying to access a public route, redirect to dashboard
	if (token && isPublicRoute) {
		return NextResponse.redirect(new URL("/sharedDashboard", request.url))
	}

	// If NOT logged in and trying to access a protected route, redirect to login
	// Add other protected routes to this check as needed
	if (!token && !isPublicRoute) {
		return NextResponse.redirect(new URL("/", request.url))
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
