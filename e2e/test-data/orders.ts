import { customers, type Customer } from './customers';
import type { ProductKey } from './products';

export type PromoChoice = 'accept' | 'decline';

/**
 * A data-driven checkout scenario. Add a new entry here to get a new
 * end-to-end test for free; no changes to test code are needed.
 */
export interface OrderScenario {
  title: string;
  /** Products clicked on the menu, in order. Keep it to 7 or fewer (the app slows down past 7). */
  items: ProductKey[];
  /** What to do when the promo popup appears (only matters at every 3rd item). */
  promo: PromoChoice;
  customer: Customer;
}

export const checkoutScenarios: OrderScenario[] = [
  {
    title: 'single item, no promo',
    items: ['espresso'],
    promo: 'decline',
    customer: customers.standard,
  },
  {
    title: 'three items, promo accepted',
    items: ['cappuccino', 'mocha', 'americano'],
    promo: 'accept',
    customer: customers.subscriber,
  },
  {
    title: 'three items, promo declined',
    items: ['flatWhite', 'flatWhite', 'cafeLatte'],
    promo: 'decline',
    customer: customers.standard,
  },
];

export const messages = {
  purchaseSuccess: 'Thanks for your purchase. Please check your email for payment.',
  emptyCart: 'No coffee, go add some.',
} as const;
