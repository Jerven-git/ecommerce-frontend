import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

interface LoginResponse {
  message: string
  user: User
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
    error: null as string | null
  }),

  getters: {
    isAdmin: (state) => {
      // Add your admin check logic here
      // For example, check if user has admin role
      return state.user?.email === 'admin@example.com' // Update with your logic
    }
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null

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

        this.user = response.user
        this.isAuthenticated = true
        
        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'Login failed'
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

        this.user = response.user
        this.isAuthenticated = true

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
      } finally {
        this.loading = false
      }
    }
  }
})