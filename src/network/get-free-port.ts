import { createServer } from "node:net"

const isPortFree = (port: number): Promise<boolean> =>
  new Promise(resolve => {
    const server = createServer()
    server.listen(port, "localhost", () => {
      server.close(() => {
        resolve(true)
      })
    })
    server.on("error", () => {
      resolve(false)
    })
  })

const getRandomPort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(0, () => {
      const address = server.address()
      if (address && typeof address === "object") {
        const port = address.port
        server.close(() => {
          resolve(port)
        })
      } else {
        server.close(() => {
          reject(new Error("Failed to get assigned port"))
        })
      }
    })
    server.on("error", error => {
      reject(error)
    })
  })

/**
 * Get an available port
 *
 * @param startFrom - If provided, start searching from this port. If not provided, let OS assign any available port
 * @returns Promise that resolves to an available port number
 *
 * @throws {Error} When no port is available in the search range (startFrom to startFrom+1000)
 *
 * @remarks
 * **Race condition warning:** There is an inherent race condition between when this function
 * returns a port and when your application binds to it. Another process might claim the port
 * in that brief window. This is unavoidable at the OS level. Handle "address already in use"
 * errors in your application and retry if needed.
 *
 * @example
 * // Let OS assign any available port
 * const port = await getFreePort()
 *
 * // Search starting from port 3000
 * const port = await getFreePort(3000)
 *
 */
const getFreePort = async (startFrom?: number): Promise<number> => {
  if (startFrom === undefined) {
    return getRandomPort()
  }

  let port = startFrom
  while (!(await isPortFree(port))) {
    port += 1
    if (port > startFrom + 1000) {
      throw new Error(`No available port found in range ${startFrom}-${port}`)
    }
  }
  return port
}

export { getFreePort }
