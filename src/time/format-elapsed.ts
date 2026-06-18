import { formatDuration } from "./format-duration.js"
import type { FormatDurationOptions } from "./format-duration.js"
import { isHRTime } from "./utils/hr-time.js"
import type { HRTime } from "./utils/hr-time.js"
import { subtractHRTime } from "./utils/subtract-hr-time.js"

type TimestampInput = Date | number

const isTimestamp = (input: unknown): input is TimestampInput =>
  typeof input === "number" || input instanceof Date

const toEpochMilliseconds = (input: TimestampInput): number =>
  input instanceof Date ? input.getTime() : input

type FormatElapsed = {
  (start: HRTime, end: HRTime, options?: FormatDurationOptions): string
  (
    start: TimestampInput,
    end: TimestampInput,
    options?: FormatDurationOptions
  ): string
}

/**
 * Format elapsed time from start to end.
 *
 * Supports HR time values, epoch milliseconds, and Date values.
 *
 * @example
 * formatElapsed([1, 0], [1, 121_000_000]) // => "121ms"
 * formatElapsed(1000, 2234) // => "1.234s"
 * formatElapsed(new Date(1000), new Date(2234)) // => "1.234s"
 */
const formatElapsed: FormatElapsed = (start, end, options) => {
  let delta: HRTime | number | undefined

  if (isHRTime(start) && isHRTime(end)) {
    delta = subtractHRTime(start, end)
  }

  if (isTimestamp(start) && isTimestamp(end)) {
    delta = toEpochMilliseconds(end) - toEpochMilliseconds(start)
  }

  if (delta !== undefined) {
    return formatDuration(delta, options)
  }

  throw new TypeError(
    "formatElapsed expects start and end to both be HRTime, number, or Date"
  )
}

export { formatElapsed }
export type { FormatElapsed }
