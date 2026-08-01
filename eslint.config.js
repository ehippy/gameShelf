import eslintJs from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import globals from 'globals'

export default [
  // 1. Default (all files): @eslint/js recommended rules + node/browser/es2021 globals
  {
    files: ['**/*.js', '**/*.vue'],
    ignores: ['node_modules/', 'dist/', 'tests/e2e/'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
    },
  },
  // 2. Tests (**/*.test.js): vitest plugin with recommended rules + specific rules
  {
    files: ['**/*.test.js'],
    ...vitest.configs.recommended,
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', '**.expect'] }],
      'vitest/no-focused-tests': 'error',
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },
  // 3. Vitest config file: node globals only
  {
    files: ['vitest.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  // 4. Ignored paths: node_modules/, dist/, tests/e2e/ (Playwright files)
  {
    ignores: ['node_modules/', 'dist/', 'tests/e2e/'],
  },
]
