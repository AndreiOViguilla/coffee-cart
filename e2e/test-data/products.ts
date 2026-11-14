/**
 * Product catalogue as the tests expect it.
 * Source of truth: `public/list.json` (names, prices) and the translation map
 * in `src/components/pages/ListPage.vue` (Chinese names).
 * Adding a product here makes it available to every test with autocompletion.
 */
export interface Product {
  name: string;
  price: number;
  chineseName: string;
}

export const products = {
  espresso: { name: 'Espresso', price: 10, chineseName: '特浓咖啡' },
  espressoMacchiato: { name: 'Espresso Macchiato', price: 12, chineseName: '浓缩玛奇朵' },
  cappuccino: { name: 'Cappuccino', price: 19, chineseName: '卡布奇诺' },
  mocha: { name: 'Mocha', price: 8, chineseName: '摩卡' },
  flatWhite: { name: 'Flat White', price: 18, chineseName: '平白咖啡' },
  americano: { name: 'Americano', price: 7, chineseName: '美式咖啡' },
  cafeLatte: { name: 'Cafe Latte', price: 16, chineseName: '拿铁' },
  espressoConPanna: { name: 'Espresso Con Panna', price: 14, chineseName: '浓缩康宝蓝' },
  cafeBreve: { name: 'Cafe Breve', price: 15, chineseName: '半拿铁' },
} as const satisfies Record<string, Product>;

export type ProductKey = keyof typeof products;

/** The offer shown on every 3rd item added to the cart. */
export const promoOffer = {
  name: '(Discounted) Mocha',
  price: 4,
  message: "It's your lucky day! Get an extra cup of Mocha for $4.",
  /** The promo appears whenever the cart count is a multiple of this. */
  everyNthItem: 3,
} as const;
