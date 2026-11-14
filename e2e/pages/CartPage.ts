import { expect, type Locator, type Page } from '@playwright/test';
import { messages } from '@data/orders';
import { formatPrice } from '@utils/money';
import { Header } from './components/Header';
import { PaymentModal } from './components/PaymentModal';

/** The /cart page: line items with +/- controls and a checkout button. */
export class CartPage {
  readonly header: Header;
  readonly paymentModal: PaymentModal;
  readonly checkoutButton: Locator;
  readonly emptyMessage: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.paymentModal = new PaymentModal(page);
    this.checkoutButton = page.getByRole('button', { name: 'Proceed to checkout' });
    this.emptyMessage = page.getByText(messages.emptyCart);
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart');
  }

  /** One line item in the cart, found by its "Remove all <name>" button. */
  lineItem(productName: string): Locator {
    return this.page
      .locator('li.list-item')
      .filter({ has: this.page.getByRole('button', { name: `Remove all ${productName}`, exact: true }) });
  }

  async expectLineItem(productName: string, unitPrice: number, quantity: number): Promise<void> {
    const row = this.lineItem(productName);
    await expect(row).toBeVisible();
    await expect(row).toContainText(`${formatPrice(unitPrice)} x ${quantity}`);
    await expect(row).toContainText(formatPrice(unitPrice * quantity));
  }

  async expectTotal(amount: number): Promise<void> {
    await expect(this.checkoutButton).toHaveText(`Total: ${formatPrice(amount)}`);
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible();
  }

  async proceedToCheckout(): Promise<PaymentModal> {
    await this.checkoutButton.click();
    await this.paymentModal.expectOpen();
    return this.paymentModal;
  }
}
