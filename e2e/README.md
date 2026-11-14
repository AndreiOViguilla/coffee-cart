# Coffee Cart – E2E tests

Playwright + TypeScript tests for [coffee-cart.app](https://coffee-cart.app).

Covered flow: **Add product → Handle promo popup → Checkout → Submit payment → Verify success**

## Quick start

```bash
cd e2e
npm ci
npx playwright install          # one time: downloads the browsers
npm test                        # all browsers, headless
npx playwright test --project=chromium --headed
npm run test:ui                 # interactive UI mode, the easiest way to debug
npm run report                  # open the last HTML report
```

| Env var               | Default                   | Purpose                                                                  |
| --------------------- | ------------------------- | ------------------------------------------------------------------------ |
| `BASE_URL`            | `https://coffee-cart.app` | Target environment (e.g. `http://localhost:5173` for `npm run dev`)      |
| `PW_CHROMIUM_CHANNEL` | _(bundled Chromium)_      | `chrome` / `msedge` to use an installed browser (see Troubleshooting)    |

## Project layout

```
e2e/
├── playwright.config.ts   # browsers, baseURL, retries, reporters, trace/video
├── fixtures/test.ts       # custom `test` + `expect`: ALWAYS import from here
├── pages/                 # Page Objects: locators + user actions + assertions
│   ├── MenuPage.ts
│   ├── CartPage.ts
│   └── components/        # pieces shared between pages (Header, PromoPopup, PaymentModal, Snackbar)
├── test-data/             # products, customers, order scenarios, expected messages
├── utils/                 # pure helpers (price formatting, expected-order calculation)
└── tests/                 # *.spec.ts: describe WHAT is tested, not HOW
    ├── checkout.spec.ts            # main purchase flow + payment form validation
    └── special-features/
        ├── translate.spec.ts           # double-click title → Chinese
        ├── add-to-cart-dialog.spec.ts  # right-click cup → "Add to cart?" dialog
        └── promo-popup.spec.ts         # promo on every 3rd item
```

### Layers and their rules

1. **Tests** (`tests/`) read like a user story. They call page-object methods and
   use data from `test-data/`. No CSS selectors and no literal prices or emails.
2. **Page objects** (`pages/`) are the only place that knows about the DOM.
   - Locator priority: `getByRole` → `getByLabel` → `getByText` → `getByTestId` → CSS (last resort, with a comment).
   - Assertion helpers are named `expect…` so the linter counts them as assertions.
3. **Fixtures** (`fixtures/test.ts`) handle setup and teardown:
   - `menuPage` opens `/` and waits for the coffee list to load.
   - `customer` gives each test a customer with a unique email.
   - `failOnPageErrors` (auto) fails a test if the browser throws an uncaught error.
   - Every test gets a fresh browser context, so the cart always starts empty.
4. **Test data** (`test-data/`): to add a checkout case, add an entry to
   `checkoutScenarios` in `orders.ts`. No test code needs to change.

## Rules that keep the suite stable (enforced by `npm run lint`)

- ❌ No `page.waitForTimeout()`, `setTimeout` or other sleeps. Use web-first
  assertions (`await expect(locator).toBeVisible()`), which retry automatically.
- ❌ No `{ force: true }`, `page.pause()`, `networkidle`, or element handles.
- ❌ No `test.only` (CI also fails on it via `forbidOnly`).
- ✅ Check state with `expect(...)` rather than reading values and comparing them yourself.

## App behaviour the framework accounts for

- **Promo popup:** shown when a menu click makes the cart count a multiple of 3.
  `MenuPage.addToCart(product, 'accept' | 'decline')` expects the popup exactly
  then, handles it, and asserts that it is hidden on every other click.
- **Deliberate slowness:** add-to-cart and submit run a heavy task, and adding
  slows a lot above 7 items. Scenarios stay at 7 items or fewer, and the expect
  timeout is 10s.

## CI

[`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml) runs lint and type-check, then
the suite on Chromium, Firefox and WebKit in parallel. HTML reports are always
uploaded; traces, screenshots and videos are uploaded when tests fail. A manual
run (`workflow_dispatch`) accepts a different `base_url`.

## Troubleshooting

- **`browserType.launch: spawn UNKNOWN` on Windows:** Windows Application
  Control (Smart App Control) is blocking Playwright's downloaded browser. Run
  against your installed Chrome instead:
  `PW_CHROMIUM_CHANNEL=chrome npx playwright test --project=chromium`
  (PowerShell: `$env:PW_CHROMIUM_CHANNEL='chrome'; npx playwright test --project=chromium`).
