import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"
import { proxy } from "./proxy"

function jwt(exp: number) {
	const b64 = (o: object) => btoa(JSON.stringify(o))
	return `${b64({ alg: "none" })}.${b64({ exp })}.sig`
}
const valid = jwt(Math.floor(Date.now() / 1000) + 3600)
const expired = jwt(Math.floor(Date.now() / 1000) - 3600)

function req(path: string, token?: string) {
	return new NextRequest(`http://localhost:3001${path}`, {
		headers: token ? { cookie: `auth_token=${token}` } : {}
	})
}

function location(res: Response) {
	const l = res.headers.get("location")
	return l ? l.replace("http://localhost:3001", "") : null
}

describe("proxy", () => {
	const filtered =
		"/personal-dashboard?month=2026-09&filterBy=categories&filterValue=bd531c56"

	it("redirects unauthenticated users to sign-in, keeping the full URL", async () => {
		const res = await proxy(req(filtered))
		expect(location(res)).toBe(`/?redirectTo=${encodeURIComponent(filtered)}`)
	})

	it("treats an expired token as absent", async () => {
		const res = await proxy(req(filtered, expired))
		expect(location(res)).toContain("/?redirectTo=")
	})

	it("lets authenticated users through", async () => {
		const res = await proxy(req(filtered, valid))
		expect(location(res)).toBeNull()
	})

	it("lets unauthenticated users see the sign-in page", async () => {
		const res = await proxy(req("/?redirectTo=%2Fx"))
		expect(location(res)).toBeNull()
	})

	it("sends signed-in users on / to the safe redirectTo or the default", async () => {
		const to = encodeURIComponent(filtered)
		expect(location(await proxy(req(`/?redirectTo=${to}`, valid)))).toBe(
			filtered
		)
		expect(
			location(await proxy(req("/?redirectTo=%2F%2Fevil.com", valid)))
		).toBe("/balance-breakdown")
		expect(location(await proxy(req("/", valid)))).toBe("/balance-breakdown")
	})
})
