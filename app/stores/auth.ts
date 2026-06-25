import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
  roles?: string[]
  role?: string
  is_admin?: boolean
  is_super_admin?: boolean
  is_impersonating?: boolean
  impersonator?: { id: number; name: string; email: string; is_super_admin?: boolean } | null
  store_id?: number | null
  store?: { id: number; name: string; slug: string; domain: string | null } | null
  status?: 'active' | 'disabled'
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * localStorage key used to remember the last logged-in admin's store slug.
 * Used by useSiteConfig to ask the public /site-config endpoint for the
 * right store's theme even when the visitor is logged out — handy in dev
 * where there is no per-store domain.
 */
const LAST_STORE_SLUG_KEY = 'ssu:last_store_slug'

function rememberStoreSlug(slug: string | null | undefined): void {
  if (!import.meta.client) return
  try {
    if (slug) {
      window.localStorage.setItem(LAST_STORE_SLUG_KEY, slug)
    }
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — silently ignore.
  }
}

export function getRememberedStoreSlug(): string | null {
  if (!import.meta.client) return null
  try {
    return window.localStorage.getItem(LAST_STORE_SLUG_KEY)
  } catch {
    return null
  }
}

interface LoginResponse {
  message: string
  user?: User
  two_factor_required?: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
    twoFactorRequired: false,
    twoFactorEmail: null as string | null,
  }),

  getters: {
    isAdmin: (state) => {
      return state.user?.is_admin === true
    },
    isSuperAdmin: (state) => {
      return state.user?.is_super_admin === true
    },
    isImpersonating: (state) => {
      return state.user?.is_impersonating === true
    },
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      this.twoFactorRequired = false

      try {
        const { $apiFetch } = useNuxtApp()
        const config = useRuntimeConfig()

        // First, get CSRF cookie directly from Laravel (not through /api)
        await $fetch(`${config.public.apiBase}/sanctum/csrf-cookie`, {
          method: 'GET',
          credentials: 'include'
        })

        // Then login using apiFetch (which uses /api)
        const response = await $apiFetch<LoginResponse>('/login', {
          method: 'POST',
          body: { email, password }
        })

        if (response.two_factor_required) {
          this.twoFactorRequired = true
          this.twoFactorEmail = email
          return response
        }

        // Fallback for any non-2FA response
        if (response.user) {
          this.user = response.user
          this.isAuthenticated = true
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async verifyTwoFactor(code: string) {
      this.loading = true
      this.error = null

      try {
        const { $apiFetch } = useNuxtApp()

        const response = await $apiFetch<LoginResponse>('/two-factor/verify', {
          method: 'POST',
          body: { code }
        })

        if (response.user) {
          this.user = response.user
          this.isAuthenticated = true
          this.twoFactorRequired = false
          this.twoFactorEmail = null

          rememberStoreSlug(response.user.store?.slug)

          // The site config cache is keyed in Nuxt useState, so it survives
          // logout/login of different admins. Force-refresh so the new admin's
          // theme replaces whoever was logged in before.
          const { fetchSiteConfig } = useSiteConfig()
          await fetchSiteConfig(true)
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'Verification failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async resendTwoFactor() {
      this.loading = true
      this.error = null

      try {
        const { $apiFetch } = useNuxtApp()

        const response = await $apiFetch<{ message: string }>('/two-factor/resend', {
          method: 'POST'
        })

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'Failed to resend code'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(data: RegisterData) {
      this.loading = true
      this.error = null

      try {
        const { $apiFetch } = useNuxtApp()
        const config = useRuntimeConfig()

        // Get CSRF cookie first from Laravel base URL
        await $fetch(`${config.public.apiBase}/sanctum/csrf-cookie`, {
          method: 'GET',
          credentials: 'include'
        })

        // Register user
        const response = await $apiFetch<LoginResponse>('/register', {
          method: 'POST',
          body: data
        })

        this.user = response.user ?? null
        this.isAuthenticated = !!response.user

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      this.error = null

      try {
        const { $apiFetch } = useNuxtApp()

        await $apiFetch('/logout', {
          method: 'POST'
        })

        this.user = null
        this.isAuthenticated = false
        this.twoFactorRequired = false
        this.twoFactorEmail = null

        // Drop the previous admin's cached theme so the login page (and any
        // next admin who logs in) doesn't render with the wrong store's data.
        const { fetchSiteConfig } = useSiteConfig()
        await fetchSiteConfig(true)
      } catch (error: any) {
        this.error = error?.data?.message || 'Logout failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async checkAuth() {
      this.loading = true
      this.error = null

      try {
        const { $apiFetch } = useNuxtApp()

        const response = await $apiFetch<{ user: User }>('/user', {
          method: 'GET'
        })

        if (response.user) {
          this.user = response.user
          this.isAuthenticated = true
          rememberStoreSlug(response.user.store?.slug)
        } else {
          this.user = null
          this.isAuthenticated = false
        }
      } catch (error) {
        // Not authenticated
        this.user = null
        this.isAuthenticated = false
        this.twoFactorRequired = false
        this.twoFactorEmail = null
      } finally {
        this.loading = false
      }
    }
  }
})
