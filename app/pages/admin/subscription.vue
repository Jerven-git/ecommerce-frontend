<template>
  <div>
    <AdminPageHeader title="Subscription" subtitle="Manage your plan and billing">
      <template #breadcrumb>
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">Subscription</span>
        </div>
      </template>
    </AdminPageHeader>

    <!-- Loading -->
    <div v-if="checkingAuth" class="flex flex-col items-center justify-center py-16">
      <AdminSpinner label="Loading subscription…" variant="form" />
    </div>

    <template v-else>
      <!-- Stripe return: processing -->
      <div v-if="statusParam === 'success' && polling" class="mb-6">
        <div class="bg-white rounded-2xl border border-primary-100 shadow-sm p-6 flex items-center gap-4">
          <svg class="animate-spin h-6 w-6 text-primary-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <div>
            <p class="font-semibold text-gray-900">Payment received — activating your store…</p>
            <p class="text-sm text-gray-500">This usually takes a moment. We’ll refresh automatically.</p>
          </div>
        </div>
      </div>

      <div v-else-if="statusParam === 'success' && stillProcessing" class="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <p class="font-semibold text-amber-900">Still working on it</p>
        <p class="text-sm text-amber-700 mt-1">Your payment went through but activation hasn’t landed yet. Give it a few more seconds.</p>
        <AdminButton variant="primary" size="sm" class="mt-4" :loading="checkingAgain" @click="checkAgain">
          {{ checkingAgain ? 'Checking…' : 'Check again' }}
        </AdminButton>
      </div>

      <div v-if="statusParam === 'cancelled'" class="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Checkout was cancelled — no charges were made. Pick a plan below when you’re ready.
      </div>
      <div v-if="statusParam === 'portal'" class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        Returned from billing portal — your subscription status has been refreshed.
      </div>

      <!-- Current Plan -->
      <section class="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6 mb-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Current plan</h2>
            <p class="mt-1 text-sm text-gray-500">
              <span v-if="unlocked">Your store is active and ready to sell.</span>
              <span v-else-if="state?.subscription_status === 'cancelled'">Set to cancel at period end — you keep access until {{ formatDate(state?.subscription_expires_at) }}.</span>
              <span v-else>Your store is on hold until you pick a plan and complete checkout.</span>
            </p>
          </div>
          <span
            class="px-2.5 py-1 text-xs font-semibold rounded-full border"
            :class="statusBadgeClass"
          >
            {{ statusLabel }}
          </span>
        </div>

        <div v-if="state?.plan" class="mt-6 grid gap-4 sm:grid-cols-3">
          <div class="sm:col-span-1">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</p>
            <p class="mt-1 font-semibold text-gray-900">{{ state.plan.name }}</p>
            <p class="text-sm text-gray-500">{{ intervalLang(state.plan.interval) }} · {{ formatPrice(state.plan.price_cents) }}<span v-if="state.plan.setup_fee_cents > 0" class="text-gray-400"> + {{ formatPrice(state.plan.setup_fee_cents) }} setup</span></p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">
              <span v-if="state?.subscription_status === 'cancelled'">Access until</span>
              <span v-else-if="unlocked">Renews on</span>
              <span v-else>Expires</span>
            </p>
            <p class="mt-1 font-medium text-gray-900">{{ formatDate(state?.subscription_expires_at) }}</p>
            <p v-if="state?.subscribed_at" class="text-xs text-gray-400 mt-0.5">Started {{ formatDate(state.subscribed_at) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Features</p>
            <ul v-if="currentPlanFeatures.length" class="mt-1 space-y-1">
              <li v-for="f in currentPlanFeatures" :key="f" class="flex items-center gap-1.5 text-sm text-gray-600">
                <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                {{ f }}
              </li>
            </ul>
            <p v-else class="mt-1 text-sm text-gray-500">Everything included</p>
          </div>
        </div>
        <div v-else-if="state?.subscription_status === 'comped'" class="mt-6 rounded-xl bg-green-50 border border-green-200 p-4">
          <p class="text-sm font-semibold text-green-800">Comped — free platform access</p>
          <p class="mt-1 text-sm text-green-700">This store was grandfathered and has full admin access without a billing plan. Pick a plan below only if you want to switch to paid billing.</p>
        </div>
        <div v-else class="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4">
          <p class="text-sm text-gray-600">No active plan. Choose a plan below to unlock your store.</p>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
          <AdminButton
            v-if="unlocked"
            variant="outline"
            size="sm"
            :loading="portalLoading"
            @click="handlePortal"
          >
            Manage billing
          </AdminButton>
          <span v-else class="text-sm text-gray-500">Billing portal is available after you subscribe.</span>
          <p v-if="plansError" class="text-sm text-red-600">{{ plansError }}</p>
        </div>
      </section>

      <!-- Available Plans -->
      <section class="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Available plans</h2>
            <p class="mt-1 text-sm text-gray-500">Pick the interval that fits you. Switch anytime — checkout handles the rest.</p>
          </div>
        </div>

        <div v-if="plansLoading" class="flex justify-center py-10">
          <AdminSpinner label="Loading plans…" variant="form" />
        </div>

        <div v-else-if="planList.length" class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div
            v-for="plan in planList"
            :key="plan.id"
            class="relative rounded-2xl border p-6 flex flex-col transition-colors"
            :class="isCurrentPlan(plan) ? 'border-primary-200 bg-primary-50/40' : 'border-gray-200 bg-white hover:border-gray-300'"
          >
            <div class="flex items-center gap-2 mb-3">
              <span
                v-if="isCurrentPlan(plan)"
                class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-600 text-white"
              >Current</span>
              <span
                v-else-if="isCheapest(plan)"
                class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200"
              >Best value</span>
            </div>

            <h3 class="text-base font-semibold text-gray-900">{{ plan.name }}</h3>
            <div class="mt-2 flex items-baseline gap-1">
              <span class="text-2xl font-bold text-gray-900">{{ formatPrice(plan.price_cents) }}</span>
              <span class="text-sm text-gray-500">/ {{ intervalLang(plan.interval) }}</span>
            </div>
            <div v-if="plan.setup_fee_cents > 0" class="mt-1 text-xs text-gray-500">+ {{ formatPrice(plan.setup_fee_cents) }} one-time setup</div>

            <ul class="mt-4 space-y-2 flex-1">
              <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2 text-sm text-gray-600">
                <svg class="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <AdminButton
              class="mt-5 w-full"
              :variant="isCurrentPlan(plan) ? 'outline' : 'primary'"
              :disabled="isCurrentPlan(plan) || checkoutLoading !== null"
              :loading="checkoutLoading === plan.slug"
              @click="handleCheckout(plan)"
            >
              <span v-if="isCurrentPlan(plan)">Current plan</span>
              <span v-else-if="unlocked && state?.plan && monthlyEquivalent(plan) < currentMonthlyEquiv">Downgrade</span>
              <span v-else-if="unlocked && state?.plan">Upgrade</span>
              <span v-else>Subscribe now</span>
            </AdminButton>
          </div>
        </div>

        <p v-else class="mt-6 text-sm text-gray-500">No plans available right now — check back soon.</p>
        <p class="mt-6 text-xs text-gray-400">Secure checkout by Stripe. Cancel anytime from the billing portal — you keep access until the end of your paid period.</p>
      </section>

      <!-- Billing / history -->
      <section class="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900">Billing</h2>
        <p class="mt-1 text-sm text-gray-500">Invoices, payment method and cancellation are managed in the Stripe billing portal.</p>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <AdminButton variant="primary" size="sm" :loading="portalLoading" :disabled="!unlocked && !state?.provider_customer_id" @click="handlePortal">
            Open billing portal
          </AdminButton>
          <span class="text-xs text-gray-400">Billing history is available inside the portal.</span>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const route = useRoute()
const subscription = useSubscription()

const state = computed(() => subscription.state.value)
const unlocked = computed(() => subscription.unlocked.value)
const planList = computed(() => subscription.plans.value ?? [])

const statusParam = computed(() => {
  const v = route.query.status
  return typeof v === 'string' ? v : null
})

const checkingAuth = ref(true)
const plansLoading = ref(false)
const checkoutLoading = ref<string | null>(null)
const portalLoading = ref(false)
const polling = ref(false)
const checkingAgain = ref(false)
const stillProcessing = ref(false)
const plansError = ref('')

const statusLabel = computed(() => {
  switch (state.value?.subscription_status) {
    case 'active': return 'Active'
    case 'comped': return 'Comped'
    case 'cancelled': return 'Cancelled'
    case 'expired': return 'Expired'
    case 'pending': return 'Pending'
    default: return 'Unsubscribed'
  }
})

const statusBadgeClass = computed(() => {
  switch (state.value?.subscription_status) {
    case 'active':
    case 'comped':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'cancelled':
    case 'expired':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200'
  }
})

const currentPlanFeatures = computed(() => {
  const slug = state.value?.plan?.slug
  if (!slug) return []
  const match = planList.value.find((p) => p.slug === slug)
  return match?.features ?? []
})

const currentMonthlyEquiv = computed(() => {
  if (!state.value?.plan) return Infinity
  return state.value.plan.price_cents / intervalMonths(state.value.plan.interval)
})

const isCurrentPlan = (plan: { slug: string }) => state.value?.plan?.slug === plan.slug

const formatPrice = (cents?: number | null): string => {
  if (cents === undefined || cents === null) return '—'
  const dollars = Math.floor(cents / 100)
  const remainder = cents % 100
  const whole = dollars.toLocaleString(undefined, { maximumFractionDigits: 0 })
  return remainder === 0 ? `$${whole}` : `$${whole}.${String(remainder).padStart(2, '0')}`
}

const intervalLang = (interval: string): string => {
  switch (interval) {
    case 'weekly': return 'week'
    case 'quarterly': return '3 months'
    case 'yearly': return 'year'
    default: return 'month'
  }
}

const intervalMonths = (interval: string): number => {
  switch (interval) {
    case 'weekly': return 0.230769
    case 'quarterly': return 3
    case 'yearly': return 12
    default: return 1
  }
}

const monthlyEquivalent = (plan: { price_cents: number; interval: string }) =>
  plan.price_cents / intervalMonths(plan.interval)

const isCheapest = (plan: { price_cents: number; interval: string }) =>
  planList.value.length > 1 && monthlyEquivalent(plan) === Math.min(...planList.value.map(monthlyEquivalent))

const formatDate = (value?: string | null): string => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const loadPlans = async () => {
  plansLoading.value = true
  plansError.value = ''
  try {
    await subscription.fetchPlans(true)
  } catch (err: any) {
    plansError.value = err?.data?.message || 'Could not load plans.'
  } finally {
    plansLoading.value = false
  }
}

const handleCheckout = async (plan: { slug: string }) => {
  checkoutLoading.value = plan.slug
  try {
    await subscription.startCheckout(plan.slug)
  } catch (err: any) {
    plansError.value = err?.data?.message || 'Could not start checkout. Please try again.'
  } finally {
    checkoutLoading.value = null
  }
}

const handlePortal = async () => {
  portalLoading.value = true
  try {
    await subscription.openPortal()
  } catch (err: any) {
    plansError.value = err?.data?.message || 'Could not open the billing portal.'
  } finally {
    portalLoading.value = false
  }
}

const pollForUnlock = async () => {
  if (polling.value) return
  polling.value = true
  stillProcessing.value = false
  const success = await subscription.awaitUnlocked()
  polling.value = false
  if (!success && !unlocked.value) stillProcessing.value = true
}

const checkAgain = async () => {
  checkingAgain.value = true
  try {
    const ok = await subscription.awaitUnlocked({ attempts: 6, intervalMs: 3000 })
    if (ok || subscription.unlocked.value) return
    stillProcessing.value = true
  } finally {
    checkingAgain.value = false
  }
}

onMounted(async () => {
  await authStore.checkAuth()
  if (authStore.isAuthenticated) {
    await subscription.fetchState(true)
    // Always load catalog so Current plan features and Available plans render
    await loadPlans()
    if (statusParam.value === 'success' && !subscription.unlocked.value) {
      pollForUnlock()
    }
  }
  checkingAuth.value = false
})
</script>
