/**
 * Options for fetchJSON, extending fetch options but with typed body,
 * query parameters and headers.
 */
type FetchJSONOptions = Omit<RequestInit, "body" | "headers"> & {
  /** Request body as a JSON object */
  body?: Record<string, unknown>
  /** Request query parameters as a JSON object */
  query?: Record<string, unknown>
  /** Custom request headers */
  headers?: Record<string, string | undefined>
}

/**
 * Options for fetchJSON controlling behavior like aborting requests or handling redirects
 */
type FetchJSONControlOptions = Pick<RequestInit, "signal" | "mode" | "redirect">

const buildQueryString = (input: Record<string, unknown> = {}): string => {
  const entries = Object.entries(input)

  if (entries.length === 0) {
    return ""
  }

  const nonEmptyQueryParameters = entries
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => [key, String(value)] as [string, string])

  return `?${new URLSearchParams(nonEmptyQueryParameters).toString()}`
}

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
  { method, query, headers, body, ...options }: FetchJSONOptions = {}
): Promise<T> => {
  const queryString = buildQueryString(query)
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
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export { fetchJSON }
export type { FetchJSONOptions, FetchJSONControlOptions }
