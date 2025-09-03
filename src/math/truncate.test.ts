import { equal } from "node:assert/strict"
import { describe, test } from "node:test"

import { truncate } from "./truncate.js"

await describe("truncate :: Truncate a number to a specified number of decimal places", async () => {
  await test("given [default decimals] should [truncate without decimals]", () => {
    equal(truncate(10.999), 10)
  })

  await test("given [number with decimals] should [truncate to specified decimal places]", () => {
    equal(truncate(10.999, 2), 10.99)
  })

  await test("given [very small number] should [truncate correctly]", () => {
    equal(truncate(0.123_456_789, 3), 0.123)
  })

  await test("given [zero] should [return zero]", () => {
    equal(truncate(0), 0)
  })
})
