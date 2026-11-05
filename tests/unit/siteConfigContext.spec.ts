import { describe, expect, it } from 'vitest'
import {
  siteConfigContextForPath,
  siteConfigEndpoint,
  siteConfigStateKey,
} from '~/utils/siteConfigContext'

describe('site config request context', () => {
  it.each([
    ['/admin', 'admin'],
    ['/admin/settings', 'admin'],
    ['/admin/website-editor/', 'admin'],
    ['/admin/login', 'public'],
    ['/admin/forgot-password', 'public'],
    ['/admin/reset-password', 'public'],
    ['/admin/verify-2fa', 'public'],
    ['/super-admin', 'public'],
    ['/', 'public'],
    ['/shop', 'public'],
  ] as const)('maps %s to the %s context', (path, context) => {
    expect(siteConfigContextForPath(path)).toBe(context)
  })

  it('uses separate endpoints and host-keyed state namespaces', () => {
    expect(siteConfigEndpoint('public')).toBe('/site-config')
    expect(siteConfigEndpoint('admin')).toBe('/admin/site-config')
    expect(siteConfigStateKey('public', 'Store.Example.com')).toBe('siteConfig:public:store.example.com')
    expect(siteConfigStateKey('admin', 'Store.Example.com')).toBe('siteConfig:admin:store.example.com')
  })

  it('never shares cached config across tenants or request contexts', () => {
    const publicStoreA = siteConfigStateKey('public', 'store-a.example.com')
    const publicStoreB = siteConfigStateKey('public', 'store-b.example.com')
    const adminStoreA = siteConfigStateKey('admin', 'store-a.example.com')

    expect(new Set([publicStoreA, publicStoreB, adminStoreA])).toHaveLength(3)
    expect(siteConfigStateKey('public', ' STORE-A.EXAMPLE.COM ')).toBe(publicStoreA)
  })
})
