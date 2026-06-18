type HRTime = [seconds: number, nanoseconds: number]

const isHRTime = (input: unknown): input is HRTime =>
  Array.isArray(input) &&
  input.length === 2 &&
  input.every(part => typeof part === "number" && Number.isFinite(part))

export { isHRTime }
export type { HRTime }
