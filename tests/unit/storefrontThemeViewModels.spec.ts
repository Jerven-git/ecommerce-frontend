import { describe, expect, it } from 'vitest'
import {
  createStorefrontPageViewModel,
  createStorefrontShellViewModel,
  storefrontPageKind,
  storefrontThemeReference,
} from '~/themes/viewModels'

describe('storefront theme view models', () => {
  it.each([
    ['/', 'home'],
    ['/shop/', 'shop'],
    ['/product/example', 'product'],
    ['/blog', 'blog-index'],
    ['/blog/example', 'blog-detail'],
    ['/services', 'services-index'],
    ['/services/example', 'service-detail'],
    ['/backorder/pay/token', 'backorder-payment'],
    ['/company/profile', 'custom-page'],
  ] as const)('maps %s to the %s presentation kind', (path, kind) => {
    expect(storefrontPageKind(path)).toBe(kind)
  })

  it('normalizes page and shell inputs without adding business behavior', () => {
    expect(createStorefrontPageViewModel({ path: '/contact?source=nav', preview: true })).toEqual({
      kind: 'contact',
      path: '/contact?source=nav',
      locale: 'en',
      preview: true,
    })
    expect(createStorefrontShellViewModel({ siteConfig: null })).toEqual({
      siteConfig: null,
      configError: false,
      configPending: false,
      preview: false,
      showWelcomePopup: true,
    })
  })

  it('normalizes stores without a theme reference to Classic', () => {
    expect(storefrontThemeReference(null)).toEqual({ id: 'classic', version: '1.0.0' })
  })
})

