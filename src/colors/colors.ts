/**
 * ANSI escape codes for terminal text styling
 *
 * @see https://en.wikipedia.org/wiki/ANSI_escape_code
 */
const COLOR_MARKERS = {
  // Text formatting
  reset: "\u001B[0m",
  bold: "\u001B[1m",
  dim: "\u001B[2m",
  italic: "\u001B[3m",
  underline: "\u001B[4m",

  // Foreground colors
  fgBlack: "\u001B[30m",
  fgGray: "\u001B[90m",
  fgRed: "\u001B[31m",
  fgGreen: "\u001B[32m",
  fgYellow: "\u001B[33m",
  fgBlue: "\u001B[34m",
  fgMagenta: "\u001B[35m",
  fgCyan: "\u001B[36m",
  fgWhite: "\u001B[37m",

  // Background colors
  bgBlack: "\u001B[40m",
  bgGray: "\u001B[100m",
  bgRed: "\u001B[41m",
  bgGreen: "\u001B[42m",
  bgYellow: "\u001B[43m",
  bgBlue: "\u001B[44m",
  bgMagenta: "\u001B[45m",
  bgCyan: "\u001B[46m",
  bgWhite: "\u001B[47m",
}

type ColorMarker = keyof typeof COLOR_MARKERS

/**
 * Curried function that applies ANSI color/style markers to text and
 * returns a styled string.
 *
 * @param marker - ANSI escape code for color/style
 * @returns Function that takes text and returns styled string
 *
 * @example
 * const withRedForeground = withColor("\u001b[31m")
 * withRedForeground('Error') // Returns red-colored "Error" text
 */
const withColor = (marker: string) => (text: string) =>
  `${marker}${text}${COLOR_MARKERS.reset}`

/**
 * Curried function that applies multiple style markers to text.
 *
 * @param styles - Style markers to apply
 * @returns Function that takes text and returns styled string
 *
 * @example
 * combine("yellow", "bold")("Warning!") // Yellow and bold text
 * combine("red", "underline", "bold")("Error") // Red, underlined and bold text
 */
const combine =
  (...styles: ColorMarker[]) =>
  (text: string) =>
    styles.reduce((acc, style) => `${COLOR_MARKERS[style]}${acc}`, text) +
    COLOR_MARKERS.reset

// Foreground color functions
const fgBlack = withColor(COLOR_MARKERS.fgBlack)
const fgGray = withColor(COLOR_MARKERS.fgGray)
const fgRed = withColor(COLOR_MARKERS.fgRed)
const fgGreen = withColor(COLOR_MARKERS.fgGreen)
const fgYellow = withColor(COLOR_MARKERS.fgYellow)
const fgBlue = withColor(COLOR_MARKERS.fgBlue)
const fgMagenta = withColor(COLOR_MARKERS.fgMagenta)
const fgCyan = withColor(COLOR_MARKERS.fgCyan)
const fgWhite = withColor(COLOR_MARKERS.fgWhite)

// Background color functions
const bgBlack = withColor(COLOR_MARKERS.bgBlack)
const bgGray = withColor(COLOR_MARKERS.bgGray)
const bgRed = withColor(COLOR_MARKERS.bgRed)
const bgGreen = withColor(COLOR_MARKERS.bgGreen)
const bgYellow = withColor(COLOR_MARKERS.bgYellow)
const bgBlue = withColor(COLOR_MARKERS.bgBlue)
const bgMagenta = withColor(COLOR_MARKERS.bgMagenta)
const bgCyan = withColor(COLOR_MARKERS.bgCyan)
const bgWhite = withColor(COLOR_MARKERS.bgWhite)

// Text style functions
const bold = withColor(COLOR_MARKERS.bold)
const dim = withColor(COLOR_MARKERS.dim)
const italic = withColor(COLOR_MARKERS.italic)
const underline = withColor(COLOR_MARKERS.underline)

export {
  COLOR_MARKERS,
  combine,
  fgBlack,
  fgGray,
  fgRed,
  fgGreen,
  fgYellow,
  fgBlue,
  fgMagenta,
  fgCyan,
  fgWhite,
  bgBlack,
  bgGray,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,
  bold,
  dim,
  italic,
  underline,
}
