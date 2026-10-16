import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("./auth-helpers", () => ({
	getAuthToken: vi.fn()
}))

import { ApiError, api, setUnauthorizedHandler } from "./api"
import { getAuthToken } from "./auth-helpers"

function jsonResponse(status: number, body: unknown) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" }
	})
}

describe("api", () => {
	beforeEach(() => {
		vi.restoreAllMocks()
		setUnauthorizedHandler(() => {})
	})

	it("attaches the Authorization header when a token is present", async () => {
		vi.mocked(getAuthToken).mockResolvedValue("token-123")
		const fetchSpy = vi
			.spyOn(global, "fetch")
			.mockResolvedValue(jsonResponse(200, { ok: true }))

		await api.get("banks")

		const [, config] = fetchSpy.mock.calls[0]
		const headers = config?.headers as Record<string, string> | undefined
		expect(headers?.Authorization).toBe("Bearer token-123")
	})

	it("throws ApiError with the backend message and status on a 400", async () => {
		vi.mocked(getAuthToken).mockResolvedValue("token-123")
		vi.spyOn(global, "fetch").mockResolvedValue(
			jsonResponse(400, { message: "name is required", error: "Bad Request" })
		)

		await expect(api.get("banks")).rejects.toMatchObject({
			message: "name is required",
			status: 400
		})
	})

	it("throws ApiError with a generic message when the error body has none", async () => {
		vi.mocked(getAuthToken).mockResolvedValue("token-123")
		vi.spyOn(global, "fetch").mockResolvedValue(
			new Response(null, { status: 500 })
		)

		await expect(api.get("banks")).rejects.toMatchObject({
			message: "API Error: 500",
			status: 500
		})
	})

	it("fires the unauthorized handler and throws a session-expired ApiError on a 401 with a token attached", async () => {
		vi.mocked(getAuthToken).mockResolvedValue("stale-token")
		vi.spyOn(global, "fetch").mockResolvedValue(
			jsonResponse(401, { message: "Unauthorized" })
		)
		const handler = vi.fn()
		setUnauthorizedHandler(handler)

		await expect(api.get("banks")).rejects.toBeInstanceOf(ApiError)
		expect(handler).toHaveBeenCalledTimes(1)
	})

	it("does not fire the unauthorized handler on a 401 with no token attached (e.g. login)", async () => {
		vi.mocked(getAuthToken).mockResolvedValue(undefined)
		vi.spyOn(global, "fetch").mockResolvedValue(
			jsonResponse(401, { message: "Invalid credentials" })
		)
		const handler = vi.fn()
		setUnauthorizedHandler(handler)

		await expect(api.post("sessions", {})).rejects.toMatchObject({
			message: "Invalid credentials",
			status: 401
		})
		expect(handler).not.toHaveBeenCalled()
	})

	it("only fires the unauthorized handler once across concurrent 401s", async () => {
		vi.mocked(getAuthToken).mockResolvedValue("stale-token")
		vi.spyOn(global, "fetch").mockResolvedValue(
			jsonResponse(401, { message: "Unauthorized" })
		)
		const handler = vi.fn()
		setUnauthorizedHandler(handler)

		await Promise.allSettled([api.get("banks"), api.get("categories")])

		expect(handler).toHaveBeenCalledTimes(1)
	})

	it("getWithHeaders returns the parsed body and total count", async () => {
		vi.mocked(getAuthToken).mockResolvedValue("token-123")
		vi.spyOn(global, "fetch").mockResolvedValue(
			new Response(JSON.stringify([{ id: "1" }]), {
				status: 200,
				headers: {
					"content-type": "application/json",
					"x-total-count": "42"
				}
			})
		)

		const result = await api.getWithHeaders("banks")

		expect(result.data).toEqual([{ id: "1" }])
		expect(result.totalCount).toBe(42)
	})

	it("getWithHeaders defaults the total count to 0 when the header is missing", async () => {
		vi.mocked(getAuthToken).mockResolvedValue("token-123")
		vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse(200, []))

		const result = await api.getWithHeaders("banks")

		expect(result.totalCount).toBe(0)
	})

	it("returns an empty object on a 204 No Content", async () => {
		vi.mocked(getAuthToken).mockResolvedValue("token-123")
		vi.spyOn(global, "fetch").mockResolvedValue(
			new Response(null, { status: 204 })
		)

		await expect(api.delete("banks/1")).resolves.toEqual({})
	})

	it.each([
		["post", "POST"],
		["put", "PUT"],
		["patch", "PATCH"]
	] as const)(
		"%s sends a JSON body with the %s method",
		async (verb, method) => {
			vi.mocked(getAuthToken).mockResolvedValue("token-123")
			const fetchSpy = vi
				.spyOn(global, "fetch")
				.mockResolvedValue(jsonResponse(200, { ok: true }))

			await api[verb]("banks/1", { name: "Nubank" })

			const [url, config] = fetchSpy.mock.calls[0]
			expect(String(url)).toMatch(/\/banks\/1$/)
			expect(config?.method).toBe(method)
			expect(config?.body).toBe(JSON.stringify({ name: "Nubank" }))
		}
	)

	it("delete sends the DELETE method without a body", async () => {
		vi.mocked(getAuthToken).mockResolvedValue("token-123")
		const fetchSpy = vi
			.spyOn(global, "fetch")
			.mockResolvedValue(jsonResponse(200, {}))

		await api.delete("banks/1")

		const [, config] = fetchSpy.mock.calls[0]
		expect(config?.method).toBe("DELETE")
		expect(config?.body).toBeUndefined()
	})
})
