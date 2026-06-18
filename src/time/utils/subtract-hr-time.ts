import type { HRTime } from "./hr-time.js"

type SubtractHRTime = (start: HRTime, end: HRTime) => HRTime

const subtractHRTime: SubtractHRTime = (start, end) => {
  let seconds = end[0] - start[0]
  let nanoseconds = end[1] - start[1]

  if (nanoseconds < 0) {
    seconds--
    nanoseconds += 1_000_000_000
  }

  if (seconds < 0) {
    return [0, 0]
  }

  return [seconds, nanoseconds]
}

export { subtractHRTime }
export type { SubtractHRTime }
