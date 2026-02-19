import { getAuthToken } from "./auth-helpers"
import { API_BASE_URL } from "./constants"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface FetchOptions extends RequestInit {
	data?: unknown
}

class ApiClient {
	private async request<T>(
		endpoint: string,
		method: HttpMethod,
		options: FetchOptions = {}
	): Promise<T> {
		const { data, headers, ...customConfig } = options

		const token = await getAuthToken()

		const config: RequestInit = {
			method,
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...headers
			},
			...customConfig
		}

		if (data) {
			config.body = JSON.stringify(data)
		}

		const response = await fetch(`${API_BASE_URL}/${endpoint}`, config)

		if (!response.ok) {
			// Handle 401 Unauthorized globally if needed
			if (response.status === 401) {
				// Optional: Redirect to login or clear token
				// window.location.href = '/login' (only on client)
			}

			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.message || `API Error: ${response.status}`)
		}

		// Handle 204 No Content
		if (response.status === 204) {
			return {} as T
		}

		return response.json()
	}

	get<T>(endpoint: string, options?: FetchOptions) {
		return this.request<T>(endpoint, "GET", options)
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
