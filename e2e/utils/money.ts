/** Formats a number the same way the app does: `$12.00`. */
export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}
