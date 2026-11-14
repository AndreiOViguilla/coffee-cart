import { expect, type Locator, type Page } from '@playwright/test';

/** Top navigation bar, shown on every page. */
export class Header {
  readonly menuLink: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.menuLink = page.getByRole('link', { name: 'Menu page' });
    this.cartLink = page.getByRole('link', { name: 'Cart page' });
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async goToMenu(): Promise<void> {
    await this.menuLink.click();
  }

  /**
   * Reads the current count once (no waiting). Only use it to get a starting
   * value; to check a value, use `expectCartCount`, which retries.
   */
  async readCartCount(): Promise<number> {
    const text = (await this.cartLink.textContent()) ?? '';
    const match = text.match(/\((\d+)\)/);
    if (!match) throw new Error(`Could not parse cart count from "${text}"`);
    return Number(match[1]);
  }

  /** The nav link reads `cart (N)`. */
  async expectCartCount(count: number): Promise<void> {
    await expect(this.cartLink).toHaveText(`cart (${count})`);
  }
}
