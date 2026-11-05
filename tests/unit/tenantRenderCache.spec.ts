import { describe, expect, it } from 'vitest'

import { buildTenantRenderCacheKey } from '../../app/utils/tenantRenderCache'

const baseIdentity = {
  host: 'Store.Example.test:443',
  locale: 'EN',
  path: '/shop/',
  query: { page: 2, sort: 'newest' },
  publishedReleaseId: 'release-1',
  themeId: 'classic',
  themeVersion: '1.0.0',
}

describe('buildTenantRenderCacheKey', () => {
  it('normalizes host, locale, path, and query ordering deterministically', () => {
    const first = buildTenantRenderCacheKey(baseIdentity)
    const second = buildTenantRenderCacheKey({
      ...baseIdentity,
      host: 'store.example.test.',
      locale: 'en',
      path: '/shop',
      query: { sort: 'newest', page: 2 },
    })

    expect(first).toBe(second)
  })

  it.each([
    ['host', { host: 'another.example.test' }],
    ['locale', { locale: 'fr' }],
    ['path', { path: '/products/example' }],
    ['query', { query: { page: 3, sort: 'newest' } }],
    ['release', { publishedReleaseId: 'release-2' }],
    ['theme ID', { themeId: 'service-studio' }],
    ['theme version', { themeVersion: '2.0.0' }],
  ])('separates cache identity when %s changes', (_label, change) => {
    expect(buildTenantRenderCacheKey({ ...baseIdentity, ...change }))
      .not.toBe(buildTenantRenderCacheKey(baseIdentity))
  })

  it.each([
    ['host', { host: '' }],
    ['locale', { locale: null }],
    ['release', { publishedReleaseId: null }],
    ['theme ID', { themeId: '' }],
    ['theme version', { themeVersion: null }],
  ])('refuses a key without %s', (_label, change) => {
    expect(buildTenantRenderCacheKey({ ...baseIdentity, ...change })).toBeNull()
  })
})
