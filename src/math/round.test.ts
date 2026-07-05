import { equal } from "node:assert/strict"
import { describe, test } from "node:test"

import { round } from "./round.js"

await describe("round", async () => {
  await test("given [default decimals] should [round as integer]", () => {
    equal(round(10.4), 10)
    equal(round(10.5), 11)
  })

  await test("given [decimals option] should [round to decimal places]", () => {
    equal(round(10.444, { decimals: 2 }), 10.44)
    equal(round(10.445, { decimals: 2 }), 10.45)
  })

  await test("given [negative decimals] should [clamp to integer rounding]", () => {
    equal(round(10.9, { decimals: -1 }), 11)
  })

  await test("given [fractional decimals] should [floor decimal places]", () => {
    equal(round(1.2345, { decimals: 2.9 }), 1.23)
  })
})
