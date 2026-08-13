import type { Product } from '~/types/product'

type CategorisedProduct = {
  category?: string | null
  categories?: Array<{ name?: string | null }> | null
}

/**
 * Prefer the current category relationship over the legacy category string.
 * The legacy field defaults to "general", so that value does not represent
 * an actual category assignment.
 */
export function getProductCategoryNames(product: CategorisedProduct): string[] {
  const assignedNames = (product.categories ?? [])
    .map(category => category.name?.trim())
    .filter((name): name is string => Boolean(name))

  if (assignedNames.length > 0) {
    return [...new Set(assignedNames)]
  }

  const legacyName = product.category?.trim()
  return legacyName && legacyName.toLowerCase() !== 'general' ? [legacyName] : []
}

/**
 * Whether a product can currently be added to the cart.
 * True when in stock OR when backorder is allowed.
 */
export function isOrderable(product: Pick<Product, 'stock' | 'can_backorder'>): boolean {
  return product.stock > 0 || !!product.can_backorder
}
