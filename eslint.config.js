import { tsNodeConfig } from "@asd14/eslint-config/typescript"

const SRC_FILES = ["src/**/*.ts"]
const TEST_FILES = ["src/**/*.test.ts"]
const DEV_FILES = ["eslint.config.js"]

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ...tsNodeConfig,
    files: [...SRC_FILES, ...DEV_FILES, ...TEST_FILES],
  },
]
