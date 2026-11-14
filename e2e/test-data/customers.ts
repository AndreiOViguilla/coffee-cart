export interface Customer {
  name: string;
  email: string;
  subscribeToPromotions: boolean;
}

export const customers = {
  standard: {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    subscribeToPromotions: false,
  },
  subscriber: {
    name: 'John Smith',
    email: 'john.smith@example.com',
    subscribeToPromotions: true,
  },
} as const satisfies Record<string, Customer>;

/**
 * Builds a customer with a unique email so parallel runs never collide
 * if the app ever starts persisting orders.
 */
export function uniqueCustomer(overrides: Partial<Customer> = {}): Customer {
  const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return {
    name: 'Test Customer',
    email: `qa+${id}@example.com`,
    subscribeToPromotions: false,
    ...overrides,
  };
}
