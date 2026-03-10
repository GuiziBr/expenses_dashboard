"use client"

import { useRouter } from "next/navigation"
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState
} from "react"
import { toast } from "sonner"
import { translations } from "@/constants/translations"
import { api, setUnauthorizedHandler } from "@/lib/api"
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
			try {
				const token = await getAuthToken()
				const userData = await getUser<User>()

				if (token && userData) {
					setUser(userData)
				}
			} finally {
				setIsLoading(false)
			}
		}

		loadUser()
	}, [])

	const signIn = useCallback(async ({ email, password }: SignInCredentials) => {
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
		} catch (error) {
			console.error("Sign in failed", error)
			throw error
		}
	}, [])

	const signOut = useCallback(() => {
		removeAuthToken()
		setUser(null)
		router.push("/")
	}, [router])

	// Auto-logout on 401 from any API call
	useEffect(() => {
		setUnauthorizedHandler(() => {
			toast.error(translations.auth.sessionExpired)
			signOut()
		})
		return () => setUnauthorizedHandler(() => {})
	}, [signOut])

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
