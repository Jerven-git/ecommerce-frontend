import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'
import type { WebsiteEditorPageId } from '~/utils/websiteEditorPages'

export interface WebsiteEditorLocaleOption {
  id: string
  label: string
  nativeLabel: string
}

export interface WebsiteEditorTranslationField {
  path: string
  label: string
  fallback: string
  maxlength: number
  multiline?: boolean
}

const localeOptions: Array<[string, string, string]> = [
  ['en', 'English', 'English'],
  ['en-PH', 'English (Philippines)', 'English (Philippines)'],
  ['fil', 'Filipino', 'Filipino'],
  ['es', 'Spanish', 'Español'],
  ['fr', 'French', 'Français'],
  ['de', 'German', 'Deutsch'],
  ['it', 'Italian', 'Italiano'],
  ['pt', 'Portuguese', 'Português'],
  ['nl', 'Dutch', 'Nederlands'],
  ['zh-CN', 'Chinese (Simplified)', '简体中文'],
  ['zh-TW', 'Chinese (Traditional)', '繁體中文'],
  ['ja', 'Japanese', '日本語'],
  ['ko', 'Korean', '한국어'],
  ['id', 'Indonesian', 'Bahasa Indonesia'],
  ['ms', 'Malay', 'Bahasa Melayu'],
  ['th', 'Thai', 'ไทย'],
  ['vi', 'Vietnamese', 'Tiếng Việt'],
  ['ar', 'Arabic', 'العربية'],
  ['hi', 'Hindi', 'हिन्दी'],
]

export const WEBSITE_EDITOR_LOCALES: WebsiteEditorLocaleOption[] = localeOptions
  .map(([id, label, nativeLabel]) => ({ id, label, nativeLabel }))

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function valueAt(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value === null || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[key]
  }, source)
}

function setAt(target: Record<string, any>, path: string, value: string) {
  const keys = path.split('.')
  let cursor = target
  for (const key of keys.slice(0, -1)) {
    if (cursor[key] === null || typeof cursor[key] !== 'object') cursor[key] = /^\d+$/.test(key) ? [] : {}
    cursor = cursor[key]
  }
  cursor[keys.at(-1)!] = value
}

export function websiteEditorLocaleName(locale: string) {
  return WEBSITE_EDITOR_LOCALES.find(option => option.id === locale)?.label ?? locale
}

export function applyWebsiteEditorLocale(payload: WebsiteEditorDraftPayload, locale: string): WebsiteEditorDraftPayload {
  const next = clone(payload)
  if (locale === payload.default_locale) return next
  for (const [path, value] of Object.entries(payload.localized_content[locale] ?? {})) setAt(next as unknown as Record<string, any>, path, value)
  return next
}

const scalar = (payload: WebsiteEditorDraftPayload, path: string, label: string, maxlength: number, multiline = false): WebsiteEditorTranslationField => ({
  path,
  label,
  fallback: String(valueAt(payload, path) ?? ''),
  maxlength,
  multiline,
})

const indexed = (
  payload: WebsiteEditorDraftPayload,
  basePath: string,
  fields: Array<{ key: string; label: string; maxlength: number; multiline?: boolean }>,
) => {
  const items = valueAt(payload, basePath)
  if (!Array.isArray(items)) return []
  return items.flatMap((_, index) => fields.map(field => scalar(
    payload,
    `${basePath}.${index}.${field.key}`,
    `${field.label} ${index + 1}`,
    field.maxlength,
    field.multiline,
  )))
}

function seoFields(payload: WebsiteEditorDraftPayload, page: WebsiteEditorPageId, section: string) {
  if (page === 'global' && section === 'store-details') return [
    scalar(payload, 'default_seo_title', 'Default search title', 255),
    scalar(payload, 'default_seo_description', 'Default search description', 1000, true),
  ]
  if (page === 'global' || page === 'popup' || (page === 'home' && section !== 'hero')) return []
  const seoPage = page === 'home' ? 'home' : page
  return [
    scalar(payload, `pages_seo.${seoPage}.seo_title`, 'Search title', 255),
    scalar(payload, `pages_seo.${seoPage}.seo_description`, 'Search description', 1000, true),
  ]
}

export function websiteEditorTranslationFields(
  payload: WebsiteEditorDraftPayload,
  page: WebsiteEditorPageId,
  section: string,
): WebsiteEditorTranslationField[] {
  let fields: WebsiteEditorTranslationField[] = []
  if (section === 'hero') fields = [scalar(payload, 'hero_title', 'Heading', 255), scalar(payload, 'hero_subtitle', 'Supporting text', 255, true)]
  else if (section === 'how-it-works') fields = [
    scalar(payload, 'homepage_steps.label', 'Label', 100), scalar(payload, 'homepage_steps.heading', 'Heading', 100), scalar(payload, 'homepage_steps.subtitle', 'Supporting text', 255, true),
    ...indexed(payload, 'homepage_steps.items', [{ key: 'title', label: 'Step title', maxlength: 100 }, { key: 'description', label: 'Step description', maxlength: 255, multiline: true }]),
  ]
  else if (section === 'features') fields = indexed(payload, 'homepage_features.items', [{ key: 'title', label: 'Feature title', maxlength: 100 }, { key: 'description', label: 'Feature description', maxlength: 255, multiline: true }])
  else if (section === 'stats') fields = indexed(payload, 'homepage_stats.items', [{ key: 'value', label: 'Statistic value', maxlength: 50 }, { key: 'label', label: 'Statistic label', maxlength: 100 }])
  else if (section === 'statement') fields = ['eyebrow', 'quote', 'attribution', 'role', 'cta_label'].map((key) => scalar(payload, `homepage_statement.${key}`, key.replace('_', ' '), key === 'quote' ? 1000 : key === 'cta_label' ? 50 : 100, key === 'quote'))
  else if (section === 'newsletter') fields = ['label', 'heading', 'subtitle', 'disclaimer'].map(key => scalar(payload, `homepage_newsletter.${key}`, key === 'subtitle' ? 'Supporting text' : key, key === 'label' || key === 'heading' ? 100 : 255, key === 'subtitle'))
  else if (section === 'brand-assets') fields = [scalar(payload, 'logo_alt_text', 'Logo accessible name', 255)]
  else if (section === 'store-details') fields = [
    scalar(payload, 'site_name', 'Store name', 255),
    ...indexed(payload, 'contact_entries', [{ key: 'label', label: 'Contact label', maxlength: 100 }]),
    ...indexed(payload, 'social_links', [{ key: 'label', label: 'Social link label', maxlength: 100 }]),
  ]
  else if (section === 'header') fields = [scalar(payload, 'header_cta.label', 'Button label', 30)]
  else if (section === 'footer-banner') fields = [scalar(payload, 'footer_banner.heading', 'Heading', 150), scalar(payload, 'footer_banner.subtitle', 'Supporting text', 255, true), scalar(payload, 'footer_banner.button_label', 'Button label', 30)]
  else if (section === 'footer') fields = [scalar(payload, 'footer.tagline', 'Tagline', 255, true), scalar(payload, 'footer.copyright_text', 'Copyright', 255)]
  else if (section === 'about-content') fields = [scalar(payload, 'about_content', 'Our story', 10000, true), ...indexed(payload, 'about_highlights.items', [{ key: 'title', label: 'Highlight title', maxlength: 100 }, { key: 'description', label: 'Highlight description', maxlength: 255, multiline: true }])]
  else if (section === 'story-content') fields = [
    scalar(payload, 'story_page.hero.eyebrow', 'Page label', 100), scalar(payload, 'story_page.hero.heading', 'Page heading', 150), scalar(payload, 'story_page.hero.subtitle', 'Page supporting text', 255, true),
    ...['section_a', 'section_b'].flatMap((part, index) => [scalar(payload, `story_page.${part}.heading`, `Section ${index + 1} heading`, 150), scalar(payload, `story_page.${part}.body`, `Section ${index + 1} body`, 2000, true), scalar(payload, `story_page.${part}.cta_label`, `Section ${index + 1} button label`, 50)]),
  ]
  else if (section === 'contact-content') fields = [
    scalar(payload, 'contact_page.info_title', 'Information heading', 100), scalar(payload, 'contact_page.info_subtitle', 'Information subtitle', 255), scalar(payload, 'contact_page.info_description', 'Information description', 500, true), scalar(payload, 'contact_page.info_badge', 'Response badge', 100),
    ...indexed(payload, 'contact_page.promises', [{ key: 'title', label: 'Promise title', maxlength: 100 }, { key: 'description', label: 'Promise description', maxlength: 255, multiline: true }]),
    scalar(payload, 'contact_page.faq_label', 'FAQ label', 50), scalar(payload, 'contact_page.faq_heading', 'FAQ heading', 100), scalar(payload, 'contact_page.faq_subtitle', 'FAQ supporting text', 255, true),
    ...indexed(payload, 'contact_page.faqs', [{ key: 'question', label: 'FAQ question', maxlength: 255 }, { key: 'answer', label: 'FAQ answer', maxlength: 1000, multiline: true }]),
  ]
  else if (section === 'shop-content') fields = [
    ...['label', 'heading', 'subtitle'].map(key => scalar(payload, `shop_header.${key}`, `Shop ${key}`, key === 'label' ? 100 : 255, key === 'subtitle')),
    scalar(payload, 'shop_promo.badge', 'Promotion badge', 100), scalar(payload, 'shop_promo.heading', 'Promotion heading', 255), scalar(payload, 'shop_promo.subtitle', 'Promotion supporting text', 500, true), scalar(payload, 'shop_promo.button_text', 'Promotion button label', 100),
    ...(payload.shop_promo.perks ?? []).map((_, index) => scalar(payload, `shop_promo.perks.${index}`, `Promotion perk ${index + 1}`, 100)),
  ]
  else if (section === 'blog-content') fields = [
    ...['label', 'heading', 'subtitle'].map(key => scalar(payload, `blog_page.header.${key}`, `Blog ${key}`, key === 'label' ? 100 : key === 'heading' ? 255 : 500, key === 'subtitle')),
    ...(['heading', 'subtitle', 'button_label'] as const).filter(key => payload.blog_page.cta).map(key => scalar(payload, `blog_page.cta.${key}`, `Closing ${key.replace('_', ' ')}`, key === 'button_label' ? 100 : key === 'heading' ? 255 : 500, key === 'subtitle')),
  ]
  else if (section === 'services-content') fields = [
    ...['label', 'heading', 'subtitle'].map(key => scalar(payload, `services_page.header.${key}`, `Services ${key}`, key === 'label' ? 100 : key === 'heading' ? 255 : 500, key === 'subtitle')),
    ...(payload.services_page.header.primary_cta ? [scalar(payload, 'services_page.header.primary_cta.label', 'Primary button label', 100)] : []),
    ...(payload.services_page.header.secondary_cta ? [scalar(payload, 'services_page.header.secondary_cta.label', 'Secondary button label', 100)] : []),
    ...indexed(payload, 'services_page.summary.items', [{ key: 'title', label: 'Summary title', maxlength: 100 }, { key: 'description', label: 'Summary description', maxlength: 255, multiline: true }]),
    ...indexed(payload, 'services_page.stats.items', [{ key: 'value', label: 'Statistic value', maxlength: 50 }, { key: 'label', label: 'Statistic label', maxlength: 150 }]),
    ...(payload.services_page.cta ? [scalar(payload, 'services_page.cta.heading', 'Closing heading', 255), scalar(payload, 'services_page.cta.subtitle', 'Closing supporting text', 500, true), scalar(payload, 'services_page.cta.button_label', 'Closing button label', 100)] : []),
  ]
  else if (section === 'welcome-popup') fields = [scalar(payload, 'welcome_popup_heading', 'Heading', 255), scalar(payload, 'welcome_popup_body', 'Message', 1000, true)]

  return [...fields, ...seoFields(payload, page, section)]
}

export function websiteEditorLocaleProgress(payload: WebsiteEditorDraftPayload, locale: string) {
  if (locale === payload.default_locale) return { translated: 0, total: 0, percent: 100 }
  const requiredPaths = new Set<string>()
  const pages: Array<[WebsiteEditorPageId, string]> = [
    ['home', 'hero'], ['home', 'how-it-works'], ['home', 'features'], ['home', 'stats'], ['home', 'statement'], ['home', 'newsletter'],
    ['global', 'brand-assets'], ['global', 'store-details'], ['global', 'header'], ['global', 'footer-banner'], ['global', 'footer'],
    ['about', 'about-content'], ['story', 'story-content'], ['contact', 'contact-content'], ['shop', 'shop-content'], ['blog', 'blog-content'], ['services', 'services-content'], ['popup', 'welcome-popup'],
  ]
  for (const [page, section] of pages) {
    for (const field of websiteEditorTranslationFields(payload, page, section)) {
      if (field.fallback.trim()) requiredPaths.add(field.path)
    }
  }
  const translations = payload.localized_content[locale] ?? {}
  const translated = [...requiredPaths].filter(path => Object.prototype.hasOwnProperty.call(translations, path)).length
  const total = requiredPaths.size
  return { translated, total, percent: total ? Math.round((translated / total) * 100) : 100 }
}
