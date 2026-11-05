import type { SiteConfig, ThemeLayoutReference } from '~/composables/useSiteConfig'
import { DEFAULT_THEME_REFERENCE } from '~/themes/registry'
import type {
  PublicPageKind,
  StorefrontPageViewModel,
  StorefrontShellViewModel,
} from '~/themes/contracts'

export function storefrontThemeReference(siteConfig: SiteConfig | null | undefined): ThemeLayoutReference {
  return siteConfig?.theme_layout ?? DEFAULT_THEME_REFERENCE
}

export function storefrontPageKind(path: string): PublicPageKind {
  const normalizedPath = path.split('?')[0]?.replace(/\/+$/, '') || '/'

  if (normalizedPath === '/') return 'home'
  if (normalizedPath === '/shop') return 'shop'
  if (normalizedPath === '/collection') return 'collection'
  if (normalizedPath.startsWith('/product/')) return 'product'
  if (normalizedPath === '/cart') return 'cart'
  if (normalizedPath === '/checkout') return 'checkout'
  if (normalizedPath === '/favorites') return 'favorites'
  if (normalizedPath === '/tracking') return 'tracking'
  if (normalizedPath === '/payment/complete') return 'payment-complete'
  if (normalizedPath.startsWith('/backorder/pay/')) return 'backorder-payment'
  if (normalizedPath === '/order-success') return 'order-success'
  if (normalizedPath === '/about') return 'about'
  if (normalizedPath === '/story') return 'story'
  if (normalizedPath === '/contact') return 'contact'
  if (normalizedPath === '/blog') return 'blog-index'
  if (normalizedPath.startsWith('/blog/')) return 'blog-detail'
  if (normalizedPath === '/services') return 'services-index'
  if (normalizedPath.startsWith('/services/')) return 'service-detail'
  if (normalizedPath === '/commissions') return 'commissions'
  if (normalizedPath === '/gift-cards') return 'gift-cards'
  if (normalizedPath === '/register') return 'register'
  if (normalizedPath === '/subscribe') return 'subscribe'

  return 'custom-page'
}

export function createStorefrontShellViewModel(input: {
  siteConfig: SiteConfig | null
  configError?: boolean
  configPending?: boolean
  preview?: boolean
  showWelcomePopup?: boolean
}): StorefrontShellViewModel {
  return {
    siteConfig: input.siteConfig,
    configError: input.configError ?? false,
    configPending: input.configPending ?? false,
    preview: input.preview ?? false,
    showWelcomePopup: input.showWelcomePopup ?? true,
  }
}

export function createStorefrontPageViewModel(input: {
  path: string
  locale?: string | null
  preview?: boolean
  kind?: PublicPageKind
}): StorefrontPageViewModel {
  return {
    kind: input.kind ?? storefrontPageKind(input.path),
    path: input.path,
    locale: input.locale || 'en',
    preview: input.preview ?? false,
  }
}

