import { readFile } from "node:fs/promises"

/**
 * Read a JSON file and parse it into a typed object.
 *
 * @template T - Type of the expected JSON data structure
 *
 * @param path - File system path to the JSON file
 * @returns Parsed JSON content as type T
 *
 * @throws {TypeError} When file reading or JSON parsing fails
 *
 * @example
 * ```ts
 * type Config = { port: number }
 * const config = await readFileAsJSON<Config>("./config.json")
 * console.log(config.port) // Access typed properties
 * ```
 */
const readFileAsJSON = async <T>(path: string): Promise<T> => {
  try {
    const content = await readFile(path, "utf-8")

    return JSON.parse(content) as unknown as T
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new TypeError(`Failed to parse JSON: ${error.message}`)
    } else if (error instanceof Error) {
      throw new TypeError(`Failed to read file: ${error.message}`)
    } else {
      throw new TypeError(`Unknown error: ${String(error)}`)
    }
  }
}

export { readFileAsJSON }
