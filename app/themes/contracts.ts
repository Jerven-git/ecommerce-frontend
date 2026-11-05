import type { Component } from 'vue'
import type {
  ModuleKey,
  SiteConfig,
  ThemeLayoutReference,
  WebsiteProfileId,
} from '~/composables/useSiteConfig'

export const THEME_IDS = [
  'classic',
  'service-studio',
  'informational-editorial',
  'commerce-market',
] as const

export type ThemeId = typeof THEME_IDS[number]
export type ThemeCategory = 'general' | 'services' | 'informational' | 'ecommerce'

export const PUBLIC_PAGE_KINDS = [
  'home',
  'shop',
  'collection',
  'product',
  'cart',
  'checkout',
  'favorites',
  'tracking',
  'payment-complete',
  'backorder-payment',
  'order-success',
  'about',
  'story',
  'contact',
  'blog-index',
  'blog-detail',
  'services-index',
  'service-detail',
  'commissions',
  'gift-cards',
  'register',
  'subscribe',
  'custom-page',
] as const

export type SupportedPublicPageKind = typeof PUBLIC_PAGE_KINDS[number]
export type PublicPageKind = SupportedPublicPageKind | 'unknown'

export const WEBSITE_BLOCK_TYPES = [
  'hero',
  'rich-text',
  'image-text',
  'features',
  'stats',
  'gallery',
  'faq',
  'cta',
  'contact-form',
  'product-list',
  'collection-list',
  'service-list',
  'blog-post-list',
] as const

export type WebsiteBlockType = typeof WEBSITE_BLOCK_TYPES[number]

export interface ThemePreviewAssets {
  desktop: string
  mobile: string
}

export interface ThemeManifest {
  id: ThemeId
  version: string
  name: string
  description: string
  category: ThemeCategory
  available: boolean
  compatibleProfiles: readonly WebsiteProfileId[]
  recommendedModules: readonly ModuleKey[]
  supportedPages: readonly SupportedPublicPageKind[]
  allowedBlocks: readonly WebsiteBlockType[]
  settingsSchemaVersion: number
  defaultSettings: Readonly<Record<string, unknown>>
  /** Phase 7 supplies reviewed desktop and mobile catalogue screenshots. */
  previewAssets: ThemePreviewAssets | null
}

export interface StorefrontShellViewModel {
  siteConfig: SiteConfig | null
  configError: boolean
  configPending: boolean
  preview: boolean
  showWelcomePopup: boolean
}

export interface StorefrontPageViewModel {
  kind: PublicPageKind
  path: string
  locale: string
  preview: boolean
}

export interface ThemeRenderer {
  shell: Component
  pageFrame: Component
}

export interface ThemeRegistration {
  manifest: ThemeManifest
  renderer: ThemeRenderer | null
}

export type ThemeFallbackReason =
  | 'unknown-theme'
  | 'unsupported-version'
  | 'unavailable-theme'
  | 'missing-renderer'

export interface ResolvedThemeRegistration {
  registration: ThemeRegistration
  requested: ThemeLayoutReference
  fallbackReason: ThemeFallbackReason | null
}

