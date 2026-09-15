import { translations } from "@/constants/translations"
import { getAuthToken } from "./auth-helpers"
import { API_BASE_URL } from "./constants"

export class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number
	) {
		super(message)
		this.name = "ApiError"
	}
}

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
	unauthorizedHandler = handler
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface FetchOptions extends RequestInit {
	data?: unknown
}

export interface PaginatedResponse<T> {
	data: T
	totalCount: number
}

class ApiClient {
	private buildConfig(
		method: HttpMethod,
		options: FetchOptions = {}
	): { config: RequestInit; token: Promise<string | undefined> } {
		const { data, headers, ...customConfig } = options
		const token = getAuthToken()

		return {
			token,
			config: {
				method,
				headers: {
					"Content-Type": "application/json",
					...headers
				},
				...(data ? { body: JSON.stringify(data) } : {}),
				...customConfig
			}
		}
	}

	private async fetch(
		endpoint: string,
		method: HttpMethod,
		options: FetchOptions = {}
	): Promise<Response> {
		const { config, token } = this.buildConfig(method, options)
		const resolvedToken = await token

		if (resolvedToken) {
			;(config.headers as Record<string, string>).Authorization =
				`Bearer ${resolvedToken}`
		}

		const response = await fetch(`${API_BASE_URL}/${endpoint}`, config)

		if (!response.ok) {
			// A 401 with no token attached means the request was never
			// authenticated in the first place (e.g. login with wrong
			// credentials) rather than a session that expired, so it must
			// not trigger the logout flow below.
			if (response.status === 401 && resolvedToken) {
				const handler = unauthorizedHandler
				unauthorizedHandler = null
				handler?.()
				throw new ApiError(translations.auth.sessionExpired, response.status)
			}

			const errorData = await response.json().catch(() => ({}))
			throw new ApiError(
				errorData.message || `API Error: ${response.status}`,
				response.status
			)
		}

		return response
	}

	private async request<T>(
		endpoint: string,
		method: HttpMethod,
		options: FetchOptions = {}
	): Promise<T> {
		const response = await this.fetch(endpoint, method, options)

		// Handle 204 No Content
		if (response.status === 204) {
			return {} as T
		}

		return response.json()
	}

	get<T>(endpoint: string, options?: FetchOptions) {
		return this.request<T>(endpoint, "GET", options)
	}

	/**
	 * GET request that also returns the `x-total-count` header.
	 * Use this for paginated list endpoints.
	 */
	async getWithHeaders<T>(
		endpoint: string,
		options?: FetchOptions
	): Promise<PaginatedResponse<T>> {
		const response = await this.fetch(endpoint, "GET", options)
		const data: T = await response.json()
		const totalCount = Number(response.headers.get("x-total-count") ?? "0")

		return { data, totalCount }
	}

	post<T>(endpoint: string, data?: unknown, options?: FetchOptions) {
		return this.request<T>(endpoint, "POST", { ...options, data })
	}

	put<T>(endpoint: string, data?: unknown, options?: FetchOptions) {
		return this.request<T>(endpoint, "PUT", { ...options, data })
	}

	patch<T>(endpoint: string, data?: unknown, options?: FetchOptions) {
		return this.request<T>(endpoint, "PATCH", { ...options, data })
	}

	delete<T>(endpoint: string, options?: FetchOptions) {
		return this.request<T>(endpoint, "DELETE", options)
	}
}

export const api = new ApiClient()
