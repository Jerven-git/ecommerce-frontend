<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Hero -->
    <section class="relative isolate flex min-h-[46vh] overflow-hidden text-white">
      <div class="hero-media-gradient absolute inset-0" aria-hidden="true" />
      <div class="hero-media-grain absolute inset-0" aria-hidden="true" />
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" aria-hidden="true" />

      <div class="relative z-10 mx-auto flex w-full max-w-3xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        <p class="hero-stagger mb-3 text-sm font-medium text-white/70" style="animation-delay: 0.15s">Gift cards</p>
        <h1 class="hero-stagger display-1 font-bold leading-tight text-balance drop-shadow-sm" style="animation-delay: 0.3s">Give the gift of choice</h1>
        <p class="hero-stagger mt-5 max-w-xl text-lg text-white/85" style="animation-delay: 0.45s">
          Pick an amount, add a personal message, and we'll email the code straight to them.
        </p>
      </div>
    </section>

    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">

      <!-- Loading denominations -->
      <div v-if="loadingDenominations" class="py-16 text-center text-sm text-gray-500">
        Loading…
      </div>

      <!-- No denominations configured -->
      <div v-else-if="denominations.length === 0" class="flex flex-col items-center py-16 text-center">
        <svg class="h-11 w-11 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
        <p class="mt-4 text-lg font-semibold text-gray-900">Gift cards coming soon</p>
        <p class="mt-1 max-w-xs text-gray-500">They're not available just yet — check back shortly.</p>
      </div>

      <template v-else>

        <!-- Step 1: Pick denomination -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="mb-4 flex items-center gap-3">
            <span class="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold" :style="{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }">1</span>
            <h2 class="text-base font-semibold text-gray-900">Choose an amount</h2>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="d in denominations"
              :key="d.id"
              type="button"
              @click="form.gift_card_denomination_id = d.id"
              class="border-2 rounded-xl p-4 text-center transition-all"
              :class="form.gift_card_denomination_id === d.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'"
            >
              <p class="text-xl font-bold text-gray-900">{{ format(Number(d.amount)) }}</p>
              <p v-if="d.label" class="text-xs text-gray-500 mt-0.5">{{ d.label }}</p>
            </button>
          </div>
          <p v-if="attempted && fieldErrors.denomination" class="mt-2 text-xs text-red-600">{{ fieldErrors.denomination }}</p>
        </div>

        <!-- Step 2: Recipient & Sender details -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-3">
            <span class="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold" :style="{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }">2</span>
            <h2 class="text-base font-semibold text-gray-900">Gift details</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Recipient Email <span class="text-red-500">*</span></label>
              <input v-model="form.recipient_email" type="email" placeholder="friend@example.com" :class="['input-field w-full', attempted && fieldErrors.recipient_email ? '!border-red-300' : '']" />
              <p v-if="attempted && fieldErrors.recipient_email" class="mt-1 text-xs text-red-600">{{ fieldErrors.recipient_email }}</p>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Recipient Name</label>
              <input v-model="form.recipient_name" type="text" class="input-field w-full" placeholder="Optional" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Your Name <span class="text-red-500">*</span></label>
              <input v-model="form.customer_name" type="text" placeholder="Your name" :class="['input-field w-full', attempted && fieldErrors.customer_name ? '!border-red-300' : '']" />
              <p v-if="attempted && fieldErrors.customer_name" class="mt-1 text-xs text-red-600">{{ fieldErrors.customer_name }}</p>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Your Email <span class="text-red-500">*</span></label>
              <input v-model="form.customer_email" type="email" placeholder="your@email.com" :class="['input-field w-full', attempted && fieldErrors.customer_email ? '!border-red-300' : '']" />
              <p v-if="attempted && fieldErrors.customer_email" class="mt-1 text-xs text-red-600">{{ fieldErrors.customer_email }}</p>
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700">Personal Message</label>
              <textarea v-model="form.message" rows="3" class="input-field w-full resize-none" placeholder="Add a personal note… (optional)" />
            </div>
          </div>
        </div>

        <!-- Step 3: Payment method -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="mb-4 flex items-center gap-3">
            <span class="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold" :style="{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }">3</span>
            <h2 class="text-base font-semibold text-gray-900">Payment method</h2>
          </div>

          <div v-if="loadingPaymentMethods" class="flex items-center gap-3 py-4">
            <div class="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin shrink-0"></div>
            <p class="text-sm text-gray-500">Loading payment methods…</p>
          </div>

          <div v-else-if="paymentMethods.length === 0" class="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 font-medium">
            No payment methods available.
          </div>

          <div v-else class="space-y-3">
            <label
              v-for="method in paymentMethods"
              :key="method.id"
              class="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
              :class="form.payment_method === method.id
                ? 'border-primary-500 bg-primary-50/50'
                : 'border-gray-200 hover:border-gray-300 bg-white'"
            >
              <input
                :checked="form.payment_method === method.id"
                @change="form.payment_method = method.id"
                type="radio"
                name="paymentMethod"
                :value="method.id"
                class="mt-0.5 h-4 w-4 accent-primary-600 shrink-0"
              />
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ method.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ method.description }}</p>
              </div>
            </label>
          </div>
          <p v-if="attempted && fieldErrors.payment_method" class="mt-2 text-xs text-red-600">{{ fieldErrors.payment_method }}</p>
        </div>

        <!-- Stripe payment element -->
        <div v-if="form.payment_method === 'stripe' && createdOrderId" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 class="mb-4 text-base font-semibold text-gray-900">Card details</h2>
          <StripePayment
            :order-id="String(createdOrderId)"
            :amount="selectedDenomination ? Number(selectedDenomination.amount) : 0"
            :publishable-key="stripeConfig?.publishable_key ?? ''"
            :customer-email="form.customer_email"
            @success="handleStripeSuccess"
            @error="error = $event"
          />
        </div>

        <!-- Error -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {{ error }}
        </div>

        <!-- Summary + CTA -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between text-sm mb-4" v-if="selectedDenomination">
            <span class="text-gray-600">Gift card value</span>
            <span class="font-bold text-gray-900">{{ format(Number(selectedDenomination.amount)) }}</span>
          </div>

          <!-- Redirect-based (PayPal / Square) -->
          <button
            v-if="!form.payment_method || form.payment_method !== 'stripe'"
            @click="handleRedirectPay"
            :disabled="submitting"
            class="btn-primary w-full"
          >
            {{ submitting ? 'Processing…' : 'Purchase Gift Card' }}
          </button>

          <!-- Stripe: first create order, then show Stripe Elements -->
          <button
            v-else-if="form.payment_method === 'stripe' && !createdOrderId"
            @click="handleStripeStart"
            :disabled="submitting"
            class="btn-primary w-full"
          >
            {{ submitting ? 'Processing…' : 'Continue to Payment' }}
          </button>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGiftCardPurchase } from '~/composables/useGiftCard'

const { $apiFetch } = useNuxtApp()
const { format } = useCurrency()
const {
  denominations, loadingDenominations, form,
  submitting, error, createdOrderId, selectedDenomination, isFormValid,
  loadDenominations, createOrder,
} = useGiftCardPurchase()

const paymentMethods = ref<any[]>([])
const loadingPaymentMethods = ref(true)
const stripeConfig = ref<any>(null)

const attempted = ref(false)

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const fieldErrors = computed(() => ({
  denomination: !form.value.gift_card_denomination_id ? 'Please select an amount.' : null,
  recipient_email: !form.value.recipient_email.trim()
    ? 'Recipient email is required.'
    : !isValidEmail(form.value.recipient_email) ? 'Enter a valid email address.' : null,
  customer_name: !form.value.customer_name.trim() ? 'Your name is required.' : null,
  customer_email: !form.value.customer_email.trim()
    ? 'Your email is required.'
    : !isValidEmail(form.value.customer_email) ? 'Enter a valid email address.' : null,
  payment_method: !form.value.payment_method ? 'Please select a payment method.' : null,
}))

const loadPaymentMethods = async () => {
  try {
    const res = await $apiFetch<any>('/payment-settings/methods', { method: 'GET' })
    paymentMethods.value = res?.data ?? []
    if (paymentMethods.value.length > 0) {
      form.value.payment_method = paymentMethods.value[0].id
    }
  } finally {
    loadingPaymentMethods.value = false
  }
}

const getStripeConfig = () => {
  const method = paymentMethods.value.find(m => m.id === 'stripe')
  return method?.config ?? null
}

const handleRedirectPay = async () => {
  attempted.value = true
  if (!isFormValid.value) return
  const orderId = await createOrder()
  if (!orderId) return

  try {
    submitting.value = true
    const payRes = await $apiFetch<any>(`/orders/${orderId}/pay`, {
      method: 'POST',
      body: { provider: form.value.payment_method },
    })
    const payload = payRes?.data ?? payRes
    const redirectUrl = payload?.redirect_url ?? payload?.approval_url ?? payload?.checkout_url ?? payload?.url ?? null
    if (!redirectUrl) throw new Error('No redirect URL received')
    const paymentId = payload?.payment_id ?? payload?.id ?? null
    if (paymentId) localStorage.setItem('last_payment_id', String(paymentId))
    window.location.href = redirectUrl
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Failed to start payment.'
  } finally {
    submitting.value = false
  }
}

const handleStripeStart = async () => {
  attempted.value = true
  if (!isFormValid.value) return
  await createOrder()
  if (createdOrderId.value) {
    stripeConfig.value = getStripeConfig()
  }
}

const handleStripeSuccess = (paymentId: string) => {
  localStorage.setItem('last_payment_id', paymentId)
  navigateTo(`/payment/complete?payment_id=${paymentId}`)
}

onMounted(() => {
  loadDenominations()
  loadPaymentMethods()
})

useSeoMeta({ title: 'Gift Cards' })
</script>

<style scoped>
.input-field {
  @apply px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none;
}

.hero-stagger {
  opacity: 0;
  animation: hero-fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .hero-stagger { animation: none; opacity: 1; transform: none; }
}
</style>
