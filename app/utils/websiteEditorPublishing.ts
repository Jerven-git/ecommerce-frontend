import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'
import type { WebsiteEditorPageId } from '~/utils/websiteEditorPages'

export interface WebsiteEditorChangedArea {
  id: string
  label: string
  page: WebsiteEditorPageId
  section: string
  fields: Array<keyof WebsiteEditorDraftPayload>
}

export interface WebsiteEditorReadinessWarning {
  id: string
  label: string
  detail: string
  page: WebsiteEditorPageId
  section: string
}

const areas: WebsiteEditorChangedArea[] = [
  { id: 'languages', label: 'Languages and translations', page: 'global', section: 'store-details', fields: ['default_locale', 'supported_locales', 'localized_content', 'default_seo_title', 'default_seo_description', 'pages_seo'] },
  { id: 'brand-assets', label: 'Brand assets', page: 'global', section: 'brand-assets', fields: ['logo_media_id', 'logo_url', 'favicon_media_id', 'favicon_url', 'cart_icon_media_id', 'cart_icon_url', 'footer_logo_media_id', 'footer_logo_url', 'logo_alt_text', 'logo_size', 'footer_logo_size'] },
  { id: 'store-details', label: 'Store details', page: 'global', section: 'store-details', fields: ['site_name', 'contact_email', 'contact_phone', 'contact_entries', 'social_links'] },
  { id: 'header', label: 'Header', page: 'global', section: 'header', fields: ['header_cta'] },
  { id: 'announcement-banner', label: 'Announcement banner', page: 'global', section: 'footer-banner', fields: ['footer_banner'] },
  { id: 'footer', label: 'Footer', page: 'global', section: 'footer', fields: ['footer'] },
  { id: 'home-hero', label: 'Home hero', page: 'home', section: 'hero', fields: ['hero_media_id', 'hero_image_url', 'hero_media_mime', 'hero_title', 'hero_subtitle', 'hero_overlay_color', 'hero_overlay_opacity', 'hero_full_bleed', 'hero_focal_x', 'hero_focal_y'] },
  { id: 'home-layout', label: 'Home layout', page: 'home', section: 'hero', fields: ['homepage_sections'] },
  { id: 'how-it-works', label: 'How it works', page: 'home', section: 'how-it-works', fields: ['homepage_steps'] },
  { id: 'features', label: 'Features', page: 'home', section: 'features', fields: ['homepage_features'] },
  { id: 'stats', label: 'Stats', page: 'home', section: 'stats', fields: ['homepage_stats'] },
  { id: 'statement', label: 'Statement', page: 'home', section: 'statement', fields: ['homepage_statement_media_id', 'homepage_statement_image_url', 'homepage_statement'] },
  { id: 'newsletter', label: 'Newsletter', page: 'home', section: 'newsletter', fields: ['homepage_newsletter'] },
  { id: 'about', label: 'About', page: 'about', section: 'about-content', fields: ['about_media_id', 'about_image_url', 'about_content', 'about_highlights'] },
  { id: 'story', label: 'Story', page: 'story', section: 'story-content', fields: ['story_page', 'story_image_a_media_id', 'story_image_a_url', 'story_image_b_media_id', 'story_image_b_url'] },
  { id: 'contact', label: 'Contact', page: 'contact', section: 'contact-content', fields: ['contact_page', 'contact_media_id', 'contact_image_url'] },
  { id: 'shop', label: 'Shop', page: 'shop', section: 'shop-content', fields: ['shop_header', 'shop_promo'] },
  { id: 'blog', label: 'Blog', page: 'blog', section: 'blog-content', fields: ['blog_page', 'blog_media_id', 'blog_image_url'] },
  { id: 'services', label: 'Services', page: 'services', section: 'services-content', fields: ['services_page', 'services_media_id', 'services_image_url'] },
  { id: 'welcome-popup', label: 'Welcome popup', page: 'popup', section: 'welcome-popup', fields: ['welcome_popup_enabled', 'welcome_popup_heading', 'welcome_popup_body'] },
]

const sameValue = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0

export function websiteEditorChangedAreas(published: WebsiteEditorDraftPayload, draft: WebsiteEditorDraftPayload) {
  return areas.filter(area => area.fields.some(field => !sameValue(published[field], draft[field])))
}

export function websiteEditorReadinessWarnings(draft: WebsiteEditorDraftPayload): WebsiteEditorReadinessWarning[] {
  const warnings: WebsiteEditorReadinessWarning[] = []
  const visible = new Set(draft.homepage_sections.filter(section => section.visible).map(section => section.id))

  if (visible.has('hero') && !text(draft.hero_title)) warnings.push({ id: 'hero-heading', label: 'Hero heading is empty', detail: 'Customers may see a prominent image without a clear message.', page: 'home', section: 'hero' })
  if (visible.has('how-it-works') && draft.homepage_steps.items.length === 0) warnings.push({ id: 'steps-empty', label: 'How it works has no steps', detail: 'Hide this section or add at least one step.', page: 'home', section: 'how-it-works' })
  if (visible.has('features') && draft.homepage_features.items.length === 0) warnings.push({ id: 'features-empty', label: 'Features has no items', detail: 'Hide this section or add feature content.', page: 'home', section: 'features' })
  if (visible.has('stats') && draft.homepage_stats.items.length === 0) warnings.push({ id: 'stats-empty', label: 'Stats has no items', detail: 'Hide this section or add meaningful store statistics.', page: 'home', section: 'stats' })
  if (visible.has('statement') && draft.homepage_statement.enabled && !text(draft.homepage_statement.quote)) warnings.push({ id: 'statement-empty', label: 'Statement quote is empty', detail: 'The enabled statement needs its main quote.', page: 'home', section: 'statement' })
  if (draft.logo_url && !text(draft.logo_alt_text)) warnings.push({ id: 'logo-alt', label: 'Header logo needs an accessible name', detail: 'Add text that identifies the store logo for screen readers.', page: 'global', section: 'brand-assets' })
  if (draft.header_cta.enabled && (!text(draft.header_cta.label) || !text(draft.header_cta.link))) warnings.push({ id: 'header-cta', label: 'Header call-to-action is incomplete', detail: 'Add both a label and destination, or disable it.', page: 'global', section: 'header' })
  if (draft.footer_banner.enabled && !text(draft.footer_banner.heading)) warnings.push({ id: 'announcement-heading', label: 'Announcement banner needs a heading', detail: 'Add the message customers should see, or disable the banner.', page: 'global', section: 'footer-banner' })
  if (draft.welcome_popup_enabled && (!text(draft.welcome_popup_heading) || !text(draft.welcome_popup_body))) warnings.push({ id: 'popup-content', label: 'Welcome popup is incomplete', detail: 'Add both a heading and body, or disable the popup.', page: 'popup', section: 'welcome-popup' })

  return warnings
}
