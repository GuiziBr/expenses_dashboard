export const REDIRECT_PARAM = "redirectTo"
export const DEFAULT_AUTHENTICATED_PATH = "/balance-breakdown"

/**
 * Accepts only same-origin relative paths ("/foo?bar=1"). Anything else
 * (absolute URLs, "//host", "/\host", control characters) is rejected so the
 * param cannot be used as an open redirect.
 */
export function getSafeRedirect(
	value: string | null | undefined
): string | null {
	if (!value?.startsWith("/")) return null
	if (value.startsWith("//") || value.startsWith("/\\")) return null
	// biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting control chars on purpose
	if (/[\u0000-\u001f\u007f\\]/.test(value)) return null
	// "/" is the sign-in page itself, redirecting there would loop
	if (value === "/" || value.startsWith("/?")) return null
	return value
}

/** Sign-in URL that sends the user back to `destination` after logging in. */
export function buildSignInUrl(destination?: string | null): string {
	const safe = getSafeRedirect(destination)
	return safe ? `/?${REDIRECT_PARAM}=${encodeURIComponent(safe)}` : "/"
}
