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

  return clone({
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
    header_cta: { enabled: false, label: '', link: '', ...headerCta },
    footer_banner: {
      enabled: false,
      heading: '',
      subtitle: '',
      button_label: '',
      button_link: '',
      background_color: '#111827',
      background_color_to: '',
      text_color: '#ffffff',
      ...footerBanner,
    },
    footer: {
      tagline: '',
      copyright_text: '',
      show_tagline: true,
      show_quick_links: true,
      show_contact_info: true,
      show_social_links: true,
      ...footer,
    },
    about_content: payload.about_content ?? config.about_content ?? '',
    about_highlights: { items: aboutHighlights?.items ?? [] },
    story_page: {
      enabled: story?.enabled ?? false,
      hero: { eyebrow: '', heading: '', subtitle: '', ...story?.hero },
      section_a: { heading: '', body: '', cta_label: '', cta_link: '/shop', image_position: 'right', image_url: null, ...story?.section_a },
      section_b: { heading: '', body: '', cta_label: '', cta_link: '/contact', image_position: 'left', image_url: null, ...story?.section_b },
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

  const fetchDraft = () => $apiFetch<{ data: WebsiteEditorDraftState }>('/site-config/draft')
  const saveDraft = (baseUpdatedAt: string, draftVersion: number | null, payload: WebsiteEditorDraftPayload) =>
    $apiFetch<{ data: WebsiteEditorDraftState }>('/site-config/draft', {
      method: 'PUT',
      body: { base_updated_at: baseUpdatedAt, draft_version: draftVersion, payload },
    })
  const discardDraft = () => $apiFetch<{ data: WebsiteEditorDraftState }>('/site-config/draft', {
    method: 'DELETE',
  })
  const publishDraft = () => $apiFetch<{ data: WebsiteEditorDraftState; message: string }>('/site-config/draft/publish', {
    method: 'POST',
  })
  const fetchVersions = () => $apiFetch<{ data: WebsiteEditorVersionSummary[]; published_hash: string }>('/site-config/versions')
  const fetchVersion = (versionId: number) => $apiFetch<{ data: WebsiteEditorVersion; published_hash: string }>(`/site-config/versions/${versionId}`)
  const restoreVersion = (versionId: number, baseHash: string) => $apiFetch<{ message: string }>(`/site-config/versions/${versionId}/restore`, {
    method: 'POST',
    body: { base_hash: baseHash },
  })

  return { fetchDraft, saveDraft, discardDraft, publishDraft, fetchVersions, fetchVersion, restoreVersion }
}
