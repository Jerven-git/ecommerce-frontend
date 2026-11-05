import type { WebsiteBlockType } from '~/themes/contracts'

export interface WebsitePageAction {
  label?: string | null
  link?: string | null
}

export interface WebsitePageBlock {
  id: string
  type: WebsiteBlockType
  schema_version: number
  visible: boolean
  variant: string | null
  content: Record<string, any>
  settings: Record<string, any>
}

export type WebsitePageFieldControl = 'text' | 'textarea' | 'media' | 'select' | 'number' | 'color' | 'multiselect'

export interface WebsitePageBlockFieldDefinition {
  key: string
  label: string
  control: WebsitePageFieldControl
  max?: number
  min?: number
  step?: number
  suffix?: string
  options?: string[]
}

export interface WebsitePageActionDefinition {
  key: string
  label: string
}

export interface WebsitePageBlockDefinition {
  type: WebsiteBlockType
  label: string
  description: string
  icon: string
  content_mode: 'manual' | 'connected'
  variants: string[]
  default_variant: string | null
  content_keys: string[]
  settings_keys: string[]
  defaults: {
    content: Record<string, any>
    settings: Record<string, any>
  }
  editor: {
    fields: WebsitePageBlockFieldDefinition[]
    settings: WebsitePageBlockFieldDefinition[]
    media: { setting: string, alt_setting: string | null } | null
    action: WebsitePageActionDefinition | null
    actions: WebsitePageActionDefinition[]
    repeater: {
      label: string
      item_label: string
      max_items: number
      default_item: Record<string, any>
      fields: WebsitePageBlockFieldDefinition[]
    } | null
    dynamic: {
      sources: string[]
      default_source: string
      supports_category: boolean
      supports_selection: boolean
    } | null
  }
}

export interface WebsitePageBlockDefinitionResponse {
  schema_version: number
  data: WebsitePageBlockDefinition[]
}

export interface WebsitePageDocument {
  blocks: WebsitePageBlock[]
  seo: {
    title: string | null
    description: string | null
    noindex: boolean
    og_image_media_id: number | null
  }
  localized_content: Record<string, {
    seo?: { title?: string | null, description?: string | null }
    blocks?: Record<string, { content: Record<string, any> }>
  }>
}

export interface WebsitePageSummary {
  id: number
  uuid: string
  path: string
  title: string
  draft_version: number
  draft_updated_at: string | null
  published_version: number | null
  published_path?: string | null
  is_published: boolean
  has_unpublished_changes: boolean
  created_at: string
  updated_at: string
}

export interface WebsitePageDetail extends WebsitePageSummary {
  payload: WebsitePageDocument
}

export interface WebsitePageMedia {
  id: number
  url: string
  alt: string | null
}

export interface WebsitePageCollectionItem {
  id: number
  title: string
  summary: string | null
  url: string
  image_url: string | null
  price?: string | number | null
}

export type WebsitePageConnectedBlockType = 'product-list' | 'collection-list' | 'service-list' | 'blog-post-list'

export interface WebsitePageContentCategory {
  id: number
  title: string
}

export interface WebsitePageContentOptions {
  items: WebsitePageCollectionItem[]
  categories: WebsitePageContentCategory[]
}

export interface WebsitePageRuntime {
  path: string
  title: string
  locale: string
  default_locale: string
  supported_locales: string[]
  release_id: string
  release_sequence: number
  version: number
  document: WebsitePageDocument
  media: Record<number, WebsitePageMedia>
  collections: Record<string, WebsitePageCollectionItem[]>
}

export interface PaginatedWebsitePages {
  data: WebsitePageSummary[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export function emptyWebsitePageDocument(): WebsitePageDocument {
  return {
    blocks: [],
    seo: { title: null, description: null, noindex: false, og_image_media_id: null },
    localized_content: {},
  }
}
