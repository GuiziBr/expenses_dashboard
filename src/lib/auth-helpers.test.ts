import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const cookieJar = vi.hoisted(() => ({
	get: vi.fn(),
	set: vi.fn(),
	remove: vi.fn()
}))
const serverCookies = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock("js-cookie", () => ({ default: cookieJar }))
vi.mock("next/headers", () => ({
	cookies: vi.fn(async () => serverCookies)
}))

import { cookies } from "next/headers"
import {
	getAuthToken,
	getUser,
	removeAuthToken,
	setAuthToken,
	setUser
} from "./auth-helpers"
import { AUTH_COOKIE_OPTIONS, COOKIE_NAME } from "./constants"

describe("auth-helpers (client)", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.stubGlobal("window", {})
	})
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it("reads the auth token from the cookie", async () => {
		cookieJar.get.mockReturnValue("token-123")

		await expect(getAuthToken()).resolves.toBe("token-123")
		expect(cookieJar.get).toHaveBeenCalledWith(COOKIE_NAME)
	})

	it("parses the user cookie", async () => {
		cookieJar.get.mockReturnValue(JSON.stringify({ id: "1", name: "Ana" }))

		await expect(getUser()).resolves.toEqual({ id: "1", name: "Ana" })
		expect(cookieJar.get).toHaveBeenCalledWith("user")
	})

	it("returns undefined when there is no user cookie", async () => {
		cookieJar.get.mockReturnValue(undefined)

		await expect(getUser()).resolves.toBeUndefined()
	})

	it("stores the auth token with the shared cookie options", () => {
		setAuthToken("token-123")

		expect(cookieJar.set).toHaveBeenCalledWith(
			COOKIE_NAME,
			"token-123",
			AUTH_COOKIE_OPTIONS
		)
	})

	it("stores the user as JSON", () => {
		setUser({ id: "1" })

		expect(cookieJar.set).toHaveBeenCalledWith(
			"user",
			JSON.stringify({ id: "1" }),
			AUTH_COOKIE_OPTIONS
		)
	})

	it("removes both the token and the user cookies", () => {
		removeAuthToken()

		const options = { path: AUTH_COOKIE_OPTIONS.path }
		expect(cookieJar.remove).toHaveBeenCalledWith(COOKIE_NAME, options)
		expect(cookieJar.remove).toHaveBeenCalledWith("user", options)
	})
})

describe("auth-helpers (server)", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, "error").mockImplementation(() => {})
	})
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it("reads the auth token from the request cookies", async () => {
		serverCookies.get.mockReturnValue({ value: "server-token" })

		await expect(getAuthToken()).resolves.toBe("server-token")
		expect(serverCookies.get).toHaveBeenCalledWith(COOKIE_NAME)
		expect(cookieJar.get).not.toHaveBeenCalled()
	})

	it("returns undefined when the token cookie is missing", async () => {
		serverCookies.get.mockReturnValue(undefined)

		await expect(getAuthToken()).resolves.toBeUndefined()
	})

	it("returns undefined when cookies() throws", async () => {
		vi.mocked(cookies).mockRejectedValueOnce(new Error("no request scope"))

		await expect(getAuthToken()).resolves.toBeUndefined()
		expect(console.error).toHaveBeenCalled()
	})

	it("parses the user from the request cookies", async () => {
		serverCookies.get.mockReturnValue({ value: JSON.stringify({ id: "2" }) })

		await expect(getUser()).resolves.toEqual({ id: "2" })
		expect(serverCookies.get).toHaveBeenCalledWith("user")
	})

	it("returns undefined for the user when cookies() throws", async () => {
		vi.mocked(cookies).mockRejectedValueOnce(new Error("no request scope"))

		await expect(getUser()).resolves.toBeUndefined()
		expect(console.error).toHaveBeenCalled()
	})

	it("does not touch cookies when setting or removing on the server", () => {
		setAuthToken("token")
		setUser({ id: "1" })
		removeAuthToken()

		expect(cookieJar.set).not.toHaveBeenCalled()
		expect(cookieJar.remove).not.toHaveBeenCalled()
	})
})
