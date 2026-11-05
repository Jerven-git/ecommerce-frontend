import { describe, expect, it } from 'vitest'
import type { WebsiteNavigationItem } from '~/composables/useSiteConfig'
import {
  isThemeRouteActive,
  themeNavigationLinks,
  themeRouteLabel,
} from '~/themes/presentation'

function navigationItem(overrides: Partial<WebsiteNavigationItem> = {}): WebsiteNavigationItem {
  return {
    id: 'item',
    label: 'Catalogue',
    kind: 'link',
    value: '/shop',
    visible: true,
    children: [],
    ...overrides,
  }
}

describe('theme presentation hardening', () => {
  it('builds a bounded index from visible internal links without changing localized labels', () => {
    const longArabicLabel = 'منتجات مصنوعة بعناية للعملاء في جميع أنحاء العالم'
    const navigation = [
      navigationItem({ id: 'home', label: '  Home  ', value: '/' }),
      navigationItem({ id: 'rtl', label: longArabicLabel, value: '/catalogue' }),
      navigationItem({ id: 'hidden', label: 'Hidden', visible: false }),
      navigationItem({ id: 'external', label: 'External', value: 'https://example.com' }),
      navigationItem({ id: 'group', label: 'Group', kind: 'group', value: null }),
      ...Array.from({ length: 10 }, (_, index) => navigationItem({ id: `extra-${index}`, label: `Extra ${index}`, value: `/extra-${index}` })),
    ]

    expect(themeNavigationLinks(navigation)).toEqual([
      { id: 'home', label: 'Home', to: '/' },
      { id: 'rtl', label: longArabicLabel, to: '/catalogue' },
      ...Array.from({ length: 6 }, (_, index) => ({ id: `extra-${index}`, label: `Extra ${index}`, to: `/extra-${index}` })),
    ])
  })

  it('handles empty, invalid, and explicitly bounded navigation safely', () => {
    expect(themeNavigationLinks(undefined)).toEqual([])
    expect(themeNavigationLinks([navigationItem({ label: '   ' })])).toEqual([])
    expect(themeNavigationLinks([navigationItem()], 0)).toEqual([])
  })

  it('derives readable route labels without damaging CJK, RTL, or encoded text', () => {
    expect(themeRouteLabel('/', 'Overview')).toBe('Overview')
    expect(themeRouteLabel('/order-success?source=email', 'Overview')).toBe('Order Success')
    expect(themeRouteLabel('/%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1', 'Overview')).toBe('المتجر')
    expect(themeRouteLabel('/商品一覧', 'Overview')).toBe('商品一覧')
    expect(themeRouteLabel('/%E0%A4%A', 'Overview')).toBe('%E0%A4%A')
  })

  it('matches nested routes after normalizing query strings, fragments, and slashes', () => {
    expect(isThemeRouteActive('/shop/?sort=latest', '/shop')).toBe(true)
    expect(isThemeRouteActive('/collection/summer#products', '/collection/')).toBe(true)
    expect(isThemeRouteActive('/shopping', '/shop')).toBe(false)
    expect(isThemeRouteActive('/shop', '/')).toBe(false)
  })
})
