import type {
  AboutHighlights,
  BlogPage,
  ContactPage,
  Footer,
  FooterBanner,
  HeaderCta,
  HomepageFeatures,
  HomepageNewsletter,
  HomepageSectionSetting,
  HomepageStatement,
  HomepageStats,
  HomepageSteps,
  ServicesPage,
  ShopHeader,
  ShopPromo,
  SiteConfig,
  StoryPage,
} from '~/composables/useSiteConfig'
import { normalizeHomepageSections } from '~/utils/homepageSections'

export interface WebsiteEditorDraftPayload {
  default_locale: string
  supported_locales: string[]
  localized_content: Record<string, Record<string, string>>
  default_seo_title: string | null
  default_seo_description: string | null
  pages_seo: Record<string, { seo_title?: string | null; seo_description?: string | null }>
  site_name: string
  contact_email: string
  contact_phone: string
  contact_entries: Array<{ label: string; email: string; phone: string }>
  social_links: Array<{ platform: string; url: string; label: string }>
  logo_media_id: number | null
  logo_url: string | null
  favicon_media_id: number | null
  favicon_url: string | null
  cart_icon_media_id: number | null
  cart_icon_url: string | null
  footer_logo_media_id: number | null
  footer_logo_url: string | null
  hero_media_id: number | null
  hero_image_url: string | null
  hero_media_mime: string | null
  homepage_statement_media_id: number | null
  homepage_statement_image_url: string | null
  about_media_id: number | null
  about_image_url: string | null
  story_image_a_media_id: number | null
  story_image_a_url: string | null
  story_image_b_media_id: number | null
  story_image_b_url: string | null
  contact_media_id: number | null
  contact_image_url: string | null
  blog_media_id: number | null
  blog_image_url: string | null
  services_media_id: number | null
  services_image_url: string | null
  logo_alt_text: string
  logo_size: number
  footer_logo_size: number
  hero_title: string
  hero_subtitle: string
  hero_overlay_color: string
  hero_overlay_opacity: number
  hero_full_bleed: boolean
  hero_focal_x: number
  hero_focal_y: number
  homepage_steps: HomepageSteps
  homepage_features: HomepageFeatures
  homepage_stats: HomepageStats
  homepage_statement: Omit<HomepageStatement, 'image_url'>
  homepage_newsletter: HomepageNewsletter
  homepage_sections: HomepageSectionSetting[]
  header_cta: HeaderCta
  footer_banner: FooterBanner
  footer: Footer
  about_content: string
  about_highlights: AboutHighlights
  story_page: StoryPage
  contact_page: ContactPage
  shop_header: ShopHeader
  shop_promo: ShopPromo
  blog_page: BlogPage
  services_page: ServicesPage
  welcome_popup_enabled: boolean
  welcome_popup_heading: string
  welcome_popup_body: string
}

export interface WebsiteEditorVersionSummary {
  id: number
  created_at: string
  publisher_name: string | null
  release_note: string | null
  changed_areas: string[]
}

export interface WebsiteEditorVersion extends WebsiteEditorVersionSummary {
  payload: Partial<WebsiteEditorDraftPayload>
}

export interface WebsiteEditorDraftState {
  payload: Partial<WebsiteEditorDraftPayload>
  base_updated_at: string
  has_draft: boolean
  draft_updated_at: string | null
  draft_version: number | null
  workflow: WebsiteEditorWorkflow
}

export type WebsiteEditorReviewStatus = 'draft' | 'pending' | 'approved' | 'changes_requested'

export interface WebsiteEditorWorkflow {
  status: WebsiteEditorReviewStatus
  requested_by_name: string | null
  requested_at: string | null
  reviewed_by_name: string | null
  reviewed_at: string | null
  note: string | null
  scheduled_publish_at: string | null
  scheduled_by_name: string | null
  scheduled_release_note: string | null
  timezone: string
}

export type WebsiteEditorAssetSlot =
  | 'logo'
  | 'favicon'
  | 'cart_icon'
  | 'footer_logo'
  | 'hero'
  | 'homepage_statement'
  | 'about'
  | 'story_image_a'
  | 'story_image_b'
  | 'contact'
  | 'blog'
  | 'services'

export interface WebsiteEditorAssetUpload {
  id: number
  collection: WebsiteEditorAssetSlot
  url: string
  mime_type: string | null
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export function normalizeWebsiteEditorDraft(
  config: SiteConfig,
  payload: Partial<WebsiteEditorDraftPayload> = {},
): WebsiteEditorDraftPayload {
  const statement = payload.homepage_statement ?? config.homepage_statement
  const headerCta = payload.header_cta ?? config.header_cta
  const footerBanner = payload.footer_banner ?? config.footer_banner
  const footer = payload.footer ?? config.footer
  const aboutHighlights = payload.about_highlights ?? config.about_highlights
  const story = payload.story_page ?? config.story_page
  const contact = payload.contact_page ?? config.contact_page
  const shopHeader = payload.shop_header ?? config.shop_header
  const shopPromo = payload.shop_promo ?? config.shop_promo
  const blog = payload.blog_page ?? config.blog_page
  const services = payload.services_page ?? config.services_page
  const contactEntries = payload.contact_entries ?? config.contact_entries ?? []
  const socialLinks = payload.social_links ?? config.social_links ?? []
  const payloadValue = <K extends keyof WebsiteEditorDraftPayload>(key: K, fallback: WebsiteEditorDraftPayload[K]) =>
    Object.prototype.hasOwnProperty.call(payload, key) ? payload[key] as WebsiteEditorDraftPayload[K] : fallback
  const heroImageUrl = payloadValue('hero_image_url', config.hero_image_url ?? null)
  const statementImageUrl = payloadValue('homepage_statement_image_url', config.homepage_statement?.image_url ?? null)
  const aboutImageUrl = payloadValue('about_image_url', config.about_image_url ?? null)
  const storyImageAUrl = payloadValue('story_image_a_url', config.story_page?.section_a?.image_url ?? null)
  const storyImageBUrl = payloadValue('story_image_b_url', config.story_page?.section_b?.image_url ?? null)
  const contactImageUrl = payloadValue('contact_image_url', config.contact_image_url ?? null)
  const blogImageUrl = payloadValue('blog_image_url', config.blog_image_url ?? null)
  const servicesImageUrl = payloadValue('services_image_url', config.services_image_url ?? null)

  return clone({
    default_locale: payload.default_locale ?? config.default_locale ?? 'en',
    supported_locales: payload.supported_locales ?? config.supported_locales ?? [config.default_locale ?? 'en'],
    localized_content: payload.localized_content ?? config.localized_content ?? {},
    default_seo_title: payloadValue('default_seo_title', config.default_seo_title ?? null),
    default_seo_description: payloadValue('default_seo_description', config.default_seo_description ?? null),
    pages_seo: payload.pages_seo ?? config.pages_seo ?? {},
    site_name: payload.site_name ?? config.site_name ?? '',
    contact_email: payload.contact_email ?? config.contact_email ?? '',
    contact_phone: payload.contact_phone ?? config.contact_phone ?? '',
    contact_entries: contactEntries.map(entry => ({
      label: entry?.label ?? '',
      email: entry?.email ?? '',
      phone: entry?.phone ?? '',
    })),
    social_links: socialLinks.map(link => ({
      platform: link?.platform ?? '',
      url: link?.url ?? '',
      label: link?.label ?? '',
    })),
    logo_media_id: payloadValue('logo_media_id', null),
    logo_url: payloadValue('logo_url', config.logo_url ?? null),
    favicon_media_id: payloadValue('favicon_media_id', null),
    favicon_url: payloadValue('favicon_url', config.favicon_url ?? null),
    cart_icon_media_id: payloadValue('cart_icon_media_id', null),
    cart_icon_url: payloadValue('cart_icon_url', config.cart_icon_url ?? null),
    footer_logo_media_id: payloadValue('footer_logo_media_id', null),
    footer_logo_url: payloadValue('footer_logo_url', config.footer_logo_url ?? null),
    hero_media_id: payloadValue('hero_media_id', null),
    hero_image_url: heroImageUrl,
    hero_media_mime: payloadValue('hero_media_mime', config.hero_media_mime ?? null),
    homepage_statement_media_id: payloadValue('homepage_statement_media_id', null),
    homepage_statement_image_url: statementImageUrl,
    about_media_id: payloadValue('about_media_id', null),
    about_image_url: aboutImageUrl,
    story_image_a_media_id: payloadValue('story_image_a_media_id', null),
    story_image_a_url: storyImageAUrl,
    story_image_b_media_id: payloadValue('story_image_b_media_id', null),
    story_image_b_url: storyImageBUrl,
    contact_media_id: payloadValue('contact_media_id', null),
    contact_image_url: contactImageUrl,
    blog_media_id: payloadValue('blog_media_id', null),
    blog_image_url: blogImageUrl,
    services_media_id: payloadValue('services_media_id', null),
    services_image_url: servicesImageUrl,
    logo_alt_text: payloadValue('logo_alt_text', config.logo_alt_text ?? ''),
    logo_size: payloadValue('logo_size', config.logo_size ?? 36),
    footer_logo_size: payloadValue('footer_logo_size', config.footer_logo_size ?? 128),
    hero_title: payload.hero_title ?? config.hero_title ?? '',
    hero_subtitle: payload.hero_subtitle ?? config.hero_subtitle ?? '',
    hero_overlay_color: payload.hero_overlay_color ?? config.hero_overlay_color ?? '#000000',
    hero_overlay_opacity: payload.hero_overlay_opacity ?? config.hero_overlay_opacity ?? 45,
    hero_full_bleed: payload.hero_full_bleed ?? config.hero_full_bleed ?? false,
    hero_focal_x: payload.hero_focal_x ?? config.hero_focal_x ?? 50,
    hero_focal_y: payload.hero_focal_y ?? config.hero_focal_y ?? 50,
    homepage_steps: payload.homepage_steps ?? config.homepage_steps ?? {
      label: '', heading: '', subtitle: '', items: [],
    },
    homepage_features: payload.homepage_features ?? config.homepage_features ?? { items: [] },
    homepage_stats: payload.homepage_stats ?? config.homepage_stats ?? { items: [] },
    homepage_statement: {
      enabled: statement?.enabled ?? false,
      eyebrow: statement?.eyebrow ?? '',
      quote: statement?.quote ?? '',
      attribution: statement?.attribution ?? '',
      role: statement?.role ?? '',
      cta_label: statement?.cta_label ?? '',
      cta_link: statement?.cta_link ?? '',
    },
    homepage_newsletter: payload.homepage_newsletter ?? config.homepage_newsletter ?? {
      label: '', heading: '', subtitle: '', disclaimer: '',
    },
    homepage_sections: normalizeHomepageSections(payload.homepage_sections ?? config.homepage_sections),
    header_cta: {
      enabled: headerCta?.enabled ?? false,
      label: headerCta?.label ?? '',
      link: headerCta?.link ?? '',
    },
    footer_banner: {
      enabled: footerBanner?.enabled ?? false,
      heading: footerBanner?.heading ?? '',
      subtitle: footerBanner?.subtitle ?? '',
      button_label: footerBanner?.button_label ?? '',
      button_link: footerBanner?.button_link ?? '',
      background_color: footerBanner?.background_color ?? '#111827',
      background_color_to: footerBanner?.background_color_to ?? '',
      text_color: footerBanner?.text_color ?? '#ffffff',
    },
    footer: {
      tagline: footer?.tagline ?? '',
      copyright_text: footer?.copyright_text ?? '',
      show_tagline: footer?.show_tagline ?? true,
      show_quick_links: footer?.show_quick_links ?? true,
      show_contact_info: footer?.show_contact_info ?? true,
      show_social_links: footer?.show_social_links ?? true,
    },
    about_content: payload.about_content ?? config.about_content ?? '',
    about_highlights: { items: aboutHighlights?.items ?? [] },
    story_page: {
      enabled: story?.enabled ?? false,
      hero: { eyebrow: '', heading: '', subtitle: '', ...story?.hero },
      section_a: { heading: '', body: '', cta_label: '', cta_link: '/shop', image_position: 'right', ...story?.section_a, image_url: storyImageAUrl },
      section_b: { heading: '', body: '', cta_label: '', cta_link: '/contact', image_position: 'left', ...story?.section_b, image_url: storyImageBUrl },
    },
    contact_page: {
      info_title: '',
      info_subtitle: '',
      info_description: '',
      info_badge: '',
      faq_label: '',
      faq_heading: '',
      faq_subtitle: '',
      ...contact,
      promises: contact?.promises ?? [],
      faqs: contact?.faqs ?? [],
    },
    shop_header: { label: '', heading: '', subtitle: '', ...shopHeader },
    shop_promo: {
      badge: '', heading: '', subtitle: '', button_text: '', ...shopPromo,
      perks: shopPromo?.perks ?? [],
    },
    blog_page: {
      header: { label: '', heading: '', subtitle: '', ...blog?.header },
      cta: blog?.cta ?? null,
    },
    services_page: {
      header: {
        label: '', heading: '', subtitle: '', primary_cta: null, secondary_cta: null,
        ...services?.header,
      },
      summary: services?.summary ? { items: services.summary.items ?? [] } : null,
      stats: services?.stats ? { items: services.stats.items ?? [] } : null,
      cta: services?.cta ?? null,
    },
    welcome_popup_enabled: payload.welcome_popup_enabled ?? config.welcome_popup_enabled ?? false,
    welcome_popup_heading: payload.welcome_popup_heading ?? config.welcome_popup_heading ?? '',
    welcome_popup_body: payload.welcome_popup_body ?? config.welcome_popup_body ?? '',
  })
}

export function useWebsiteEditorDraft() {
  const { $apiFetch } = useNuxtApp()
  const authStore = useAuthStore()
  const preloadedDraft = useState<{ data: WebsiteEditorDraftState } | null>('websiteEditorPreloadedDraft', () => null)
  const preloadedAt = useState<number>('websiteEditorPreloadedDraftAt', () => 0)
  const preloadOwner = useState<string>('websiteEditorPreloadedDraftOwner', () => '')
  const preloadPending = useState<boolean>('websiteEditorDraftPreloadPending', () => false)

  const preloadMaxAge = 30_000
  const ownerKey = () => authStore.user
    ? `${authStore.user.id}:${authStore.user.store_id ?? authStore.user.store?.id ?? ''}`
    : ''
  const hasFreshPreload = () => Boolean(
    ownerKey()
    && preloadOwner.value === ownerKey()
    && preloadedDraft.value
    && Date.now() - preloadedAt.value < preloadMaxAge,
  )
  const requestDraft = () => $apiFetch<{ data: WebsiteEditorDraftState }>('/site-config/draft')

  const waitForPreload = async () => {
    if (!preloadPending.value) return
    await new Promise<void>((resolve) => {
      const stop = watch(preloadPending, (isPending) => {
        if (!isPending) {
          stop()
          resolve()
        }
      }, { flush: 'sync' })
    })
  }

  const preloadDraft = async () => {
    if (!import.meta.client || hasFreshPreload()) return
    if (preloadPending.value) {
      await waitForPreload()
      return
    }

    preloadPending.value = true
    try {
      preloadedDraft.value = await requestDraft()
      preloadedAt.value = Date.now()
      preloadOwner.value = ownerKey()
    } catch (error) {
      preloadedDraft.value = null
      preloadedAt.value = 0
      preloadOwner.value = ''
      throw error
    } finally {
      preloadPending.value = false
    }
  }

  const invalidatePreload = () => {
    preloadedDraft.value = null
    preloadedAt.value = 0
    preloadOwner.value = ''
  }

  const fetchDraft = async (options: { preferPreloaded?: boolean; force?: boolean } = {}) => {
    if (!options.force && options.preferPreloaded) {
      if (preloadPending.value) await waitForPreload()
      if (hasFreshPreload() && preloadedDraft.value) return clone(preloadedDraft.value)
    }

    const response = await requestDraft()
    preloadedDraft.value = response
    preloadedAt.value = Date.now()
    preloadOwner.value = ownerKey()
    return clone(response)
  }
  const saveDraft = (baseUpdatedAt: string, draftVersion: number | null, payload: WebsiteEditorDraftPayload) =>
    $apiFetch<{ data: WebsiteEditorDraftState }>('/site-config/draft', {
      method: 'PUT',
      body: { base_updated_at: baseUpdatedAt, draft_version: draftVersion, payload },
    }).finally(invalidatePreload)
  const discardDraft = () => $apiFetch<{ data: WebsiteEditorDraftState }>('/site-config/draft', {
    method: 'DELETE',
  }).finally(invalidatePreload)
  const publishDraft = (releaseNote = '') => $apiFetch<{ data: WebsiteEditorDraftState; message: string }>('/site-config/draft/publish', {
    method: 'POST',
    body: { release_note: releaseNote.trim() || null },
  }).finally(invalidatePreload)
  const requestDraftReview = (draftVersion: number, note = '') => $apiFetch<{ data: WebsiteEditorWorkflow; message: string }>('/site-config/draft/review/request', {
    method: 'POST',
    body: { draft_version: draftVersion, note: note.trim() || null },
  }).finally(invalidatePreload)
  const approveDraft = (draftVersion: number, note = '') => $apiFetch<{ data: WebsiteEditorWorkflow; message: string }>('/site-config/draft/review/approve', {
    method: 'POST',
    body: { draft_version: draftVersion, note: note.trim() || null },
  }).finally(invalidatePreload)
  const requestDraftChanges = (draftVersion: number, note: string) => $apiFetch<{ data: WebsiteEditorWorkflow; message: string }>('/site-config/draft/review/request-changes', {
    method: 'POST',
    body: { draft_version: draftVersion, note: note.trim() },
  }).finally(invalidatePreload)
  const scheduleDraft = (draftVersion: number, scheduledFor: string, releaseNote = '') => $apiFetch<{ data: WebsiteEditorWorkflow; message: string }>('/site-config/draft/schedule', {
    method: 'POST',
    body: { draft_version: draftVersion, scheduled_for: scheduledFor, release_note: releaseNote.trim() || null },
  }).finally(invalidatePreload)
  const cancelDraftSchedule = (draftVersion: number) => $apiFetch<{ data: WebsiteEditorWorkflow; message: string }>('/site-config/draft/schedule', {
    method: 'DELETE',
    body: { draft_version: draftVersion },
  }).finally(invalidatePreload)
  const fetchVersions = () => $apiFetch<{ data: WebsiteEditorVersionSummary[]; published_hash: string }>('/site-config/versions')
  const fetchVersion = (versionId: number) => $apiFetch<{ data: WebsiteEditorVersion; published_hash: string }>(`/site-config/versions/${versionId}`)
  const restoreVersion = (versionId: number, baseHash: string, draftVersion: number | null) => $apiFetch<{ data: WebsiteEditorDraftState; message: string }>(`/site-config/versions/${versionId}/restore`, {
    method: 'POST',
    body: { base_hash: baseHash, draft_version: draftVersion },
  }).finally(invalidatePreload)
  const deleteVersion = (versionId: number) => $apiFetch<{ message: string }>(`/site-config/versions/${versionId}`, {
    method: 'DELETE',
  })
  const uploadDraftAsset = (slot: WebsiteEditorAssetSlot, file: File) => {
    const body = new FormData()
    body.append('file', file)
    return $apiFetch<WebsiteEditorAssetUpload>(`/site-config/draft/media/${slot}`, {
      method: 'POST',
      body,
    })
  }

  return {
    fetchDraft,
    preloadDraft,
    saveDraft,
    discardDraft,
    publishDraft,
    requestDraftReview,
    approveDraft,
    requestDraftChanges,
    scheduleDraft,
    cancelDraftSchedule,
    fetchVersions,
    fetchVersion,
    restoreVersion,
    deleteVersion,
    uploadDraftAsset,
  }
}
