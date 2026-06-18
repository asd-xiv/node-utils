import { equal, throws } from "node:assert/strict"
import { describe, test } from "node:test"

import { formatElapsed } from "./format-elapsed.js"

await describe("formatElapsed", async () => {
  await test("given [HR time start and end] should [format elapsed duration]", () => {
    equal(formatElapsed([1, 0], [1, 121_000_000]), "121ms")
    equal(formatElapsed([1, 0], [2, 234_000_000]), "1.234s")
  })

  await test("given [epoch milliseconds] should [format elapsed duration]", () => {
    equal(formatElapsed(1000, 1121), "121ms")
    equal(formatElapsed(1000, 2234), "1.234s")
  })

  await test("given [Date and epoch milliseconds] should [format elapsed duration]", () => {
    equal(formatElapsed(new Date(1000), new Date(1121)), "121ms")
    equal(formatElapsed(new Date(1000), 2234), "1.234s")
  })

  await test("given [precision option] should [truncate decimal output to requested precision]", () => {
    equal(formatElapsed([1, 0], [2, 234_000_000], { precision: 2 }), "1.23s")
  })

  await test("given [nanosecond borrow] should [compute elapsed duration correctly]", () => {
    equal(formatElapsed([1, 900_000_000], [2, 100_000_000]), "200ms")
  })

  await test("given [end before start] should [clamp to zero]", () => {
    equal(formatElapsed([2, 0], [1, 999_000_000]), "0ms")
    equal(formatElapsed(2000, 1000), "0ms")
  })

  await test("given [unsupported input] should [throw type error]", () => {
    throws(
      () => formatElapsed("2024-01-01" as unknown as Date, new Date()),
      TypeError
    )
  })
})
