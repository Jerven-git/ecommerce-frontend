import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

function appSource(path: string): string {
  return readFileSync(fileURLToPath(new URL(`../../app/${path}`, import.meta.url)), 'utf8')
}

describe('storefront theme rendering boundary', () => {
  it('keeps Apex outside tenant theme hosts while sharing those hosts with the private preview', () => {
    const layout = appSource('layouts/default.vue')
    const marketingShell = appSource('components/apex/MarketingShell.vue')
    const preview = appSource('pages/admin/storefront-preview.vue')

    expect(layout).toContain('<ApexMarketingShell v-if="isApexMarketing">')
    expect(layout).toContain('<StorefrontThemeHost\n    v-else')
    expect(layout).toContain('<StorefrontThemeHost')
    expect(layout).toContain('<StorefrontThemePageHost')
    expect(preview).toContain('<StorefrontThemeHost')
    expect(preview).toContain('<StorefrontThemePageHost')
    expect(marketingShell).toContain('data-platform-marketing-shell')
    expect(marketingShell).toContain('<Header />')
    expect(marketingShell).toContain('<Footer />')
    expect(marketingShell).not.toMatch(/StorefrontThemeHost|FooterBanner|WelcomePopup|useSiteConfig/)
    expect(layout).not.toContain('<Header')
    expect(layout).not.toContain('<Footer')
  })

  it('pins Apex appearance instead of applying the authenticated tenant theme', () => {
    const indexPage = appSource('pages/index.vue')
    const themeComposable = appSource('composables/useTheme.ts')

    expect(indexPage).toContain('const isApexMarketing = useApexMarketing()')
    expect(themeComposable).toContain('const isApexMarketing = useApexMarketing()')
    expect(themeComposable).toContain('isApexMarketing.value ? PLATFORM_THEME')
    expect(themeComposable).toContain('watch([siteConfig, isApexMarketing]')
    expect(appSource('composables/useApexMarketing.ts')).toContain("route.path === '/'")
  })

  it('keeps public host config separate from authenticated admin config', () => {
    const siteConfig = appSource('composables/useSiteConfig.ts')

    expect(siteConfig).toContain('siteConfigEndpoint(requestContext)')
    expect(siteConfig).toContain("public: createBucket('public')")
    expect(siteConfig).toContain("admin: createBucket('admin')")
    expect(siteConfig).toContain("invalidateSiteConfig('public')")
    expect(siteConfig).toContain('targetContext: SiteConfigContext = context.value')
    expect(siteConfig).not.toMatch(/getRememberedStoreSlug|store:\s*lastSlug/)
  })

  it('invalidates tenant presentation state when the authenticated store changes', () => {
    const authStore = appSource('stores/auth.ts')
    const impersonationStore = appSource('stores/impersonation.ts')

    expect(authStore.match(/invalidateSiteConfig\('admin'\)/g)).toHaveLength(3)
    expect(authStore.match(/fetchSiteConfig\(true, 'admin'\)/g)).toHaveLength(2)
    expect(impersonationStore.match(/invalidateSiteConfig\('admin'\)/g)).toHaveLength(2)
    expect(impersonationStore).toContain("fetchSiteConfig(true, 'admin')")
  })

  it('refreshes admin state and expires public state after a website publish', () => {
    const editorSession = appSource('composables/useWebsiteEditorSession.ts')
    const publishSequence = editorSession.slice(
      editorSession.indexOf('await publishDraft('),
      editorSession.indexOf('const publishedState = await fetchDraft'),
    )

    expect(publishSequence).toMatch(/await publishDraft[\s\S]*await options\.fetchSiteConfig\(true\)[\s\S]*invalidateSiteConfig\('public'\)[\s\S]*broadcastConfigUpdate\(\)/)
  })

  it('keeps Classic presentation free of tenant, API, cart, and form controllers', () => {
    const shell = appSource('themes/classic/ClassicShell.vue')
    const pageFrame = appSource('themes/classic/ClassicPageFrame.vue')
    const classicPresentation = `${shell}\n${pageFrame}`

    expect(shell).toContain('<Header />')
    expect(shell).toContain('<FooterBanner />')
    expect(shell).toContain('<Footer />')
    expect(shell).toContain('<WelcomePopup />')
    expect(classicPresentation).not.toMatch(/useSiteConfig|useCartStore|\$fetch|useFetch|useAsyncData/)
  })

  it('keeps Service Studio presentation inside the shared storefront boundary', () => {
    const shell = appSource('themes/service-studio/ServiceStudioShell.vue')
    const pageFrame = appSource('themes/service-studio/ServiceStudioPageFrame.vue')
    const presentation = `${shell}\n${pageFrame}`

    expect(shell).toContain('<Header />')
    expect(shell).toContain('<FooterBanner />')
    expect(shell).toContain('<Footer />')
    expect(presentation).not.toMatch(/useSiteConfig|useCartStore|\$fetch|useFetch|useAsyncData/)
  })

  it('keeps Informational Editorial presentation inside the shared storefront boundary', () => {
    const shell = appSource('themes/informational-editorial/InformationalEditorialShell.vue')
    const pageFrame = appSource('themes/informational-editorial/InformationalEditorialPageFrame.vue')
    const presentation = `${shell}\n${pageFrame}`

    expect(shell).toContain('<Header />')
    expect(shell).toContain('<FooterBanner />')
    expect(shell).toContain('<Footer />')
    expect(presentation).not.toMatch(/useSiteConfig|useCartStore|\$fetch|useFetch|useAsyncData/)
  })

  it('keeps Commerce Market presentation inside the shared storefront boundary', () => {
    const shell = appSource('themes/commerce-market/CommerceMarketShell.vue')
    const pageFrame = appSource('themes/commerce-market/CommerceMarketPageFrame.vue')
    const presentation = `${shell}\n${pageFrame}`

    expect(shell).toContain('<Header />')
    expect(shell).toContain('<FooterBanner />')
    expect(shell).toContain('<Footer />')
    expect(presentation).not.toMatch(/useSiteConfig|useCartStore|\$fetch|useFetch|useAsyncData/)
  })

  it('styles commerce transaction routes without moving their controllers into the theme', () => {
    const pageFrame = appSource('themes/commerce-market/CommerceMarketPageFrame.vue')

    for (const pageKind of ['product', 'cart', 'checkout', 'gift-cards', 'tracking', 'payment-complete', 'backorder-payment']) {
      expect(pageFrame).toContain(`data-page-kind='${pageKind}'`)
    }
    expect(pageFrame).not.toMatch(/calculateTax|applyDiscount|validateGiftCard|shippingCalculation|paymentMethods/)
  })

  it('keeps every first-party layout resilient to focus, motion, long copy, and mobile form input', () => {
    for (const theme of ['service-studio', 'informational-editorial', 'commerce-market']) {
      const prefix = theme.split('-').map(part => part[0]?.toUpperCase() + part.slice(1)).join('')
      const shell = appSource(`themes/${theme}/${prefix}Shell.vue`)
      const pageFrame = appSource(`themes/${theme}/${prefix}PageFrame.vue`)
      const presentation = `${shell}\n${pageFrame}`

      expect(shell).toContain('role="alert"')
      expect(shell).toContain(':disabled="viewModel.configPending"')
      expect(presentation).toContain(':focus-visible')
      expect(presentation).toContain('@media (prefers-reduced-motion: reduce)')
      expect(pageFrame).toContain('overflow-wrap: anywhere')
      expect(pageFrame).toContain('font-size: 1rem !important')
    }
  })

  it('does not communicate indexed navigation state through colour alone', () => {
    for (const theme of ['informational-editorial', 'commerce-market']) {
      const prefix = theme.split('-').map(part => part[0]?.toUpperCase() + part.slice(1)).join('')
      const shell = appSource(`themes/${theme}/${prefix}Shell.vue`)

      expect(shell).toContain(':aria-current="isActive(item.to) ? \'page\' : undefined"')
      expect(shell).toContain('aria-label=')
    }
  })
})
