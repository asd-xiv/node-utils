import { tsConfig, devConfig, commonIgnores } from "@asd14/eslint-config/ts"

const SRC_FILES = ["src/**/*.ts"]
const TEST_FILES = ["src/**/*.test.ts"]
const TST_FILES = ["src/**/*.tst.ts"]
const DEV_FILES = ["eslint.config.js"]

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: commonIgnores },
  { files: SRC_FILES, ...tsConfig },
  {
    files: [...TEST_FILES, ...TST_FILES, ...DEV_FILES],
    ...tsConfig,
    ...devConfig,
    rules: {
      ...tsConfig.rules,
      ...devConfig.rules,

      // `node:test` describe/test return promises that are handled by the test runner
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
]
