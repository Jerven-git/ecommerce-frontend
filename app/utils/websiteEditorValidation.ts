import type { WebsiteEditorPageId } from '~/utils/websiteEditorPages'

export interface WebsiteEditorValidationTarget {
  page: WebsiteEditorPageId
  section: string
}

export function websiteEditorValidationTarget(
  errors: Record<string, string[]>,
  firstHomepageSection = 'hero',
): WebsiteEditorValidationTarget | null {
  const field = Object.keys(errors)[0] ?? ''
  if (field.startsWith('payload.social_links')) return { page: 'global', section: 'social-media' }
  if (
    field.startsWith('payload.logo_')
    || field.startsWith('payload.favicon_')
    || field.startsWith('payload.cart_icon_')
    || field.startsWith('payload.footer_logo_')
  ) return { page: 'global', section: 'brand-assets' }
  if (
    field === 'payload.site_name'
    || field === 'payload.contact_email'
    || field === 'payload.contact_phone'
    || field.startsWith('payload.contact_entries')
  ) return { page: 'global', section: 'store-details' }
  if (field.startsWith('payload.header_cta') || field.startsWith('payload.navigation')) return { page: 'global', section: 'header' }
  if (field.startsWith('payload.footer_banner')) return { page: 'global', section: 'footer-banner' }
  if (field.startsWith('payload.footer')) return { page: 'global', section: 'footer' }
  if (field.startsWith('payload.about_')) return { page: 'about', section: 'about-content' }
  if (field.startsWith('payload.story_page') || field.startsWith('payload.story_image_')) return { page: 'story', section: 'story-content' }
  if (field.startsWith('payload.contact_page') || field.startsWith('payload.contact_image')) return { page: 'contact', section: 'contact-content' }
  if (field.startsWith('payload.shop_')) return { page: 'shop', section: 'shop-content' }
  if (field.startsWith('payload.blog_page') || field.startsWith('payload.blog_image')) return { page: 'blog', section: 'blog-content' }
  if (field.startsWith('payload.services_page') || field.startsWith('payload.services_image')) return { page: 'services', section: 'services-content' }
  if (field.startsWith('payload.welcome_popup_')) return { page: 'popup', section: 'welcome-popup' }
  if (field.startsWith('payload.hero_')) return { page: 'home', section: 'hero' }
  if (field.startsWith('payload.homepage_steps')) return { page: 'home', section: 'how-it-works' }
  if (field.startsWith('payload.homepage_features')) return { page: 'home', section: 'features' }
  if (field.startsWith('payload.homepage_stats')) return { page: 'home', section: 'stats' }
  if (field.startsWith('payload.homepage_statement')) return { page: 'home', section: 'statement' }
  if (field.startsWith('payload.homepage_newsletter')) return { page: 'home', section: 'newsletter' }
  if (field.startsWith('payload.homepage_sections')) return { page: 'home', section: firstHomepageSection }
  return null
}
