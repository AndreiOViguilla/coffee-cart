import { expect, type Locator, type Page } from '@playwright/test';
import type { Customer } from '@data/customers';

/** The "Payment details" modal opened by the checkout (Total) button. */
export class PaymentModal {
  readonly heading: Locator;
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly promotionCheckbox: Locator;
  readonly submitButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Payment details' });
    this.form = page.getByRole('form', { name: 'Payment form' });
    this.nameInput = this.form.getByLabel('Name');
    this.emailInput = this.form.getByLabel('Email');
    this.promotionCheckbox = this.form.getByRole('checkbox', { name: 'Promotion checkbox' });
    this.submitButton = this.form.getByRole('button', { name: 'Submit' });
    this.closeButton = page.getByRole('button', { name: '×' });
  }

  async expectOpen(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async expectClosed(): Promise<void> {
    await expect(this.heading).toBeHidden();
  }

  /** Inputs failing native HTML5 validation (e.g. empty `required`, bad email). */
  invalidFields(): Locator {
    return this.form.locator('input:invalid');
  }

  async fill(customer: Customer): Promise<void> {
    await this.nameInput.fill(customer.name);
    await this.emailInput.fill(customer.email);
    await this.promotionCheckbox.setChecked(customer.subscribeToPromotions);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Fill in the form and submit it. */
  async pay(customer: Customer): Promise<void> {
    await this.fill(customer);
    await this.submit();
  }
}
