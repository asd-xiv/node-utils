import yoctoSpinner from "yocto-spinner"
import { fgGray, combine } from "../colors/colors.js"
import { formatHRTime } from "../time/format-hr-time.js"

// Detect if running in a CI environment
const IS_CI = !!process.env["CI"]

type LogLevel = "error" | "warning" | "info"

type LogType = "error" | "warning" | "info" | "success"

type Theme = {
  label: string
  color: (text: string) => string
}

/**
 * Visual styles for each log type.
 */
const THEMES: Record<LogType, Theme> = {
  error: { label: "ERR", color: combine("fgRed", "bold") },
  warning: { label: "WRN", color: combine("fgYellow", "bold") },
  info: { label: "INF", color: combine("fgBlue", "bold") },
  success: { label: "SUC", color: combine("fgGreen", "bold") },
}

/**
 * Mapping from a log level to the allowed log types.
 */
const LEVELS_TO_TYPES: Record<LogLevel, LogType[]> = {
  error: ["error", "success"],
  warning: ["error", "warning", "success"],
  info: ["error", "warning", "info", "success"],
}

/**
 * Spinner styles.
 */
const SPINNER_FRAMES = {
  simpleDots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  minimal: ["◜", "◠", "◝", "◞", "◡", "◟"],
  blocks: ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"],
  circles: ["◐", "◓", "◑", "◒"],
  lines: ["—", "\\", "|", "/"],
  dots: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
  arrows: ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"],
  bouncingBar: [
    "[    ]",
    "[=   ]",
    "[==  ]",
    "[=== ]",
    "[====]",
    "[ ===]",
    "[  ==]",
    "[   =]",
    "[    ]",
    "[   =]",
    "[  ==]",
    "[ ===]",
    "[====]",
    "[=== ]",
    "[==  ]",
    "[=   ]",
  ],
}

type LogOptions = {
  type: LogType
  namespace?: string
  level?: LogLevel
}

/**
 * Stringify a value based on its type. Objects are JSON stringified.
 *
 * @param value The value to stringify
 * @returns String representation of the value
 */
const stringifyByType = (value: unknown): string => {
  if (value === null) return "null"
  if (value === undefined) return "undefined"

  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return "[Object]"
    }
  }

  return String(value as string | number | boolean | bigint)
}

/**
 * Format and print a log message with type, namespace, and fancy styled
 * variables.
 *
 * @example
 * const logFn = log({ type: "success", namespace: "processor", level: "info" });
 * logFn("File processed", { fileName: "data.csv" });
 * // SUC processor: File processed fileName=data.csv
 */
const log =
  ({ type, namespace, level = "warning" }: LogOptions) =>
  (message: string, variables: Record<string, unknown> = {}) => {
    if (!LEVELS_TO_TYPES[level].includes(type)) {
      return
    }

    const { label, color } = THEMES[type]
    const hasColor = !IS_CI
    const typeString = hasColor ? color(label) : label

    let namespaceString = namespace ? `${namespace}: ` : ""
    if (namespaceString && hasColor) {
      namespaceString = fgGray(namespaceString)
    }

    const variablesString = Object.entries(variables)
      .map(([name, value]) =>
        hasColor
          ? `${fgGray(name + "=")}${stringifyByType(value)}`
          : `${name}=${stringifyByType(value)}`
      )
      .join(" ")

    console.error(
      `${typeString} ${namespaceString}${message}` +
        (variablesString ? " " + variablesString : "")
    )
  }

type Logger = {
  error: (message: string, variables?: Record<string, unknown>) => void
  warn: (message: string, variables?: Record<string, unknown>) => void
  info: (message: string, variables?: Record<string, unknown>) => void
  success: (message: string, variables?: Record<string, unknown>) => void
  spinner: {
    start: (message: string) => void
    stop: (
      message: string,
      type?: LogType,
      variables?: Record<string, unknown>
    ) => void
  }
}

type LoggerFactoryOptions = {
  namespace: string
  level?: LogLevel
}

/**
 * Create a logger instance with a namespace and level.
 *
 * @example
 * const logger = buildLogger({ namespace: "api", level: "info" });
 * logger.info("Request received", { path: "/users" });
 * logger.error("Request failed", { error: "timeout" });
 */
const buildLogger = ({
  namespace,
  level = "warning",
}: LoggerFactoryOptions): Logger => {
  let start = [0, 0] as [number, number]
  let loadingMessage = ""
  const spinner = yoctoSpinner({
    spinner: {
      frames: SPINNER_FRAMES.bouncingBar,
      interval: 100,
    },
  })

  return {
    error: log({ type: "error", namespace, level }),
    warn: log({ type: "warning", namespace, level }),
    info: log({ type: "info", namespace, level }),
    success: log({ type: "success", namespace, level }),
    spinner: {
      start: message => {
        loadingMessage = `${message}...`
        spinner.start(loadingMessage)
        start = process.hrtime()
      },
      stop: (message, type = "success", variables = {}) => {
        spinner.stop().clear()

        if (message) {
          log({ type, namespace, level })(`${loadingMessage}${message}`, {
            duration: formatHRTime(process.hrtime(start)),
            ...variables,
          })
        }
      },
    },
  }
}

export { buildLogger }
export type { Logger, LogLevel }
