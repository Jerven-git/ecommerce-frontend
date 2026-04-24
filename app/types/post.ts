export interface PostCategory {
  id: number
  name: string
  slug: string
  gradient_from: string
  gradient_to: string
  image_url: string | null
  overlay_opacity: number
  sort_order: number
  posts_count?: number
  created_at?: string
  updated_at?: string
}

export interface PostMedia {
  id: number
  url: string
  collection: string
}

/**
 * Public listing shape returned by `/posts` and rendered by PostCard.
 */
export interface Post {
  id: number
  slug: string
  title: string
  excerpt: string | null
  cover_image_url: string | null
  author_name: string | null
  category_id: number | null
  category?: PostCategory | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Extended shape returned by `/posts/:slug` for the detail page.
 */
export interface PostDetail extends Post {
  body: string | null
  seo_title: string | null
  seo_description: string | null
  media?: PostMedia[]
}

export interface PaginatedPosts {
  data: Post[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
