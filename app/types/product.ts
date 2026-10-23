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
  hover_image_url?: string | null
  material?: string | null
  dimensions?: string | null
  stock: number
  can_backorder: boolean
  backorder_charge_policy?: 'charged_now' | 'charged_later'
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
  hover_zoom_enabled?: boolean
  seo_title?: string | null
  seo_description?: string | null
  og_image_url?: string | null
  noindex?: boolean
  media?: ProductMedia[]
  options?: ProductOption[]
  variants?: ProductVariant[]
}

/**
 * Store Admin listing/editing shape returned by `/products`.
 *
 * Admin inventory fields intentionally live beside the public product model so
 * Nuxt has one canonical `Product` export instead of discovering a competing
 * auto-import from the products composable.
 */
export interface AdminProduct extends ProductDetail {
  image_url: string
  weight: number | string
  length_cm: number | string
  width_cm: number | string
  height_cm: number | string
  shipping_calc_type: 'weight' | 'dimensions'
  volume_cbm: number
  category: string
  category_id: number | null
  is_active: boolean
  allow_backorder: boolean
  backorder_charge_policy: 'charged_now' | 'charged_later'
  created_at: string
  updated_at: string
  variants_count: number
  active_variants_sum_stock?: number | null
}

export interface PaginatedProducts {
  data: AdminProduct[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
