import { expect, type Locator, type Page } from '@playwright/test';
import { promoOffer, type Product } from '@data/products';
import type { PromoChoice } from '@data/orders';
import { formatPrice } from '@utils/money';
import { Header } from './components/Header';
import { PromoPopup } from './components/PromoPopup';
import { PaymentModal } from './components/PaymentModal';
import { AddToCartDialog } from './components/AddToCartDialog';

/**
 * The menu (home) page: the coffee list, the floating "Total" checkout button
 * and the overlays that appear on top of it.
 */
export class MenuPage {
  readonly header: Header;
  readonly promo: PromoPopup;
  readonly paymentModal: PaymentModal;
  readonly addToCartDialog: AddToCartDialog;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.promo = new PromoPopup(page);
    this.addToCartDialog = new AddToCartDialog(page);
    this.paymentModal = new PaymentModal(page);
    this.checkoutButton = page.getByRole('button', { name: 'Proceed to checkout' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.expectLoaded();
  }

  /** The coffee list comes from an async fetch, so wait for it to render. */
  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('listitem').filter({ has: this.page.locator('.cup') }).first()).toBeVisible();
  }

  // ---------- Locators ----------

  /**
   * One coffee tile (title + cup). Found by the cup's `aria-label`, which stays
   * in English even after the title is translated to Chinese.
   * `exact: true` stops "Mocha" from also matching "(Discounted) Mocha" in the promo.
   */
  menuItem(product: Product): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ has: this.page.getByLabel(product.name, { exact: true }) });
  }

  /** The clickable coffee cup. */
  cup(product: Product): Locator {
    return this.menuItem(product).getByLabel(product.name, { exact: true });
  }

  /** The coffee's title (name + price). Its text changes when translated. */
  title(product: Product): Locator {
    return this.menuItem(product).getByRole('heading');
  }

  // ---------- Actions ----------

  /**
   * Clicks a coffee once and deals with the promo popup that the app shows
   * on every 3rd item. Asserts the cart count after every step, so a failure
   * points at the exact click that went wrong.
   *
   * @returns the cart count after this step (including an accepted promo item).
   */
  async addToCart(product: Product, onPromo: PromoChoice = 'decline'): Promise<number> {
    const before = await this.header.readCartCount();
    await this.cup(product).click();

    let count = before + 1;
    await this.header.expectCartCount(count);

    if (count % promoOffer.everyNthItem === 0) {
      await this.promo.expectVisible();
      if (onPromo === 'accept') {
        await this.promo.accept();
        count += 1;
        await this.header.expectCartCount(count);
      } else {
        await this.promo.decline();
      }
    } else {
      await this.promo.expectHidden();
    }
    return count;
  }

  async addAllToCart(items: Product[], onPromo: PromoChoice = 'decline'): Promise<void> {
    for (const product of items) {
      await this.addToCart(product, onPromo);
    }
  }

  /** Double-clicking a title toggles it between English and Chinese. */
  async doubleClickTitle(product: Product): Promise<void> {
    await this.title(product).dblclick();
  }

  /** Right-clicking a cup opens the "Add X to the cart?" dialog. */
  async rightClickCup(product: Product): Promise<AddToCartDialog> {
    await this.cup(product).click({ button: 'right' });
    await this.addToCartDialog.expectOpenFor(product.name);
    return this.addToCartDialog;
  }

  /** Clicks the floating "Total: $x" button and waits for the payment modal. */
  async proceedToCheckout(): Promise<PaymentModal> {
    await this.checkoutButton.click();
    await this.paymentModal.expectOpen();
    return this.paymentModal;
  }

  // ---------- Assertions ----------

  async expectTotal(amount: number): Promise<void> {
    await expect(this.checkoutButton).toHaveText(`Total: ${formatPrice(amount)}`);
  }

  async expectTitleInChinese(product: Product): Promise<void> {
    await expect(this.title(product)).toContainText(product.chineseName);
    await expect(this.title(product)).not.toContainText(product.name);
  }

  async expectTitleInEnglish(product: Product): Promise<void> {
    await expect(this.title(product)).toContainText(product.name);
    await expect(this.title(product)).not.toContainText(product.chineseName);
  }
}
