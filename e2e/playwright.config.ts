import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

/**
 * The target is configurable so the same suite can run against production,
 * a preview deployment, or a local `npm run dev` server (http://localhost:5173).
 */
const baseURL = process.env.BASE_URL ?? 'https://coffee-cart.app';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Fail the CI build if someone accidentally commits `test.only`.
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],

  expect: {
    // The app deliberately runs a long task on add-to-cart and on submit,
    // so give web-first assertions a little more headroom than the default.
    timeout: 10_000,
  },

  use: {
    baseURL,
    // The app exposes `data-test` attributes, so `getByTestId()` reads them.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Optional: run on an installed, signed browser instead of Playwright's
        // bundled build, e.g. PW_CHROMIUM_CHANNEL=chrome (or msedge). Needed on
        // machines where Windows Application Control blocks the bundled binary.
        channel: process.env.PW_CHROMIUM_CHANNEL || undefined,
      },
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
