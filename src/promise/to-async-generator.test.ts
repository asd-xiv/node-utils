import { deepStrictEqual } from "node:assert"
import { equal, deepEqual, strictEqual } from "node:assert/strict"
import { describe, test } from "node:test"

import { toAsyncGenerator } from "./to-async-generator.js"

// Helper to create a promise that resolves after a delay
const delay = (ms: number, value?: unknown) =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve(value)
    }, ms)
  )

// Helper to create a promise that rejects after a delay
const delayedReject = (ms: number, error: Error) =>
  new Promise((_, reject) =>
    setTimeout(() => {
      reject(error)
    }, ms)
  )

await describe("toAsyncGenerator :: Convert promise arrays to async generators", async () => {
  await test("given [empty array] should [return immediately without yielding]", async () => {
    const results = []

    for await (const result of toAsyncGenerator([])) {
      results.push(result)
    }

    equal(results.length, 0)
  })

  await test("given [single promise] should [yield result with correct index and status]", async () => {
    const testError = new Error("test error")

    // Test fulfilled promise
    const fulfilledPromises = [delay(10, "test-value")]
    const fulfilledResults = []

    for await (const result of toAsyncGenerator(fulfilledPromises)) {
      fulfilledResults.push(result)
    }

    equal(fulfilledResults.length, 1)
    deepEqual(fulfilledResults[0], {
      value: "test-value",
      error: undefined,
      index: 0,
      status: "fulfilled",
    })

    // Test rejected promise
    const rejectedPromises = [delayedReject(10, testError)]
    const rejectedResults = []

    for await (const result of toAsyncGenerator(rejectedPromises)) {
      rejectedResults.push(result)
    }

    equal(rejectedResults.length, 1)
    deepEqual(rejectedResults[0], {
      value: undefined,
      error: testError,
      index: 0,
      status: "rejected",
    })
  })

  await test("given [multiple promises resolving in different order] should [yield results in completion order]", async () => {
    const promises = [
      delay(50, "slow"), // index 0
      delay(10, "fast"), // index 1
      delay(30, "medium"), // index 2
    ]
    const results = []
    for await (const result of toAsyncGenerator(promises)) {
      results.push(result)
    }

    deepStrictEqual(results, [
      { value: "fast", index: 1 },
      { value: "medium", index: 2 },
      { value: "slow", index: 0 },
    ])
  })

  await test("given [mix of fulfilled and rejected promises] should [yield all results with correct status]", async () => {
    const testError = new Error("rejection")
    const promises = [
      delay(20, "success-1"), // index 0
      delayedReject(10, testError), // index 1
      delay(30, "success-2"), // index 2
    ]

    const results = []
    for await (const result of toAsyncGenerator(promises)) {
      results.push(result)
    }

    equal(results.length, 3)

    // Should have one rejection and two successes
    const fulfilled = results.filter(r => r.status === "fulfilled")
    const rejected = results.filter(r => r.status === "rejected")

    equal(fulfilled.length, 2)
    equal(rejected.length, 1)

    // Check the rejection
    equal(rejected[0]?.index, 1)
    equal(rejected[0].error, testError)
  })

  await test("given [AbortSignal that is pre-aborted] should [throw immediately]", async () => {
    const controller = new AbortController()
    controller.abort()

    const promises = [delay(10, "test")]

    try {
      for await (const _ of toAsyncGenerator(promises, {
        signal: controller.signal,
      })) {
        // Should not reach here
        equal(true, false, "Should have thrown")
      }
    } catch (error) {
      strictEqual(error instanceof Error, true)
      if (error instanceof Error) {
        equal(error.message, "This operation was aborted")
      }
    }
  })

  await test("given [AbortSignal that aborts during iteration] should [throw when signal is aborted]", async () => {
    const controller = new AbortController()
    const promises = [delay(5, "fast"), delay(200, "slow")]

    let hasCaughtError = false
    let yieldedCount = 0

    // Start the iteration
    const iterationPromise = (async () => {
      try {
        for await (const _ of toAsyncGenerator(promises, {
          signal: controller.signal,
        })) {
          yieldedCount++
          // Abort after first result to test mid-iteration abort
          if (yieldedCount === 1) {
            controller.abort()
          }
        }
      } catch (error) {
        hasCaughtError = true
        strictEqual(error instanceof Error, true)
        if (error instanceof Error) {
          equal(error.message, "This operation was aborted")
        }
      }
    })()

    await iterationPromise

    // Should have caught an abort error after first result
    equal(hasCaughtError, true)
    equal(yieldedCount, 1)
  })

  await test("given [many promises] should [handle them efficiently]", async () => {
    // Create 30 promises with random delays
    const promises = Array.from({ length: 30 }, (_, i) =>
      delay(Math.random() * 10, `result-${i}`)
    )

    const results = []

    for await (const result of toAsyncGenerator(promises)) {
      results.push(result)
    }

    equal(results.length, 30)

    // All should be fulfilled
    const areAllFulfilled = results.every(r => r.status === "fulfilled")
    equal(areAllFulfilled, true)

    // All indices should be present
    const indices = results.map(r => r.index).sort((a, b) => a - b)
    const expectedIndices = Array.from({ length: 30 }, (_, i) => i)
    deepEqual(indices, expectedIndices)
  })
})
