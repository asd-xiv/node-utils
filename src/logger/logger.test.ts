/* eslint-disable @typescript-eslint/no-non-null-assertion -- test file uses array access after length checks */

import { equal, match } from "node:assert/strict"
import { describe, test, beforeEach, afterEach } from "node:test"

import { buildLogger } from "./logger.js"

// Mock console.error to capture output
let consoleOutput = [] as string[]
const originalConsoleError = console.error

beforeEach(() => {
  consoleOutput = []
  console.error = (...input: string[]) => {
    consoleOutput.push(input.join(" "))
  }
})

afterEach(() => {
  console.error = originalConsoleError
})

// Helper to strip ANSI color codes for easier testing
const stripAnsi = (input: string): string => {
  return input.replace(/\u001B\[[\d;]*m/g, "")
}

await describe("buildLogger :: Create logger instances with namespace and level", async () => {
  await test("given [namespace and default level] should [create logger with correct methods]", () => {
    const logger = buildLogger({ namespace: "test" })

    equal(typeof logger.error, "function")
    equal(typeof logger.warn, "function")
    equal(typeof logger.info, "function")
    equal(typeof logger.success, "function")
    equal(typeof logger.spinner.start, "function")
    equal(typeof logger.spinner.stop, "function")
  })

  await test("given [warning level] should [filter logs correctly]", () => {
    const logger = buildLogger({ namespace: "test", level: "warning" })

    // Should show: error, warning, success
    logger.error("error message")
    logger.warn("warning message")
    logger.success("success message")
    logger.info("info message") // Should be filtered out

    equal(consoleOutput.length, 3)
    match(consoleOutput[0]!, /ERR.*error message/)
    match(consoleOutput[1]!, /WRN.*warning message/)
    match(consoleOutput[2]!, /SUC.*success message/)
  })

  await test("given [error level] should [only show error and success]", () => {
    const logger = buildLogger({ namespace: "test", level: "error" })

    logger.error("error message")
    logger.warn("warning message") // Filtered
    logger.info("info message") // Filtered
    logger.success("success message")

    equal(consoleOutput.length, 2)
    match(consoleOutput[0]!, /ERR.*error message/)
    match(consoleOutput[1]!, /SUC.*success message/)
  })

  await test("given [info level] should [show all log types]", () => {
    const logger = buildLogger({ namespace: "test", level: "info" })

    logger.error("error message")
    logger.warn("warning message")
    logger.info("info message")
    logger.success("success message")

    equal(consoleOutput.length, 4)
  })
})

await describe("logger :: Log message formatting and variables", async () => {
  await test("given [simple message] should [format with namespace and timing]", () => {
    const logger = buildLogger({ namespace: "api", level: "info" })

    logger.info("Processing request")

    equal(consoleOutput.length, 1)
    const cleanOutput = stripAnsi(consoleOutput[0]!)
    match(cleanOutput, /INF.*api:.*Processing request.*\(.*\)/)
  })

  await test("given [message with variables] should [format variables correctly]", () => {
    const logger = buildLogger({ namespace: "db", level: "info" })

    const testCases = [
      {
        vars: { id: 123 },
        expected: /id=123/,
      },
      {
        vars: { name: "test", active: true },
        expected: /name=test.*active=true/,
      },
      {
        vars: { data: null },
        expected: /data=null/,
      },
      {
        vars: { value: undefined },
        expected: /value=undefined/,
      },
    ]

    testCases.forEach(({ vars, expected }) => {
      consoleOutput = [] // Reset
      logger.info("Test message", vars)
      equal(consoleOutput.length, 1)
      const cleanOutput = stripAnsi(consoleOutput[0]!)
      match(cleanOutput, expected)
    })
  })

  await test("given [object variables] should [stringify as JSON]", () => {
    const logger = buildLogger({ namespace: "test", level: "info" })

    logger.info("Object test", {
      user: { id: 1, name: "John" },
      settings: { theme: "dark" },
    })

    const cleanOutput = stripAnsi(consoleOutput[0]!)
    match(cleanOutput, /user={"id":1,"name":"John"}/)
    match(cleanOutput, /settings={"theme":"dark"}/)
  })

  await test("given [circular object] should [handle gracefully]", () => {
    const logger = buildLogger({ namespace: "test", level: "info" })

    const circular: Record<string, unknown> = { name: "test" }
    circular["self"] = circular

    logger.info("Circular test", { circular })

    // Should not throw and should contain fallback
    const cleanOutput = stripAnsi(consoleOutput[0]!)
    match(cleanOutput, /circular=\[Object]/)
  })
})

await describe("stringifyByType :: Value serialization", async () => {
  // Note: This would need to be exported from your module for direct testing
  // For now, we test it indirectly through the logger

  await test("given [different primitive types] should [stringify correctly]", () => {
    const logger = buildLogger({ namespace: "test", level: "info" })

    const testCases = [
      { value: "string", expected: /val=string/ },
      { value: 42, expected: /val=42/ },
      { value: true, expected: /val=true/ },
      { value: false, expected: /val=false/ },
      { value: 0, expected: /val=0/ },
      { value: "", expected: /val= / }, // Empty string
    ]

    testCases.forEach(({ value, expected }) => {
      consoleOutput = []
      logger.info("Test", { val: value })
      equal(consoleOutput.length, 1)
      const cleanOutput = stripAnsi(consoleOutput[0]!)
      match(cleanOutput, expected)
    })
  })
})

await describe("logger :: Timing and performance", async () => {
  await test("given [consecutive logs] should [show duration between logs]", () => {
    const logger = buildLogger({ namespace: "timing", level: "info" })

    logger.info("First log")
    logger.info("Second log")

    equal(consoleOutput.length, 2)
    // Both should have timing info
    const cleanOutput1 = stripAnsi(consoleOutput[0]!)
    const cleanOutput2 = stripAnsi(consoleOutput[1]!)
    match(cleanOutput1, /\(.*\)$/)
    match(cleanOutput2, /\(.*\)$/)
  })
})

await describe("logger.spinner :: Spinner functionality", async () => {
  await test("given [spinner start and stop] should [log completion message]", () => {
    const logger = buildLogger({ namespace: "task" })

    logger.spinner.start("Loading data")
    // Simulate some work
    logger.spinner.stop(" completed successfully")

    equal(consoleOutput.length, 1)
    match(consoleOutput[0]!, /SUC.*task:.*Loading data.*completed successfully/)
    match(consoleOutput[0]!, /duration=/)
  })

  await test("given [spinner with custom type and variables] should [format correctly]", () => {
    const logger = buildLogger({ namespace: "upload", level: "info" })

    logger.spinner.start("Uploading file")
    logger.spinner.stop(" failed", "error", { size: "10MB", error: "timeout" })

    equal(consoleOutput.length, 1)
    const cleanOutput = stripAnsi(consoleOutput[0]!)
    match(cleanOutput, /ERR.*upload:.*Uploading file.*failed/)
    match(cleanOutput, /size=10MB/)
    match(cleanOutput, /error=timeout/)
    match(cleanOutput, /duration=/)
  })

  await test("given [spinner stop with empty message] should [handle gracefully]", () => {
    const logger = buildLogger({ namespace: "test" })

    logger.spinner.start("Processing")
    logger.spinner.stop("")

    // Should not log anything when message is empty
    equal(consoleOutput.length, 0)
  })
})

await describe("logger :: Edge cases and error handling", async () => {
  await test("given [very long namespace] should [handle correctly]", () => {
    const longNamespace = "a".repeat(100)
    const logger = buildLogger({ namespace: longNamespace, level: "info" })

    logger.info("Test message")

    equal(consoleOutput.length, 1)
    const cleanOutput = stripAnsi(consoleOutput[0]!)
    match(cleanOutput, new RegExp(longNamespace))
  })

  await test("given [special characters in message] should [handle correctly]", () => {
    const logger = buildLogger({ namespace: "test", level: "info" })

    const testCases = [
      "Message with émojis 🚀✨",
      "Message with\nnewlines",
      "Message with\ttabs",
      "Message with \"quotes\" and 'apostrophes'",
    ]

    testCases.forEach(message => {
      consoleOutput = []
      logger.info(message)
      equal(consoleOutput.length, 1)
      const cleanOutput = stripAnsi(consoleOutput[0]!)
      match(cleanOutput, /INF.*test:/)
    })
  })

  await test("given [large object] should [handle without crashing]", () => {
    const logger = buildLogger({ namespace: "test", level: "info" })

    const largeObject = {
      data: new Array(1000)
        .fill(0)
        .map((_, i) => ({ id: i, value: `item-${i}` })),
    }

    logger.info("Large object test", { large: largeObject })

    equal(consoleOutput.length, 1)
    const cleanOutput = stripAnsi(consoleOutput[0]!)
    match(cleanOutput, /large=/)
  })
})
