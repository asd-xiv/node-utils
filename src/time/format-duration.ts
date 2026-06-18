import { isHRTime } from "./utils/hr-time.js"
import type { HRTime } from "./utils/hr-time.js"
import { truncate } from "../math/truncate.js"

const formatFromHRTime = (
  [seconds, nanoseconds]: HRTime,
  precision: number
): string => {
  if (seconds < 0) {
    return "0ms"
  }

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (seconds >= 1) {
    const secondsWithFraction = seconds + nanoseconds / 1e9
    return `${truncate(secondsWithFraction, precision)}s`
  }

  const milliseconds = nanoseconds / 1e6
  if (milliseconds >= 100) {
    return `${truncate(milliseconds)}ms`
  }

  return `${truncate(milliseconds, precision)}ms`
}

const formatFromMilliseconds = (
  durationMs: number,
  precision: number
): string => {
  const safeDurationMs = durationMs < 0 ? 0 : durationMs

  if (safeDurationMs >= 60_000) {
    const minutes = Math.floor(safeDurationMs / 60_000)
    const remainingSeconds = Math.floor((safeDurationMs % 60_000) / 1000)
    return `${minutes}m ${remainingSeconds}s`
  }

  if (safeDurationMs >= 1000) {
    return `${truncate(safeDurationMs / 1000, precision)}s`
  }

  if (safeDurationMs >= 100) {
    return `${truncate(safeDurationMs)}ms`
  }

  return `${truncate(safeDurationMs, precision)}ms`
}

type FormatDurationOptions = {
  /** Decimal precision for second and sub-100ms output. */
  precision?: number
}

type FormatDuration = (
  input: HRTime | number,
  options?: FormatDurationOptions
) => string

/**
 * Format a duration, HR time or milliseconds, as a short string.
 *
 * @example
 * formatDuration([65, 0]) // => "1m 5s"
 * formatDuration([1, 234_000_000]) // => "1.234s"
 * formatDuration(1234) // => "1.234s"
 * formatDuration(5) // => "5ms"
 */
const formatDuration: FormatDuration = (input, { precision = 3 } = {}) => {
  const safePrecision = Math.max(0, Math.floor(precision))

  return isHRTime(input)
    ? formatFromHRTime(input, safePrecision)
    : formatFromMilliseconds(input, safePrecision)
}

export { formatDuration }
export type { HRTime, FormatDuration, FormatDurationOptions }
