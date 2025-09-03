import { truncate } from "../math/truncate.js"

type FormatHRTime = (hrtime: [seconds: number, nanoseconds: number]) => string

/**
 * Format high-resolution time into a human-readable string
 *
 * @param input - Array containing [seconds, nanoseconds]
 *
 * @returns Formatted time string
 *
 * @example
 * formatHRTime([65, 0])      // => "1m 5s"
 * formatHRTime([1, 234e6])   // => "1.234s"
 * formatHRTime([0, 5e6])     // => "5ms"
 * formatHRTime([0, 552133])  // => "0.552ms"
 */
const formatHRTime: FormatHRTime = ([seconds, nanoseconds]) => {
  // >= 60s: "Xm Ys"
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // 1s <= time < 60s: "X.XXXs" (truncate to 3 decimals)
  if (seconds >= 1) {
    const nsToS = nanoseconds / 1e9
    return `${truncate(seconds + nsToS, 3)}s`
  }

  // 100ms <= time < 1s: "XXXms" (truncate to integer)
  const nsToMs = nanoseconds / 1e6
  if (nsToMs >= 100) {
    return `${truncate(nsToMs)}ms`
  }

  // < 100ms: "X.XXXms" (truncate to 3 decimals)
  return `${truncate(nsToMs, 3)}ms`
}

export { formatHRTime }
export type { FormatHRTime }
