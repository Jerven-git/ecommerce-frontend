import type { ModuleKey } from '~/composables/useSiteConfig'

export type WebsiteEditorPageId = 'home' | 'global' | 'about' | 'story' | 'contact' | 'shop' | 'blog' | 'services' | 'popup'

export interface WebsiteEditorPageOption {
  id: WebsiteEditorPageId
  label: string
  icon: string
  path: string
  module?: ModuleKey
}

export interface WebsiteEditorStaticSection {
  id: string
  label: string
  icon: string
}

export const WEBSITE_EDITOR_PAGES: WebsiteEditorPageOption[] = [
  { id: 'home', label: 'Home page', icon: 'heroicons:home', path: '/' },
  { id: 'global', label: 'Header & footer', icon: 'heroicons:bars-3-bottom-left', path: '/' },
  { id: 'about', label: 'About', icon: 'heroicons:building-storefront', path: '/about', module: 'about' },
  { id: 'story', label: 'Story', icon: 'heroicons:book-open', path: '/story' },
  { id: 'contact', label: 'Contact', icon: 'heroicons:chat-bubble-left-right', path: '/contact', module: 'contact' },
  { id: 'shop', label: 'Shop', icon: 'heroicons:shopping-bag', path: '/shop', module: 'shop' },
  { id: 'blog', label: 'Blog', icon: 'heroicons:newspaper', path: '/blog', module: 'blog' },
  { id: 'services', label: 'Services', icon: 'heroicons:briefcase', path: '/services', module: 'services' },
  { id: 'popup', label: 'Welcome popup', icon: 'heroicons:gift', path: '/' },
]

export const WEBSITE_EDITOR_STATIC_SECTIONS: Record<Exclude<WebsiteEditorPageId, 'home'>, WebsiteEditorStaticSection[]> = {
  global: [
    { id: 'header', label: 'Header call-to-action', icon: 'heroicons:cursor-arrow-rays' },
    { id: 'footer-banner', label: 'Announcement banner', icon: 'heroicons:megaphone' },
    { id: 'footer', label: 'Footer', icon: 'heroicons:rectangle-stack' },
  ],
  about: [{ id: 'about-content', label: 'About content', icon: 'heroicons:building-storefront' }],
  story: [{ id: 'story-content', label: 'Story content', icon: 'heroicons:book-open' }],
  contact: [{ id: 'contact-content', label: 'Contact content', icon: 'heroicons:chat-bubble-left-right' }],
  shop: [{ id: 'shop-content', label: 'Shop presentation', icon: 'heroicons:shopping-bag' }],
  blog: [{ id: 'blog-content', label: 'Blog presentation', icon: 'heroicons:newspaper' }],
  services: [{ id: 'services-content', label: 'Services presentation', icon: 'heroicons:briefcase' }],
  popup: [{ id: 'welcome-popup', label: 'Welcome popup', icon: 'heroicons:gift' }],
}

export function websiteEditorPage(id: WebsiteEditorPageId) {
  return WEBSITE_EDITOR_PAGES.find(page => page.id === id) ?? WEBSITE_EDITOR_PAGES[0]!
}
