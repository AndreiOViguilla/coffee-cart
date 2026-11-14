import { test as base, expect } from '@playwright/test';
import { MenuPage, CartPage, Snackbar } from '@pages/index';
import { uniqueCustomer, type Customer } from '@data/customers';

/**
 * Custom fixtures. Tests import `test` and `expect` from this file and NOT
 * from '@playwright/test', so every test gets the same setup and teardown.
 *
 *  - `menuPage`  : opens the menu and waits for the coffee list (setup).
 *  - `cartPage`  : CartPage object (navigation is up to the test).
 *  - `snackbar`  : toast messages.
 *  - `customer`  : a fresh customer with a unique email for each test.
 *  - `failOnPageErrors` (auto): collects uncaught browser errors and fails
 *    the test at teardown if any happened.
 *
 * Each test runs in its own browser context, so the cart (held in memory by
 * Vuex) always starts empty and tests never leak state into each other.
 */
type Fixtures = {
  menuPage: MenuPage;
  cartPage: CartPage;
  snackbar: Snackbar;
  customer: Customer;
  failOnPageErrors: void;
};

export const test = base.extend<Fixtures>({
  failOnPageErrors: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await use();

      if (errors.length) {
        await testInfo.attach('page-errors', { body: errors.join('\n'), contentType: 'text/plain' });
      }
      expect(errors, 'Uncaught errors in the browser during the test').toEqual([]);
    },
    { auto: true },
  ],

  menuPage: async ({ page }, use) => {
    const menuPage = new MenuPage(page);
    await menuPage.goto();
    await use(menuPage);
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  snackbar: async ({ page }, use) => {
    await use(new Snackbar(page));
  },

  customer: async ({}, use) => {
    await use(uniqueCustomer());
  },
});

export { expect };
