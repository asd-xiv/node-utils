/**
 * Truncate a number to a specified number of decimal places.
 *
 * @param input - The number to truncate
 * @param decimals - The number of decimal places to truncate to (default: 0)
 *
 * @returns The truncated number
 *
 * @example
 * truncate(3.14159, 2) // => 3.14
 * truncate(5.6789, 3)  // => 5.678
 * truncate(10.999)     // => 10
 */
export const truncate = (input: number, decimals = 0) => {
  const decimalFactor = 10 ** decimals

  return decimals <= 0
    ? Math.trunc(input)
    : Math.trunc(input * decimalFactor) / decimalFactor
}
