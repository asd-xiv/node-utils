type ToAsyncGeneratorResult<T> =
  | { value: T; error: undefined; index: number; status: "fulfilled" }
  | { value: undefined; error: unknown; index: number; status: "rejected" }

type ToAsyncGeneratorOptions = {
  /** AbortSignal to cancel the operation */
  signal?: AbortSignal
}

type ToAsyncGenerator = <T>(
  promises: Promise<T>[],
  options?: ToAsyncGeneratorOptions
) => AsyncGenerator<ToAsyncGeneratorResult<T>, void, unknown>

/**
 * Converts an array of promises to an async generator that yields results
 * as they resolve, in whatever order they complete.
 *
 * Features:
 * - Abortable via AbortSignal
 * - Preserves original promise indices
 *
 * @param promises Array of promises to convert
 * @param options Configuration options
 * @returns AsyncGenerator that yields results with their original indices
 *
 * @remarks
 * **Promise cancellation limitation:** When aborted via AbortSignal, this function stops
 * iterating and throws, but the original promises cannot be cancelled as JavaScript promises
 * lack built-in cancellation. In-flight promises continue executing in the background.
 * For true cancellation, use APIs that accept AbortSignal (like fetch) or implement
 * custom cancellation patterns within your promise-creating code.
 *
 * @example
 * ```ts
 * const promises = [
 *   fetch('/api/1'),
 *   fetch('/api/2'),
 *   fetch('/api/3')
 * ]
 *
 * for await (const result of toAsyncGenerator(promises)) {
 *   if (result.status === "fulfilled") {
 *     console.log(`Promise ${result.index} resolved:`, result.value)
 *   } else {
 *     console.error(`Promise ${result.index} rejected:`, result.error)
 *   }
 * }
 * ```
 *
 */
const toAsyncGenerator: ToAsyncGenerator = async function* (
  promises,
  options = {}
) {
  if (promises.length === 0) return

  const { signal } = options

  // Check signal wasnt aborted before triggering any promises
  signal?.throwIfAborted()

  // Create indexed promises that never reject - errors are captured in the result
  const indexedPromises = promises.map((promise, index) =>
    promise.then(
      value => ({
        value,
        error: undefined,
        index,
        status: "fulfilled" as const,
      }),
      (error: unknown) => ({
        value: undefined,
        error,
        index,
        status: "rejected" as const,
      })
    )
  )

  const pending = new Set(indexedPromises)
  while (pending.size !== 0) {
    signal?.throwIfAborted()

    const completed = await Promise.race(pending)
    // O(1) removal using the original promise reference
    pending.delete(
      indexedPromises[completed.index] as (typeof indexedPromises)[0]
    )

    yield completed
  }
}

export { toAsyncGenerator }
export type {
  ToAsyncGenerator,
  ToAsyncGeneratorResult,
  ToAsyncGeneratorOptions,
}
