import { test, expect } from '@fixtures/test';
import { products, promoOffer } from '@data/products';

/** Feature c: a promo popup appears when the cart reaches every 3rd item (3, 6, 9, ...). */
test.describe('Promo popup on every 3rd item', () => {
  test('appears on items 3 and 6, and not on the others', async ({ menuPage }) => {
    // Two rounds of three clicks -> cart counts 1..6. Six items keeps us under
    // the app's deliberate slowdown, which starts above 7.
    const rounds = [
      [products.espresso, products.mocha, products.americano],
      [products.cappuccino, products.cafeLatte, products.flatWhite],
    ];
    let count = 0;

    for (const [first, second, third] of rounds) {
      for (const product of [first, second]) {
        await menuPage.cup(product).click();
        await menuPage.header.expectCartCount(++count);
        await menuPage.promo.expectHidden();
      }

      await menuPage.cup(third).click();
      await menuPage.header.expectCartCount(++count);
      expect(count % promoOffer.everyNthItem).toBe(0);
      await menuPage.promo.expectVisible();
      await menuPage.promo.decline();
    }
  });

  test('"Yes, of course!" adds a discounted Mocha to the cart', async ({ menuPage, cartPage }) => {
    const items = [products.espresso, products.espresso, products.americano];
    await menuPage.addAllToCart(items, 'accept');

    const itemsTotal = items.reduce((sum, p) => sum + p.price, 0);
    await menuPage.header.expectCartCount(items.length + 1);
    await menuPage.expectTotal(itemsTotal + promoOffer.price);

    await menuPage.header.goToCart();
    await cartPage.expectLineItem(promoOffer.name, promoOffer.price, 1);
  });

  test('"Nah, I\'ll skip." does not change the cart', async ({ menuPage }) => {
    const items = [products.mocha, products.mocha, products.mocha];
    await menuPage.addAllToCart(items, 'decline');

    await menuPage.header.expectCartCount(items.length);
    await menuPage.expectTotal(products.mocha.price * items.length);
  });
});
