import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
  roles?: string[]
  role?: string
  is_admin?: boolean
  is_super_admin?: boolean
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
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
    }
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
