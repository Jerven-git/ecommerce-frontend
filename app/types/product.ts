export interface ProductMedia {
  id: number
  url: string
  collection: string
  alt_text?: string | null
}

export interface ProductOptionValue {
  id: number
  label: string
  image_url?: string | null
  position: number
}

export interface ProductOption {
  id: number
  name: string
  position: number
  values: ProductOptionValue[]
}

export interface ProductVariant {
  id: number
  sku?: string | null
  price?: number | null
  stock: number
  image_url?: string | null
  is_active: boolean
  option_values: (ProductOptionValue & {
    pivot: { product_option_id: number }
  })[]
}

/**
 * Public/storefront product shape returned by `/products` and rendered
 * by ProductCard, ProductViewModal, and shop/index listings.
 */
export interface Product {
  id: number
  slug: string
  name: string
  description: string
  price: number | string
  image_url?: string
  stock: number
  can_backorder: boolean
  category?: string
  categories?: { id: number; name: string }[]
  is_active?: boolean
  variants_count?: number
  created_at?: string
  updated_at?: string
}

/**
 * Extended shape returned by `/products/:slug` for the detail page.
 */
export interface ProductDetail extends Product {
  category_id?: number | null
  backorder_charge_policy?: 'charged_now' | 'charged_later'
  hover_zoom_enabled?: boolean
  seo_title?: string | null
  seo_description?: string | null
  og_image_url?: string | null
  noindex?: boolean
  media?: ProductMedia[]
  options?: ProductOption[]
  variants?: ProductVariant[]
}
