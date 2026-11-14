import { test } from '@fixtures/test';
import { products } from '@data/products';

/** Feature a: double-click a coffee title to translate it to Chinese (and back). */
test.describe('Translate title to Chinese (double-click)', () => {
  for (const product of Object.values(products)) {
    test(`toggles "${product.name}" between English and Chinese`, async ({ menuPage }) => {
      await menuPage.expectTitleInEnglish(product);

      await menuPage.doubleClickTitle(product);
      await menuPage.expectTitleInChinese(product);

      await menuPage.doubleClickTitle(product);
      await menuPage.expectTitleInEnglish(product);
    });
  }

  test('only the double-clicked title is translated', async ({ menuPage }) => {
    await menuPage.doubleClickTitle(products.cappuccino);

    await menuPage.expectTitleInChinese(products.cappuccino);
    await menuPage.expectTitleInEnglish(products.espresso);
    await menuPage.expectTitleInEnglish(products.mocha);
  });

  test('translating a title does not add it to the cart', async ({ menuPage }) => {
    await menuPage.doubleClickTitle(products.flatWhite);
    await menuPage.expectTitleInChinese(products.flatWhite);

    await menuPage.header.expectCartCount(0);
    await menuPage.expectTotal(0);
  });
});
