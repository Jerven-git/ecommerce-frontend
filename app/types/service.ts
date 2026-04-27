export interface ServiceCategory {
  id: number
  name: string
  slug: string
  gradient_from: string
  gradient_to: string
  image_url: string | null
  overlay_opacity: number
  sort_order: number
  services_count?: number
  created_at?: string
  updated_at?: string
}

export interface ServiceMedia {
  id: number
  url: string
  collection: string
}

/**
 * Public listing shape returned by `/services`.
 */
export interface Service {
  id: number
  slug: string
  title: string
  eyebrow: string | null
  description: string | null
  cover_image_url: string | null
  category_id: number | null
  category?: ServiceCategory | null
  cta_label: string | null
  cta_link: string | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  sort_order: number
  created_at?: string
  updated_at?: string
}

/**
 * Extended shape returned by `/services/:slug` for the detail page.
 */
export interface ServiceDetail extends Service {
  body: string | null
  seo_title: string | null
  seo_description: string | null
  media?: ServiceMedia[]
}

export interface PaginatedServices {
  data: Service[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
