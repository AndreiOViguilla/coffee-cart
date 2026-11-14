import { expect, type Locator, type Page } from '@playwright/test';

/** Native <dialog> opened by right-clicking a coffee cup: "Add X to the cart?" */
export class AddToCartDialog {
  readonly root: Locator;
  readonly yesButton: Locator;
  readonly noButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog');
    this.yesButton = this.root.getByRole('button', { name: 'Yes' });
    this.noButton = this.root.getByRole('button', { name: 'No' });
  }

  async expectOpenFor(productName: string): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.root).toContainText(`Add ${productName} to the cart?`);
  }

  async expectClosed(): Promise<void> {
    await expect(this.root).toBeHidden();
  }

  async confirm(): Promise<void> {
    await this.yesButton.click();
    await this.expectClosed();
  }

  async cancel(): Promise<void> {
    await this.noButton.click();
    await this.expectClosed();
  }
}
