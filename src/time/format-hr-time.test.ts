import { equal } from "node:assert/strict"
import { describe, test } from "node:test"

import { formatHRTime } from "./format-hr-time.js"

await describe("formatHRTime :: Format high-resolution time into human-readable string", async () => {
  await test("given [time is >= 60 sec] should [format as minutes and seconds without decimal precision]", () => {
    const testCases = [
      { input: [65, 0], expected: "1m 5s" },
      { input: [120, 0], expected: "2m 0s" },
      { input: [125, 0], expected: "2m 5s" },
    ]

    testCases.forEach(({ input, expected }) => {
      equal(formatHRTime(input as [number, number]), expected)
    })
  })

  await test("given [time is >= 1 sec and < 60 sec] should [format as seconds with 3 decimal precision]", () => {
    const testCases = [
      { input: [1, 0], expected: "1s" },
      { input: [1, 234_000_000], expected: "1.234s" },
      { input: [2, 500_000_000], expected: "2.5s" },
      { input: [59, 999_999_999], expected: "59.999s" },
    ]

    testCases.forEach(({ input, expected }) => {
      equal(formatHRTime(input as [number, number]), expected)
    })
  })

  await test("given [time is >= 100 ms and < 1 sec] should [format as milliseconds without decimal precision]", () => {
    const testCases = [
      { input: [0, 100_000_000], expected: "100ms" },
      { input: [0, 150_000_000], expected: "150ms" },
    ]

    testCases.forEach(({ input, expected }) => {
      equal(formatHRTime(input as [number, number]), expected)
    })
  })

  await test("given [time is < 100 ms] should [format as milliseconds with 3 decimal precision]", () => {
    const testCases = [
      { input: [0, 0], expected: "0ms" },
      { input: [0, 552_133], expected: "0.552ms" },
      { input: [0, 5_000_000], expected: "5ms" },
      { input: [0, 5_405_000], expected: "5.405ms" },
      { input: [0, 50_000_000], expected: "50ms" },
      { input: [0, 99_999_999], expected: "99.999ms" },
    ]

    testCases.forEach(({ input, expected }) => {
      equal(formatHRTime(input as [number, number]), expected)
    })
  })
})
