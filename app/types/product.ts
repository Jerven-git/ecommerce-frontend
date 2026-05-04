export interface ProductMedia {
  id: number
  url: string
  collection: string
  alt_text?: string | null
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
  created_at?: string
  updated_at?: string
}

/**
 * Extended shape returned by `/products/:slug` for the detail page.
 */
export interface ProductDetail extends Product {
  category_id?: number | null
  backorder_charge_policy?: 'charged_now' | 'charged_later'
  seo_title?: string | null
  seo_description?: string | null
  og_image_url?: string | null
  noindex?: boolean
  media?: ProductMedia[]
}
