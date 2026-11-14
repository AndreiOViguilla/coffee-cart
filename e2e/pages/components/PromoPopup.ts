import { expect, type Locator, type Page } from '@playwright/test';
import { promoOffer } from '@data/products';

/** The "It's your lucky day!" offer that appears on every 3rd item added. */
export class PromoPopup {
  readonly root: Locator;
  readonly acceptButton: Locator;
  readonly declineButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('.promo');
    this.acceptButton = this.root.getByRole('button', { name: 'Yes, of course!' });
    this.declineButton = this.root.getByRole('button', { name: "Nah, I'll skip." });
  }

  async expectVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.root).toContainText(promoOffer.message);
  }

  async expectHidden(): Promise<void> {
    await expect(this.root).toBeHidden();
  }

  async accept(): Promise<void> {
    await this.acceptButton.click();
    await this.expectHidden();
  }

  async decline(): Promise<void> {
    await this.declineButton.click();
    await this.expectHidden();
  }
}
