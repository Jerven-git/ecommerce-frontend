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

type ImpersonationPhase = 'authorizing' | 'preparing'
type ImpersonationTransition = 'entering' | 'leaving'
type PendingTarget = Pick<ImpersonatedUser, 'name' | 'email'> & Pick<ImpersonatedUser, 'store'>

export const useImpersonationStore = defineStore('impersonation', {
  state: () => ({
    isImpersonating: false,
    impersonator: null as ImpersonatedUser | null,
    target: null as ImpersonatedUser | null,
    loading: false,
    error: null as string | null,
    transitioning: false,
    transitionKind: null as ImpersonationTransition | null,
    transitionPhase: null as ImpersonationPhase | null,
    transitionTargetId: null as number | null,
    pendingTarget: null as PendingTarget | null,
  }),

  actions: {
    async start(userId: number, preview?: PendingTarget) {
      this.loading = true
      this.error = null
      this.transitioning = true
      this.transitionKind = 'entering'
      this.transitionPhase = 'authorizing'
      this.transitionTargetId = userId
      this.pendingTarget = preview ?? null

      try {
        const { $apiFetch } = useNuxtApp()
        const response = await $apiFetch<ImpersonationResponse>(`/super-admin/users/${userId}/impersonate`, {
          method: 'POST',
        })

        this.isImpersonating = true
        this.target = response.data.user
        this.impersonator = response.data.impersonator ?? null
        this.pendingTarget = response.data.user
        this.transitionPhase = 'preparing'

        const authStore = useAuthStore()
        authStore.adoptAuthenticatedUser({
          ...response.data.user,
          is_admin: true,
          is_super_admin: false,
          is_impersonating: true,
          impersonator: response.data.impersonator ?? null,
        })
        await authStore.checkAuth()

        // The session user just changed — refresh the cached site config so
        // the theme matches the new effective user's store. This refresh is
        // presentational: a failure must not misreport a successful identity
        // switch as a failed impersonation.
        const { fetchSiteConfig } = useSiteConfig()
        await fetchSiteConfig(true).catch(() => undefined)

        return response
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to start impersonation'
        this.finishTransition()
        throw err
      } finally {
        this.loading = false
      }
    },

    finishTransition() {
      this.transitioning = false
      this.transitionKind = null
      this.transitionPhase = null
      this.transitionTargetId = null
      this.pendingTarget = null
    },

    async leave() {
      this.loading = true
      this.error = null
      this.transitioning = true
      this.transitionKind = 'leaving'
      this.transitionPhase = 'authorizing'

      const authStore = useAuthStore()
      const returningOperator = this.impersonator ?? authStore.user?.impersonator
      this.pendingTarget = returningOperator
        ? { name: returningOperator.name, email: returningOperator.email }
        : { name: 'Super Admin', email: '' }

      try {
        const { $apiFetch } = useNuxtApp()
        const response = await $apiFetch<ImpersonationResponse>('/super-admin/impersonate/leave', {
          method: 'POST',
        })

        this.isImpersonating = false
        this.target = null
        this.impersonator = null
        this.transitionPhase = 'preparing'

        authStore.adoptAuthenticatedUser({
          ...response.data.user,
          is_admin: true,
          is_super_admin: response.data.user.is_super_admin === true,
          is_impersonating: false,
          impersonator: null,
        })
        await authStore.checkAuth()

        // The session user just changed — refresh the cached site config so
        // the theme matches the restored operator. Keep it non-blocking for
        // the same reason as the enter flow above.
        const { fetchSiteConfig } = useSiteConfig()
        await fetchSiteConfig(true).catch(() => undefined)

        return response
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to leave impersonation'
        this.finishTransition()
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
      this.finishTransition()
    },
  },
})
