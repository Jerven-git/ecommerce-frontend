<template>
  <div class="min-h-screen flex items-center justify-center bg-primary-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Animated background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950"></div>
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/[0.06] rounded-full blur-[150px]"></div>
      <div class="absolute inset-0 opacity-[0.025]" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>

    <div class="w-full max-w-3xl relative z-10">
      <!-- Initial auth check -->
      <div v-if="checkingAuth" class="flex flex-col items-center justify-center py-24">
        <svg class="animate-spin h-8 w-8 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="mt-4 text-sm text-white/40">Loading your subscription…</p>
      </div>

      <!-- Guest state: must sign in to subscribe -->
      <div v-else-if="!isAuthenticated" class="max-w-md mx-auto">
        <div
          class="bg-white/[0.07] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/[0.12] p-8 sm:p-10 text-center"
          :class="mounted ? 'animate-card-enter' : 'opacity-0 translate-y-6'"
        >
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/20 mb-5 ring-1 ring-primary-600/30 animate-icon-glow">
            <Icon name="mdi:credit-card-lock-outline" class="w-8 h-8 text-primary-600" />
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Subscribe to activate</h2>
          <p class="mt-3 text-sm text-white/50 leading-relaxed">
            To pick a plan and pay, sign in to the account you created. Your store stays
            locked until checkout completes.
          </p>
          <div class="mt-7 space-y-3" :class="mounted ? 'animate-stagger-2' : 'opacity-0 translate-y-4'">
            <NuxtLink
              to="/admin/login?redirect=/subscribe"
              class="block w-full bg-primary-600 hover:bg-primary-500 active:scale-[0.97] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/30"
            >
              Sign in
            </NuxtLink>
            <NuxtLink to="/register" class="block w-full text-sm text-white/50 hover:text-white/75 transition-colors py-1">
              Haven't created an account yet?
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Authenticated -->
      <template v-else>
        <div class="flex justify-end mb-4" :class="mounted ? 'animate-stagger-1' : 'opacity-0 translate-y-4'">
          <NuxtLink to="/admin" class="inline-flex min-h-11 items-center gap-1.5 text-sm text-white/50 hover:text-white/75 transition-colors">
            <Icon name="mdi:arrow-left" class="w-4 h-4" />
            Back to dashboard
          </NuxtLink>
        </div>

        <!-- Unlocked success -->
        <div v-if="unlocked" class="max-w-md mx-auto">
          <div
            class="bg-white/[0.07] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/[0.12] p-8 sm:p-10 text-center"
            :class="mounted ? 'animate-card-enter' : 'opacity-0 translate-y-6'"
          >
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 ring-1 ring-green-500/40 mb-5 animate-icon-glow">
              <Icon name="mdi:check" class="w-8 h-8 text-green-400" />
            </div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Your store is active!</h2>
            <p class="mt-3 text-sm text-white/50 leading-relaxed">
              <span v-if="statusParam === 'success'">Payment confirmed — welcome aboard. </span>
              <span v-if="state?.subscription_status === 'cancelled'">Note: your subscription is set to cancel at the end of the current period. </span>
              You're all set to start selling.
            </p>

            <div class="mt-6 p-4 bg-white/[0.05] border border-white/10 rounded-xl text-left">
              <div class="flex items-center justify-between text-sm">
                <span class="text-white/50">Plan</span>
                <span class="font-medium text-white">{{ state?.plan?.name || '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm mt-2">
                <span class="text-white/50">Renews on</span>
                <span class="font-medium text-white">{{ formatDate(state?.subscription_expires_at) }}</span>
              </div>
            </div>

            <div class="mt-7 space-y-3" :class="mounted ? 'animate-stagger-2' : 'opacity-0 translate-y-4'">
              <NuxtLink
                to="/admin"
                class="block w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/30"
              >
                Go to your dashboard
              </NuxtLink>
              <button
                class="w-full text-sm text-white/50 hover:text-white/75 transition-colors py-1"
                :disabled="portalLoading"
                @click="handlePortal"
              >
                {{ portalLoading ? 'Opening billing…' : 'Manage billing' }}
              </button>
              <p v-if="plansError" class="text-xs text-red-300">{{ plansError }}</p>
            </div>
          </div>
        </div>

        <!-- Locked -->
        <template v-else>
          <!-- Processing payment -->
          <div v-if="statusParam === 'success' && polling" class="max-w-md mx-auto text-center">
            <div
              class="bg-white/[0.07] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/[0.12] p-8 sm:p-10"
              :class="mounted ? 'animate-card-enter' : 'opacity-0 translate-y-6'"
            >
              <svg class="animate-spin h-10 w-10 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <h2 class="mt-6 text-xl font-bold text-white tracking-tight">Payment received — activating your store…</h2>
              <p class="mt-3 text-sm text-white/50 leading-relaxed">
                This usually takes a moment. We'll let you know the instant your store is live.
              </p>
            </div>
          </div>

          <!-- Polling exhausted -->
          <div v-else-if="statusParam === 'success' && stillProcessing" class="max-w-md mx-auto">
            <div class="bg-white/[0.07] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/[0.12] p-8 sm:p-10 text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 ring-1 ring-amber-500/40 mb-5">
                <Icon name="mdi:clock-outline" class="w-8 h-8 text-amber-400" />
              </div>
              <h2 class="text-xl font-bold text-white tracking-tight">Still working on it</h2>
              <p class="mt-3 text-sm text-white/50 leading-relaxed">
                Your payment went through but activation hasn't landed yet. Give it a few more
                seconds — check again below.
              </p>
              <div class="mt-7 space-y-3">
                <button
                  class="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                  :disabled="checkingAgain"
                  @click="checkAgain"
                >
                  {{ checkingAgain ? 'Checking…' : 'Check again' }}
                </button>
                <p class="text-xs text-white/40">Still stuck? Email support and mention your store.</p>
              </div>
            </div>
          </div>

          <!-- Cancelled checkout -->
          <div v-else-if="statusParam === 'cancelled'" class="max-w-md mx-auto mb-8">
            <div class="bg-white/[0.05] border border-amber-500/20 rounded-xl p-4 text-center">
              <p class="text-sm text-amber-300">
                Checkout was cancelled — no charges were made. Pick a plan below when you're ready.
              </p>
            </div>
          </div>

          <!-- Plan selection -->
          <div>
            <div class="text-center mb-8" :class="mounted ? 'animate-stagger-1' : 'opacity-0 translate-y-4'">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/20 mb-5 ring-1 ring-primary-600/30 animate-icon-glow">
                <Icon name="mdi:storefront-outline" class="w-8 h-8 text-primary-600" />
              </div>
              <h2 class="text-2xl font-bold text-white tracking-tight">Pick your plan</h2>
              <p class="mt-2 text-sm text-white/50">One price, everything included — cancel anytime.</p>
            </div>

            <div v-if="plansLoading" class="flex justify-center py-12">
              <svg class="animate-spin h-8 w-8 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>

            <div v-if="plansError" class="max-w-md mx-auto mb-8">
              <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <p class="text-sm text-red-300">{{ plansError }}</p>
              </div>
            </div>

            <div
              v-if="planList.length"
              class="grid grid-cols-1 sm:grid-cols-2 gap-5"
              :class="mounted ? 'animate-stagger-2' : 'opacity-0 translate-y-4'"
            >
              <div
                v-for="(plan, index) in planList"
                :key="plan.id"
                class="relative bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/[0.12] shadow-lg p-6 flex flex-col transition-all duration-200 hover:bg-white/[0.1] hover:border-primary-600/50"
                :style="{ animationDelay: `${0.15 + index * 0.1}s` }"
              >
                <div v-if="isCheapest(plan)" class="flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1 w-max mb-4">
                  <Icon name="mdi:star" class="w-3.5 h-3.5 text-green-400" />
                  Best value
                </div>
                <div v-else class="mb-4"></div>

                <h3 class="text-lg font-semibold text-white">{{ plan.name }}</h3>

                <div class="mt-3 flex items-baseline gap-1">
                  <span class="text-3xl font-bold text-white">{{ formatPrice(plan.price_cents) }}</span>
                  <span class="text-sm text-white/40">/ {{ intervalLang(plan.interval) }}</span>
                </div>

                <div v-if="plan.setup_fee_cents > 0" class="mt-1 text-xs text-white/40">
                  + {{ formatPrice(plan.setup_fee_cents) }} one-time setup
                </div>

                <ul class="mt-5 space-y-2.5 flex-1">
                  <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2.5 text-sm text-white/70">
                    <Icon name="mdi:check-circle-outline" class="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{{ feature }}</span>
                  </li>
                </ul>

                <button
                  class="mt-6 w-full bg-primary-600 hover:bg-primary-500 active:scale-[0.97] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/30"
                  :disabled="checkoutLoading === plan.slug"
                  @click="handleCheckout(plan)"
                >
                  <svg
                    v-if="checkoutLoading === plan.slug"
                    class="animate-spin h-5 w-5 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span v-else>Subscribe now</span>
                </button>
              </div>
            </div>

            <p v-else class="text-center text-sm text-white/50 py-12">No plans available right now — check back soon.</p>

            <p class="mt-8 text-center text-xs text-white/35">
              Secure checkout by Stripe. Cancel your subscription any time from the billing portal — you keep access until the end of your paid period. Your store unlocks immediately after payment.
            </p>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const authStore = useAuthStore()
const route = useRoute()
const subscription = useSubscription()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const state = computed(() => subscription.state.value)
const unlocked = computed(() => subscription.unlocked.value)
const planList = computed(() => subscription.plans.value ?? [])

const statusParam = computed(() => {
  const value = route.query.status
  return typeof value === 'string' ? value : null
})

const checkingAuth = ref(true)
const mounted = ref(false)
const plansLoading = ref(false)
const checkoutLoading = ref<string | null>(null)
const portalLoading = ref(false)
const polling = ref(false)
const checkingAgain = ref(false)
const stillProcessing = ref(false)
const plansError = ref('')

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

/** Rough months per interval, used only to compare bang-for-buck across plans. */
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

  if (!success && !unlocked.value) {
    stillProcessing.value = true
  }
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
  requestAnimationFrame(() => {
    mounted.value = true
  })

  await authStore.checkAuth()

  if (authStore.isAuthenticated) {
    await subscription.fetchState(true)
    if (!subscription.unlocked.value) {
      await loadPlans()
      // Came back from Stripe and still locked — poll in the background until
      // the webhook flips the store active.
      if (statusParam.value === 'success') {
        pollForUnlock()
      }
    }
  }

  checkingAuth.value = false
})
</script>

<style scoped>
.animate-card-enter {
  animation: card-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes card-enter {
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-stagger-1 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both; }
.animate-stagger-2 { animation: stagger-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
@keyframes stagger-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-icon-glow {
  animation: icon-glow 2.5s ease-in-out infinite;
}
@keyframes icon-glow {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary, #6898ED) 0%, transparent); }
  50% { box-shadow: 0 0 30px 6px color-mix(in srgb, var(--color-primary, #6898ED) 25%, transparent); }
}
</style>