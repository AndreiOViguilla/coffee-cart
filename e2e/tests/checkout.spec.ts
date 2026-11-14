import { test, expect } from '@fixtures/test';
import { checkoutScenarios, messages } from '@data/orders';
import { products } from '@data/products';
import { buildExpectedOrder } from '@utils/expected-order';

/**
 * Main flow: Add Product -> Handle Promo -> Checkout -> Submit Payment -> Verify Success.
 * One test per entry in `test-data/orders.ts`.
 */
test.describe('Checkout flow', () => {
  for (const scenario of checkoutScenarios) {
    test(`completes a purchase: ${scenario.title}`, { tag: '@smoke' }, async ({ menuPage, cartPage, snackbar }) => {
      const order = buildExpectedOrder(scenario);

      await test.step('Add products (handling the promo popup if it appears)', async () => {
        await menuPage.addAllToCart(
          scenario.items.map((key) => products[key]),
          scenario.promo,
        );
        await menuPage.header.expectCartCount(order.itemCount);
        await menuPage.expectTotal(order.total);
      });

      await test.step('Review the cart', async () => {
        await menuPage.header.goToCart();
        for (const line of order.lines) {
          await cartPage.expectLineItem(line.name, line.unitPrice, line.quantity);
        }
        await cartPage.expectTotal(order.total);
      });

      const paymentModal = await test.step('Proceed to checkout', () => cartPage.proceedToCheckout());

      await test.step('Submit payment details', async () => {
        await paymentModal.pay(scenario.customer);
      });

      await test.step('Verify success', async () => {
        await snackbar.expectSuccess(messages.purchaseSuccess);
        await paymentModal.expectClosed();
        await menuPage.header.expectCartCount(0);
        await menuPage.expectTotal(0);
      });
    });
  }

  test('can check out straight from the menu', async ({ menuPage, snackbar, customer }) => {
    await menuPage.addToCart(products.mocha);
    const paymentModal = await menuPage.proceedToCheckout();
    await paymentModal.pay(customer);

    await snackbar.expectSuccess(messages.purchaseSuccess);
    await menuPage.header.expectCartCount(0);
  });
});

test.describe('Payment form validation', () => {
  test.beforeEach(async ({ menuPage }) => {
    await menuPage.addToCart(products.espresso);
    await menuPage.proceedToCheckout();
  });

  test('blocks submission when required fields are empty', async ({ menuPage }) => {
    const { paymentModal } = menuPage;
    await paymentModal.submit();

    await expect(paymentModal.invalidFields()).toHaveCount(2);
    await paymentModal.expectOpen();
    await menuPage.header.expectCartCount(1);
  });

  test('blocks submission with a malformed email', async ({ menuPage, customer }) => {
    const { paymentModal } = menuPage;
    await paymentModal.pay({ ...customer, email: 'not-an-email' });

    await expect(paymentModal.invalidFields()).toHaveCount(1);
    await expect(paymentModal.emailInput).toHaveAttribute('type', 'email');
    await paymentModal.expectOpen();
    await menuPage.header.expectCartCount(1);
  });

  test('closing the modal keeps the cart intact', async ({ menuPage }) => {
    const { paymentModal } = menuPage;
    await paymentModal.closeButton.click();

    await paymentModal.expectClosed();
    await menuPage.header.expectCartCount(1);
  });
});
