type FormatHRTime = (hrtime: [seconds: number, nanoseconds: number]) => string

/**
 * Formats high-resolution time into a human-readable string
 *
 * @param input - Array containing [seconds, nanoseconds]
 * @returns Formatted time string
 *
 * @example
 * formatHRTime([0, 5e6])     // => "5ms"
 * formatHRTime([1, 234e6])   // => "1.234s"
 * formatHRTime([65, 0])      // => "1m 5s"
 */
const formatHRTime: FormatHRTime = ([seconds, nanoseconds]) => {
  const milliseconds = Math.round(nanoseconds / 1e6)

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (seconds >= 1) {
    return `${seconds}.${milliseconds.toString().padStart(3, "0")}s`
  }

  return `${milliseconds}ms`
}

export { formatHRTime }
export type { FormatHRTime }
