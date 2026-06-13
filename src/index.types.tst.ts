import { describe, expect, test } from "tstyche"

import type { MaybePromise } from "./index.types.js"

describe("MaybePromise", () => {
  test("accepts plain values", () => {
    expect<number>().type.toBeAssignableTo<MaybePromise<number>>()
  })

  test("accepts promised values", () => {
    expect<Promise<number>>().type.toBeAssignableTo<MaybePromise<number>>()
  })
})
