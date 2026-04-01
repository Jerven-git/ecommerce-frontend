export interface SiteTheme {
  primary_color: string
  secondary_color: string
  accent_color: string
  heading_font: string
  body_font: string
  texture: string
}

export interface SiteConfig {
  id: number
  site_name: string
  theme: SiteTheme
  logo_url: string | null
  favicon_url: string | null
  cart_icon_url: string | null
  hero_title: string | null
  hero_subtitle: string | null
  hero_image_url: string | null
  hero_media_mime: string | null
  about_content: string | null
  about_image_url: string | null
  contact_image_url: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_entries: Array<{ label: string; email: string | null; phone: string | null }> | null
  favorites_enabled: boolean
  show_stock_quantity: boolean
  welcome_popup_enabled: boolean
  welcome_popup_heading: string | null
  welcome_popup_body: string | null
  welcome_popup_discount_id: number | null
  updated_at: string
}

export const DEFAULT_THEME: SiteTheme = {
  primary_color: '#6898ED',
  secondary_color: '#4B5979',
  accent_color: '#F3F4F6',
  heading_font: 'Inter',
  body_font: 'Inter',
  texture: 'none',
}

const DEFAULT_CONFIG: Partial<SiteConfig> = {
  theme: { ...DEFAULT_THEME },
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
      // Merge theme defaults so missing keys are always present
      const data = res.data
      data.theme = { ...DEFAULT_THEME, ...(data.theme ?? {}) }
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
