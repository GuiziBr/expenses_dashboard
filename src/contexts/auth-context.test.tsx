// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push, replace: vi.fn() })
}))

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock("@/lib/api", () => ({
	api: {
		post: vi.fn().mockResolvedValue({
			token: "token-b",
			user: { id: "b", name: "User B", email: "b@test.com" }
		})
	},
	setUnauthorizedHandler: vi.fn()
}))

vi.mock("@/lib/auth-helpers", () => ({
	getAuthToken: vi.fn().mockResolvedValue(undefined),
	getUser: vi.fn().mockResolvedValue(undefined),
	setAuthToken: vi.fn(),
	setUser: vi.fn(),
	removeAuthToken: vi.fn()
}))

import { AuthProvider, useAuth } from "./auth-context"

const BREAKDOWN_KEY = ["balance", "breakdown", 2026, 9, "categories"]

let auth: ReturnType<typeof useAuth>
function Capture() {
	auth = useAuth()
	return <p>ready</p>
}

function setup() {
	const queryClient = new QueryClient()
	render(
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<Capture />
			</AuthProvider>
		</QueryClientProvider>
	)
	return queryClient
}

describe("AuthProvider – cache isolation between accounts", () => {
	beforeEach(() => {
		push.mockClear()
	})

	it("clears every cached query on sign-out", async () => {
		const queryClient = setup()
		await screen.findByText("ready")
		queryClient.setQueryData(BREAKDOWN_KEY, [
			{ id: "1", label: "A", total: 100 }
		])
		queryClient.setQueryData(["expenses", { page: 1 }], [])

		act(() => auth.signOut())

		expect(queryClient.getQueryData(BREAKDOWN_KEY)).toBeUndefined()
		expect(queryClient.getQueryData(["expenses", { page: 1 }])).toBeUndefined()
		expect(push).toHaveBeenCalledWith("/")
	})

	it("clears the cache when another account signs in", async () => {
		const queryClient = setup()
		await screen.findByText("ready")
		// data left behind by the previous account
		queryClient.setQueryData(BREAKDOWN_KEY, [
			{ id: "1", label: "A", total: 100 }
		])

		await act(() => auth.signIn({ email: "b@test.com", password: "pw" }))

		await waitFor(() => expect(auth.user?.id).toBe("b"))
		expect(queryClient.getQueryData(BREAKDOWN_KEY)).toBeUndefined()
	})

	it("keeps the cache when sign-in fails", async () => {
		const { api } = await import("@/lib/api")
		vi.mocked(api.post).mockRejectedValueOnce(new Error("bad credentials"))
		vi.spyOn(console, "error").mockImplementation(() => {})

		const queryClient = setup()
		await screen.findByText("ready")
		queryClient.setQueryData(BREAKDOWN_KEY, [
			{ id: "1", label: "A", total: 100 }
		])

		await expect(
			act(() => auth.signIn({ email: "b@test.com", password: "wrong" }))
		).rejects.toThrow("bad credentials")

		// a failed login must not wipe the signed-in user's data
		expect(queryClient.getQueryData(BREAKDOWN_KEY)).toBeDefined()
	})
})
