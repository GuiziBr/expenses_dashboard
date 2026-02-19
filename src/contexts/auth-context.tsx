"use client"

import { useRouter } from "next/navigation"
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState
} from "react"
import { api } from "@/lib/api"
import {
	getAuthToken,
	getUser,
	removeAuthToken,
	setAuthToken,
	setUser as setUserCookie
} from "@/lib/auth-helpers"

export interface User {
	id: string
	name: string
	email: string
	[key: string]: unknown
}

interface SignInCredentials {
	email: string
	password: string
}

interface AuthContextData {
	user: User | null
	isLoading: boolean
	signIn(credentials: SignInCredentials): Promise<void>
	signOut(): void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()

	// Initialize auth state
	useEffect(() => {
		async function loadUser() {
			const token = await getAuthToken()
			const userData = await getUser<User>()

			if (token && userData) {
				setUser(userData)
			}
			setIsLoading(false)
		}

		loadUser()
	}, [])

	const signIn = useCallback(
		async ({ email, password }: SignInCredentials) => {
			try {
				// Login API call
				const response = await api.post<{ token: string; user: User }>(
					"sessions",
					{
						email,
						password
					}
				)

				const { token, user } = response

				// Set cookies
				setAuthToken(token)
				setUserCookie(user)

				// Update state
				setUser(user)

				// Redirect to dashboard
				// router.push("/sharedDashboard")
			} catch (error) {
				console.error("Sign in failed", error)
				throw error
			}
		},
		[router]
	)

	const signOut = useCallback(() => {
		removeAuthToken()
		setUser(null)
		router.push("/")
	}, [router])

	return (
		<AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth(): AuthContextData {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
