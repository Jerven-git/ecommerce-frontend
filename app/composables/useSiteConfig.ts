export interface SiteTheme {
  primary_color: string
  secondary_color: string
  accent_color: string
  heading_font: string
  body_font: string
  texture: string
}

export interface HomepageStep {
  icon?: string
  title: string
  description: string
}

export interface HomepageFeature {
  icon?: string
  title: string
  description: string
}

export interface HomepageStat {
  value: string
  label: string
}

export interface HomepageSteps {
  label: string
  heading: string
  subtitle: string
  items: HomepageStep[]
}

export interface HomepageFeatures {
  items: HomepageFeature[]
}

export interface HomepageStats {
  items: HomepageStat[]
}

export interface HomepageNewsletter {
  label: string
  heading: string
  subtitle: string
  disclaimer: string
}

export interface HomepageShowcaseTile {
  title: string
  cta_label: string
  category_id: number | null
  featured_product_id: number | null
}

export type HomepageShowcaseVideoStatus = 'idle' | 'processing' | 'ready' | 'failed'

export interface HomepageShowcase {
  enabled: boolean
  label: string
  heading: string
  subtitle: string
  video_url: string | null
  video_poster_url: string | null
  video_status: HomepageShowcaseVideoStatus
  tiles: HomepageShowcaseTile[]
}

export interface AboutHighlightItem {
  icon?: string
  title: string
  description: string
}

export interface AboutHighlights {
  items: AboutHighlightItem[]
}

export interface ContactPagePromise {
  icon?: string
  title: string
  description: string
}

export interface ContactPage {
  info_title: string
  info_subtitle: string
  info_description: string
  info_badge: string
  promises: ContactPagePromise[]
}

export interface ShopHeader {
  label: string
  heading: string
  subtitle: string
}

export interface BlogPageHeader {
  label: string
  heading: string
  subtitle: string
}

export interface BlogPageCta {
  heading: string
  subtitle: string
  button_label: string
  button_link: string
}

export interface BlogPage {
  header: BlogPageHeader
  cta?: BlogPageCta | null
}

export interface ServicesPageCtaLink {
  label: string
  link: string
}

export interface ServicesPageHeader {
  label: string
  heading: string
  subtitle: string
  primary_cta?: ServicesPageCtaLink | null
  secondary_cta?: ServicesPageCtaLink | null
}

export interface ServicesSummaryItem {
  title: string
  description: string
}

export interface ServicesStatItem {
  value: string
  label: string
}

export interface ServicesPageCta {
  heading: string
  subtitle: string
  button_label: string
  button_link: string
}

export interface ServicesPage {
  header: ServicesPageHeader
  summary?: { items: ServicesSummaryItem[] } | null
  stats?: { items: ServicesStatItem[] } | null
  cta?: ServicesPageCta | null
}

export interface ShopPromo {
  badge: string
  heading: string
  subtitle: string
  button_text: string
  perks: string[]
}

export type ModuleKey = 'shop' | 'blog' | 'services' | 'about' | 'contact'

export type ModulesEnabled = Record<ModuleKey, boolean>

export interface SiteConfig {
  id: number
  site_name: string
  theme: SiteTheme
  logo_url: string | null
  favicon_url: string | null
  cart_icon_url: string | null
  hero_title: string | null
  hero_subtitle: string | null
  hero_overlay_color: string
  hero_overlay_opacity: number
  hero_full_bleed: boolean
  hero_focal_x: number
  hero_focal_y: number
  hero_image_url: string | null
  hero_media_mime: string | null
  about_content: string | null
  about_image_url: string | null
  about_overlay_color: string
  about_overlay_opacity: number
  contact_image_url: string | null
  contact_overlay_color: string
  contact_overlay_opacity: number
  badge_in_stock_color: string
  contact_email: string | null
  contact_phone: string | null
  contact_entries: Array<{ label: string; email: string | null; phone: string | null }> | null
  favorites_enabled: boolean
  show_stock_quantity: boolean
  welcome_popup_enabled: boolean
  welcome_popup_heading: string | null
  welcome_popup_body: string | null
  welcome_popup_discount_id: number | null
  homepage_steps: HomepageSteps | null
  homepage_features: HomepageFeatures | null
  homepage_stats: HomepageStats | null
  homepage_newsletter: HomepageNewsletter | null
  homepage_showcase: HomepageShowcase | null
  about_highlights: AboutHighlights | null
  contact_page: ContactPage | null
  shop_header: ShopHeader | null
  shop_promo: ShopPromo | null
  blog_page: BlogPage | null
  blog_image_url: string | null
  blog_overlay_color: string
  blog_overlay_opacity: number
  services_page: ServicesPage | null
  services_image_url: string | null
  services_overlay_color: string
  services_overlay_opacity: number
  modules_enabled: ModulesEnabled
  updated_at: string
}

export const DEFAULT_MODULES_ENABLED: ModulesEnabled = {
  shop: true,
  blog: true,
  services: true,
  about: true,
  contact: true,
}

export const DEFAULT_THEME: SiteTheme = {
  primary_color: '#6898ED',
  secondary_color: '#4B5979',
  accent_color: '#F3F4F6',
  heading_font: 'Inter',
  body_font: 'Inter',
  texture: 'none',
}

/** Fallback color for the "In Stock" badge when `site_config.badge_in_stock_color` is unset. */
export const DEFAULT_IN_STOCK_COLOR = '#16a34a'

const DEFAULT_CONFIG: Partial<SiteConfig> = {
  theme: { ...DEFAULT_THEME },
  modules_enabled: { ...DEFAULT_MODULES_ENABLED },
}

// BroadcastChannel for cross-tab config sync
let _channel: BroadcastChannel | null = null
let _listening = false

function getChannel(): BroadcastChannel | null {
  if (!import.meta.client) return null
  if (!_channel) {
    try {
      _channel = new BroadcastChannel('ssu-site-config')
    } catch {
      // BroadcastChannel not supported
    }
  }
  return _channel
}

export function useSiteConfig() {
  const siteConfig = useState<SiteConfig | null>('siteConfig', () => null)
  const pending = useState<boolean>('siteConfigPending', () => false)
  const fetched = useState<boolean>('siteConfigFetched', () => false)

  async function fetchSiteConfig(force = false) {
    if ((!force && fetched.value) || pending.value) return
    pending.value = true
    try {
      const { $apiFetch } = useNuxtApp()
      const res = await $apiFetch<{ data: SiteConfig }>('/site-config')
      // Merge theme + module defaults so missing keys are always present
      const data = res.data
      data.theme = { ...DEFAULT_THEME, ...(data.theme ?? {}) }
      data.modules_enabled = { ...DEFAULT_MODULES_ENABLED, ...(data.modules_enabled ?? {}) }
      siteConfig.value = { ...DEFAULT_CONFIG, ...data } as SiteConfig
      fetched.value = true
    } catch {
      // Use defaults on failure
      siteConfig.value = DEFAULT_CONFIG as SiteConfig
    } finally {
      pending.value = false
    }
  }

  /** Notify other tabs to re-fetch site config */
  function broadcastConfigUpdate() {
    getChannel()?.postMessage('config-updated')
  }

  // Listen for updates from other tabs (register once)
  if (import.meta.client && !_listening) {
    _listening = true
    const ch = getChannel()
    if (ch) {
      ch.onmessage = () => {
        // Force re-fetch in this tab
        fetchSiteConfig(true)
      }
    }
  }

  return { siteConfig, pending, fetchSiteConfig, broadcastConfigUpdate }
}
