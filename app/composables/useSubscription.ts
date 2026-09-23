export interface SubscriptionPlan {
  id: number
  name: string
  slug: string
  interval: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  price_cents: number
  setup_fee_cents: number
  features: string[]
}

export type SubscriptionStatus =
  | 'unsubscribed'
  | 'pending'
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'comped'

export interface SubscriptionState {
  subscription_status: SubscriptionStatus
  subscribed_at: string | null
  subscription_expires_at: string | null
  active: boolean
  grace_period_days: number
  provider_customer_id: string | null
  plan: {
    name: string
    slug: string
    price_cents: number
    setup_fee_cents: number
    interval: string
  } | null
}

/** Statuses under which the store is considered paid-up and usable. */
export const UNLOCKED_STATUSES: SubscriptionStatus[] = ['active', 'comped']

export function useSubscription() {
  const state = useState<SubscriptionState | null>('subscriptionState', () => null)
  const plans = useState<SubscriptionPlan[] | null>('subscriptionPlans', () => null)
  const loading = useState('subscriptionLoading', () => false)
  const error = useState<string | null>('subscriptionError', () => null)

  const unlocked = computed(() => state.value?.active === true)

  async function fetchState(force = false): Promise<SubscriptionState | null> {
    if (!force && state.value) return state.value

    loading.value = true
    error.value = null
    try {
      const { $apiFetch } = useNuxtApp()
      const res = await $apiFetch<{ data: SubscriptionState }>('/subscription')
      state.value = res.data

      // Keep the auth store's user record in sync so other pages (admin nav,
      // gate UI) see the freshly-changed status without a full re-check.
      const authStore = useAuthStore()
      if (authStore.user?.store) {
        authStore.user.store.subscription_status = res.data.subscription_status
        authStore.user.store.subscription_expires_at = res.data.subscription_expires_at
      }

      return res.data
    } catch (err: any) {
      error.value = err?.data?.message || 'Could not load subscription status.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchPlans(force = false): Promise<SubscriptionPlan[]> {
    if (!force && plans.value) return plans.value

    const { $apiFetch } = useNuxtApp()
    const res = await $apiFetch<{ data: SubscriptionPlan[] }>('/subscription/plans')
    plans.value = res.data
    return res.data
  }

  /**
   * Create a Stripe Checkout session for the given plan and redirect to it.
   * Throws so callers can surface the message.
   */
  async function startCheckout(planSlug: string): Promise<void> {
    const { $apiFetch } = useNuxtApp()
    const res = await $apiFetch<{ url: string }>('/subscription/checkout', {
      method: 'POST',
      body: { plan: planSlug },
    })
    if (res.url) {
      window.location.href = res.url
    }
  }

  /** Open the Stripe Billing Portal (manage/cancel/update card). */
  async function openPortal(): Promise<void> {
    const { $apiFetch } = useNuxtApp()
    const res = await $apiFetch<{ url: string }>('/subscription/portal', {
      method: 'POST',
    })
    if (res.url) {
      window.location.href = res.url
    }
  }

  /**
   * Poll /subscription until the store is unlocked (post-checkout), then return.
   * Resolves true when unlocked, false when the poll budget ran out.
   */
  async function awaitUnlocked(options: { attempts?: number; intervalMs?: number } = {}): Promise<boolean> {
    const attempts = options.attempts ?? 20
    const intervalMs = options.intervalMs ?? 3000

    for (let i = 0; i < attempts; i++) {
      const current = await fetchState(true)
      if (current?.active === true || current?.subscription_status === 'comped') {
        return true
      }
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs))
      }
    }

    return false
  }

  return { state, plans, loading, error, unlocked, fetchState, fetchPlans, startCheckout, openPortal, awaitUnlocked }
}