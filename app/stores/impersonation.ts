import { defineStore } from 'pinia'

interface ImpersonatedUser {
  id: number
  name: string
  email: string
  roles?: string[]
  is_super_admin?: boolean
  store?: { id: number; name: string; slug: string } | null
}

interface ImpersonationResponse {
  message: string
  data: {
    user: ImpersonatedUser
    impersonator?: ImpersonatedUser
  }
}

export const useImpersonationStore = defineStore('impersonation', {
  state: () => ({
    isImpersonating: false,
    impersonator: null as ImpersonatedUser | null,
    target: null as ImpersonatedUser | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async start(userId: number) {
      this.loading = true
      this.error = null

      try {
        const { $apiFetch } = useNuxtApp()
        const response = await $apiFetch<ImpersonationResponse>(`/super-admin/users/${userId}/impersonate`, {
          method: 'POST',
        })

        this.isImpersonating = true
        this.target = response.data.user
        this.impersonator = response.data.impersonator ?? null

        const authStore = useAuthStore()
        await authStore.checkAuth()

        // The session user just changed — refresh the cached site config so
        // the theme matches the new effective user's store.
        const { fetchSiteConfig } = useSiteConfig()
        await fetchSiteConfig(true)

        return response
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to start impersonation'
        throw err
      } finally {
        this.loading = false
      }
    },

    async leave() {
      this.loading = true
      this.error = null

      try {
        const { $apiFetch } = useNuxtApp()
        const response = await $apiFetch<ImpersonationResponse>('/super-admin/impersonate/leave', {
          method: 'POST',
        })

        this.isImpersonating = false
        this.target = null
        this.impersonator = null

        const authStore = useAuthStore()
        await authStore.checkAuth()

        // The session user just changed — refresh the cached site config so
        // the theme matches the new effective user's store.
        const { fetchSiteConfig } = useSiteConfig()
        await fetchSiteConfig(true)

        return response
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to leave impersonation'
        throw err
      } finally {
        this.loading = false
      }
    },

    reset() {
      this.isImpersonating = false
      this.target = null
      this.impersonator = null
      this.error = null
    },
  },
})
