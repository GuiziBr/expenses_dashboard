import Cookies from "js-cookie"

/**
 * Get the auth token from cookies.
 * Works on both Client and Server (via dynamic import).
 */
export async function getAuthToken(): Promise<string | undefined> {
	// Client-side
	if (typeof window !== "undefined") {
		return Cookies.get("auth_token")
	}

	// Server-side
	try {
		const { cookies } = await import("next/headers")
		const cookieStore = await cookies()
		return cookieStore.get("auth_token")?.value
	} catch (error) {
		console.error("Failed to get auth token on server:", error)
		return undefined
	}
}

/**
 * Get the user from cookies.
 */
export async function getUser<T>(): Promise<T | undefined> {
	if (typeof window !== "undefined") {
		const user = Cookies.get("user")
		return user ? JSON.parse(user) : undefined
	}

	try {
		const { cookies } = await import("next/headers")
		const cookieStore = await cookies()
		const user = cookieStore.get("user")?.value
		return user ? JSON.parse(user) : undefined
	} catch (error) {
		console.error("Failed to get user on server:", error)
		return undefined
	}
}

/**
 * Set the auth token in cookies.
 */
export function setAuthToken(token: string) {
	if (typeof window !== "undefined") {
		Cookies.set("auth_token", token, {
			expires: 7, // 7 days
			path: "/",
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax"
		})
	}
}

/**
 * Set the user in cookies.
 */
export function setUser(user: unknown) {
	if (typeof window !== "undefined") {
		Cookies.set("user", JSON.stringify(user), {
			expires: 7,
			path: "/",
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax"
		})
	}
}

/**
 * Remove the auth token and user.
 */
export function removeAuthToken() {
	if (typeof window !== "undefined") {
		Cookies.remove("auth_token", { path: "/" })
		Cookies.remove("user", { path: "/" })
	}
}
