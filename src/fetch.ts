/**
 * Options for fetchJSON, extending fetch options but with typed body,
 * query parameters and headers.
 */
type FetchJSONOptions = Omit<RequestInit, "body" | "headers"> & {
  /** Request body as a JSON object */
  body?: Record<string, unknown>
  /** Request query parameters as a JSON object */
  queryParameters?: Record<string, string>
  /** Custom request headers */
  headers?: Record<string, string>
}

/**
 * Options for fetchJSON controlling behavior like aborting requests or handling redirects
 */
type FetchJSONControlOptions = Pick<RequestInit, "signal" | "mode" | "redirect">

/**
 * Fetches JSON data from an API endpoint and parses the response
 *
 * @template T Expected response data type
 *
 * @param endpoint API endpoint URL
 * @param options Request configuration
 * @returns Parsed JSON response
 *
 * @throws {Error} When request fails or server returns error status
 *
 * @example
 * type User = {
 *   id: number
 *   name: string
 * }
 *
 * // Fetch a user by ID
 * const user = await fetchJSON<User>('/api/users/1')
 *
 * // Create a new user
 * const newUser = await fetchJSON<User>('/api/users', {
 *   method: 'POST',
 *   body: { name: 'John Doe' }
 * })
 */
const fetchJSON = async <T>(
  endpoint: string,
  { method, queryParameters, headers, body, ...options }: FetchJSONOptions = {}
): Promise<T> => {
  const queryString = queryParameters
    ? `?${new URLSearchParams(queryParameters).toString()}`
    : ""
  const response = await fetch(`${endpoint}${queryString}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Network error: ${response.status} ${response.statusText}`)
  }

  if (response.status >= 400 && response.status < 500) {
    throw new Error(
      `Application Server error: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<T>
}

export { fetchJSON }
export type { FetchJSONOptions, FetchJSONControlOptions }
