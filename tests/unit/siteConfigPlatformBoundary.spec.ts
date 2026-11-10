import { computed, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSiteConfig } from '~/composables/useSiteConfig'

describe('platform SiteConfig boundary', () => {
  const apiFetch = vi.fn()

  beforeEach(() => {
    const states = new Map()
    apiFetch.mockReset().mockResolvedValue({ data: { id: 42 } })
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('useRequestURL', () => new URL('https://platform.example.test'))
    vi.stubGlobal('useNuxtApp', () => ({ $apiFetch: apiFetch }))
    vi.stubGlobal('BroadcastChannel', undefined)
    vi.stubGlobal('useState', (key: string, init: () => unknown) => {
      if (!states.has(key)) states.set(key, ref(init()))
      return states.get(key)
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it.each(['/super-admin', '/super-admin/', '/super-admin/stores/42'])(
    'does not fetch tenant presentation for %s, including forced refreshes', async (path) => {
      const config = useSiteConfig({ path, query: {} })
      await config.fetchSiteConfig()
      await config.fetchSiteConfig(true)

      expect(apiFetch).not.toHaveBeenCalled()
      expect(config.pending.value).toBe(false)
      expect(config.error.value).toBeNull()
    },
  )

  it('allows an explicit store fetch during impersonation from the platform workspace', async () => {
    const config = useSiteConfig({ path: '/super-admin/stores/42', query: {} })
    await config.fetchSiteConfig(true, 'admin')

    expect(apiFetch).toHaveBeenCalledWith('/admin/site-config', { params: { locale: 'default' } })
  })

  it.each([
    ['/admin/website-editor', '/admin/site-config'],
    ['/', '/site-config'],
    ['/shop', '/site-config'],
  ])('retains configuration loading for %s', async (path, endpoint) => {
    const config = useSiteConfig({ path, query: {} })
    await config.fetchSiteConfig()

    expect(apiFetch).toHaveBeenCalledWith(endpoint, expect.any(Object))
  })
})
