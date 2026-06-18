import { equal } from "node:assert/strict"
import { describe, test } from "node:test"

import { formatDuration } from "./format-duration.js"

await describe("formatDuration", async () => {
  await test("given [HR time input] should [format duration string]", () => {
    equal(formatDuration([0, 0]), "0ms")
    equal(formatDuration([0, 5_000_000]), "5ms")
    equal(formatDuration([1, 234_000_000]), "1.234s")
    equal(formatDuration([65, 0]), "1m 5s")
  })

  await test("given [epoch millisecond input] should [format duration string]", () => {
    equal(formatDuration(0), "0ms")
    equal(formatDuration(5), "5ms")
    equal(formatDuration(1234), "1.234s")
    equal(formatDuration(65_000), "1m 5s")
  })

  await test("given [negative milliseconds] should [clamp to zero]", () => {
    equal(formatDuration(-10), "0ms")
  })

  await test("given [precision option] should [truncate decimal output]", () => {
    equal(formatDuration([1, 234_000_000], { precision: 2 }), "1.23s")
    equal(formatDuration(1234, { precision: 2 }), "1.23s")
    equal(formatDuration(5.405, { precision: 2 }), "5.4ms")
  })
})
