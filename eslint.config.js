import eslintJs from '@eslint/js'
import vitest from '@vitest/eslint-plugin'

export default [
  // 1. Default (all files): @eslint/js recommended rules + browser/node/es2021 globals
  {
    ...eslintJs.configs.recommended,
    languageOptions: {
      globals: {
        ...eslintJs.configs.recommended.globals,
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
      'vitest/no-only-tests': 'error',
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
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },
  // 4. Ignored paths: node_modules/, dist/, tests/e2e/
  {
    ignores: ['node_modules/', 'dist/', 'tests/e2e/'],
  },
]
