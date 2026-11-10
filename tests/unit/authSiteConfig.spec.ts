import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore, type User } from '~/stores/auth'

describe('authenticated SiteConfig handoff', () => {
  const apiFetch = vi.fn()
  const fetchSiteConfig = vi.fn()
  const invalidateSiteConfig = vi.fn()

  beforeEach(() => {
    setActivePinia(createPinia())
    apiFetch.mockReset()
    fetchSiteConfig.mockReset().mockResolvedValue(undefined)
    invalidateSiteConfig.mockReset()
    vi.stubGlobal('useNuxtApp', () => ({ $apiFetch: apiFetch }))
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: '' } }))
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue(undefined))
    vi.stubGlobal('useSiteConfig', () => ({ fetchSiteConfig, invalidateSiteConfig }))
  })

  afterEach(() => vi.unstubAllGlobals())

  const operator: User = {
    id: 1,
    name: 'Operator',
    email: 'operator@example.test',
    is_admin: true,
    is_super_admin: true,
    store_id: null,
    store: null,
  }

  async function authenticate(flow: 'login' | 'two-factor', user: User) {
    apiFetch.mockResolvedValue({ user })
    const auth = useAuthStore()
    if (flow === 'login') await auth.login(user.email, 'test-password')
    else await auth.verifyTwoFactor('123456')
    return auth
  }

  describe.each(['login', 'two-factor'] as const)('%s', (flow) => {
    it('clears the previous store cache without requesting configuration for Super Admin', async () => {
      const auth = await authenticate(flow, operator)

      expect(auth.isAuthenticated).toBe(true)
      expect(auth.isSuperAdmin).toBe(true)
      expect(invalidateSiteConfig).toHaveBeenCalledWith('admin')
      expect(fetchSiteConfig).not.toHaveBeenCalled()
      expect(auth.error).toBeNull()
    })

    it('refreshes the authenticated store configuration for Store Admin', async () => {
      await authenticate(flow, { ...operator, is_super_admin: false, store_id: 42 })

      expect(invalidateSiteConfig).toHaveBeenCalledWith('admin')
      expect(fetchSiteConfig).toHaveBeenCalledExactlyOnceWith(true, 'admin')
    })

    it('retains configuration loading for an impersonated store session', async () => {
      await authenticate(flow, {
        ...operator,
        is_super_admin: false,
        is_impersonating: true,
        store_id: 42,
      })

      expect(fetchSiteConfig).toHaveBeenCalledExactlyOnceWith(true, 'admin')
    })
  })

  it('does not load store configuration while two-factor authentication is pending', async () => {
    apiFetch.mockResolvedValue({ two_factor_required: true })
    const auth = useAuthStore()
    await auth.login(operator.email, 'test-password')

    expect(auth.twoFactorRequired).toBe(true)
    expect(auth.isAuthenticated).toBe(false)
    expect(invalidateSiteConfig).not.toHaveBeenCalled()
    expect(fetchSiteConfig).not.toHaveBeenCalled()
  })
})
