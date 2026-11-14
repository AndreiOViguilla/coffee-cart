import { expect, type Locator, type Page } from '@playwright/test';

/** Toast at the bottom of the screen. It hides itself after about 3.6s. */
export class Snackbar {
  readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('.snackbar');
  }

  async expectSuccess(message: string): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.root).toHaveText(message);
    await expect(this.root).toHaveClass(/success/);
  }
}
