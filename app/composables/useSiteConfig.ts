export interface SiteConfig {
  id: number
  site_name: string
  primary_color: string
  secondary_color: string
  heading_font: string | null
  body_font: string | null
  logo_url: string | null
  favicon_url: string | null
  hero_title: string | null
  hero_subtitle: string | null
  hero_image_url: string | null
  about_content: string | null
  about_image_url: string | null
  contact_image_url: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_entries: Array<{ label: string; email: string | null; phone: string | null }> | null
  favorites_enabled: boolean
  updated_at: string
}

const DEFAULT_CONFIG: Partial<SiteConfig> = {
  primary_color: '#6898ED',
  secondary_color: '#4B5979',
  heading_font: 'Inter',
  body_font: 'Inter',
}

export function useSiteConfig() {
  const siteConfig = useState<SiteConfig | null>('siteConfig', () => null)
  const pending = useState<boolean>('siteConfigPending', () => false)
  const fetched = useState<boolean>('siteConfigFetched', () => false)

  async function fetchSiteConfig() {
    if (fetched.value || pending.value) return
    pending.value = true
    try {
      const { $apiFetch } = useNuxtApp()
      const res = await $apiFetch<{ data: SiteConfig }>('/site-config')
      siteConfig.value = { ...DEFAULT_CONFIG, ...res.data } as SiteConfig
      fetched.value = true
    } catch {
      // Use defaults on failure
      siteConfig.value = DEFAULT_CONFIG as SiteConfig
    } finally {
      pending.value = false
    }
  }

  return { siteConfig, pending, fetchSiteConfig }
}
