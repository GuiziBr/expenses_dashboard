import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Add paths that don't require authentication
const publicPaths = ["/", "/login", "/signup", "/api/public"]

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Check if the path is public
	if (publicPaths.some((path) => pathname.startsWith(path))) {
		return NextResponse.next()
	}

	// Placeholder for future auth logic
	// For now, allow all requests to proceed
	return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)"
	]
}
