import { products, promoOffer, type Product } from '@data/products';
import type { OrderScenario } from '@data/orders';

export interface ExpectedLine {
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface ExpectedOrder {
  lines: ExpectedLine[];
  itemCount: number;
  total: number;
}

/**
 * Works out the cart contents a scenario should end with, following the app's
 * promo rule: the popup appears when a menu click makes the count a multiple
 * of 3. Accepting it adds one discounted Mocha, which also bumps the count.
 */
export function buildExpectedOrder(scenario: OrderScenario): ExpectedOrder {
  const quantities = new Map<string, { product: Pick<Product, 'name' | 'price'>; quantity: number }>();
  const add = (product: Pick<Product, 'name' | 'price'>) => {
    const entry = quantities.get(product.name) ?? { product, quantity: 0 };
    entry.quantity += 1;
    quantities.set(product.name, entry);
  };

  let count = 0;
  for (const key of scenario.items) {
    add(products[key]);
    count += 1;
    if (count % promoOffer.everyNthItem === 0 && scenario.promo === 'accept') {
      add(promoOffer);
      count += 1;
    }
  }

  const lines = [...quantities.values()].map(({ product, quantity }) => ({
    name: product.name,
    unitPrice: product.price,
    quantity,
  }));

  return {
    lines,
    itemCount: count,
    total: lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
  };
}
