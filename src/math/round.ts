type RoundOptions = {
  /** Decimal places to round to (default: 0). */
  decimals?: number
}

type Round = (input: number, options?: RoundOptions) => number

/**
 * Round a number to a given number of decimal places.
 *
 * @example
 * round(3.14159) // => 3
 * round(3.14159, { decimals: 2 }) // => 3.14
 */
const round: Round = (input, { decimals = 0 } = {}) => {
  const safeDecimals = Math.max(0, Math.floor(decimals))
  const factor = 10 ** safeDecimals

  return Math.round(input * factor) / factor
}

export { round }
export type { Round, RoundOptions }
