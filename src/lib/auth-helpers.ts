import Cookies from "js-cookie"
import { AUTH_COOKIE_OPTIONS, COOKIE_NAME } from "./constants"

/**
 * Get the auth token from cookies.
 * Works on both Client and Server (via dynamic import).
 */
export async function getAuthToken(): Promise<string | undefined> {
	// Client-side
	if (typeof window !== "undefined") {
		return Cookies.get(COOKIE_NAME)
	}

	// Server-side
	try {
		const { cookies } = await import("next/headers")
		const cookieStore = await cookies()
		return cookieStore.get(COOKIE_NAME)?.value
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
		Cookies.set(COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)
	}
}

/**
 * Set the user in cookies.
 */
export function setUser(user: unknown) {
	if (typeof window !== "undefined") {
		Cookies.set("user", JSON.stringify(user), AUTH_COOKIE_OPTIONS)
	}
}

/**
 * Remove the auth token and user.
 */
export function removeAuthToken() {
	if (typeof window !== "undefined") {
		Cookies.remove(COOKIE_NAME, { path: AUTH_COOKIE_OPTIONS.path })
		Cookies.remove("user", { path: AUTH_COOKIE_OPTIONS.path })
	}
}
