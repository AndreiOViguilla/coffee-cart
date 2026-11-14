import { test } from '@fixtures/test';
import { products } from '@data/products';

/** Feature b: right-click a coffee cup to open an "Add X to the cart?" dialog. */
test.describe('Add-to-cart dialog (right-click)', () => {
  test('clicking "Yes" adds the coffee to the cart', async ({ menuPage, cartPage }) => {
    const dialog = await menuPage.rightClickCup(products.flatWhite);

    await dialog.confirm();

    await menuPage.header.expectCartCount(1);
    await menuPage.expectTotal(products.flatWhite.price);
    await menuPage.header.goToCart();
    await cartPage.expectLineItem(products.flatWhite.name, products.flatWhite.price, 1);
  });

  test('clicking "No" leaves the cart empty', async ({ menuPage }) => {
    const dialog = await menuPage.rightClickCup(products.americano);

    await dialog.cancel();

    await menuPage.header.expectCartCount(0);
    await menuPage.expectTotal(0);
  });

  test('the dialog names the coffee that was right-clicked', async ({ menuPage }) => {
    const dialog = await menuPage.rightClickCup(products.espresso);
    await dialog.expectOpenFor(products.espresso.name);
    await dialog.cancel();

    await menuPage.rightClickCup(products.cafeBreve);
    await dialog.expectOpenFor(products.cafeBreve.name);
    await dialog.cancel();
  });

  test('"Yes" on the same coffee twice increases its quantity', async ({ menuPage, cartPage }) => {
    await (await menuPage.rightClickCup(products.mocha)).confirm();
    await (await menuPage.rightClickCup(products.mocha)).confirm();

    await menuPage.header.expectCartCount(2);
    await menuPage.header.goToCart();
    await cartPage.expectLineItem(products.mocha.name, products.mocha.price, 2);
  });
});
