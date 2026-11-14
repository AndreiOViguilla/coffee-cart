// Lint rules double as guard-rails for contributors: the Playwright plugin
// rejects hard-coded waits, `force: true` clicks, `page.pause()` and other
// patterns that make suites flaky.
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-eval': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-focused-test': 'error',
      // Page objects contain assertion helpers, so allow `expect` outside tests
      // and treat `expect*` methods as assertions.
      'playwright/no-standalone-expect': 'off',
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect', '\\.expect[A-Z]'] }],
    },
  },
  {
    // Forbid raw sleeps anywhere in the codebase, not just inside tests.
    files: ['**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='setTimeout']",
          message: 'Do not sleep. Use web-first assertions / auto-waiting locators instead.',
        },
      ],
    },
  },
);
