import type { Product } from '~/types/product'

/**
 * Whether a product can currently be added to the cart.
 * True when in stock OR when backorder is allowed.
 */
export function isOrderable(product: Pick<Product, 'stock' | 'can_backorder'>): boolean {
  return product.stock > 0 || !!product.can_backorder
}
