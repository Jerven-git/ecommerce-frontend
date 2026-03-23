<template>
  <div>
    <!-- Deferred Backorder: no payment needed now -->
    <div v-if="allDeferredBackorder" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Place Order</h2>
      <div class="flex items-start gap-2.5 p-3.5 bg-primary-50 border border-primary-100 rounded-xl mb-5">
        <svg class="w-4 h-4 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xs text-primary-800 leading-relaxed">
          All items in your cart are on backorder and will be charged later. No payment is required now — you'll receive a payment link when your items become available.
        </p>
      </div>
      <button
        @click="$emit('placeDeferredBackorder')"
        :disabled="submitting || !isFormValid"
        class="btn-primary w-full"
      >
        {{ submitting ? 'Processing…' : 'Place Backorder' }}
      </button>
      <ErrorAlert v-if="error" :message="error" />
    </div>

    <!-- Payment Method (hidden when nothing to pay now) -->
    <div v-if="!allDeferredBackorder" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Payment Method</h2>

      <!-- Loading -->
      <div v-if="loadingMethods" class="flex items-center gap-3 py-4">
        <div class="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin shrink-0"></div>
        <p class="text-sm text-gray-500">Loading payment methods…</p>
      </div>

      <!-- None available -->
      <div v-else-if="paymentMethods.length === 0" class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xs text-amber-800 font-medium">No payment methods available. Please enable them in Admin → Payment Settings.</p>
      </div>

      <!-- Method tiles -->
      <div v-else class="space-y-3">
        <label
          v-for="method in paymentMethods"
          :key="method.id"
          class="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
          :class="selectedMethod === method.id
            ? 'border-primary-500 bg-primary-50/50'
            : 'border-gray-200 hover:border-gray-300 bg-white'"
        >
          <input
            :checked="selectedMethod === method.id"
            @change="$emit('update:selectedMethod', method.id)"
            type="radio"
            name="paymentMethod"
            :value="method.id"
            class="mt-0.5 h-4 w-4 accent-primary-600 shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-semibold text-gray-900">{{ method.name }}</span>
              <span
                v-if="selectedMethod === method.id"
                class="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full font-medium shrink-0"
              >Selected</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">{{ method.description }}</p>
          </div>
        </label>
      </div>
    </div>

    <!-- Payment UI (Stripe / Redirect) -->
    <div
      v-if="selectedMethod && selectedMethod !== 'cash' && canShowPaymentUI && !allDeferredBackorder"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-5"
    >
      <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Payment</h2>

      <!-- Stripe -->
      <div v-if="selectedMethod === 'stripe'">
        <div v-if="!createdOrderId" class="space-y-4">
          <p class="text-sm text-gray-500">Click continue to create your order and load the card form.</p>
          <button
            @click="$emit('createOrder')"
            :disabled="submitting || !isFormValid"
            class="btn-primary w-full"
          >
            {{ submitting ? 'Processing…' : 'Continue to Card Payment' }}
          </button>
        </div>
        <StripePayment
          v-else
          :order-id="String(createdOrderId)"
          :amount="finalTotal"
          :publishable-key="stripePublishableKey"
          :customer-email="customerEmail"
          @success="$emit('stripeSuccess', $event)"
          @error="$emit('paymentError', $event)"
        />
      </div>

      <!-- Redirect providers (PayPal, Square, etc.) -->
      <div v-else class="space-y-4">
        <p class="text-sm text-gray-500">You will be redirected to complete payment.</p>
        <button
          @click="$emit('placeRedirect')"
          :disabled="submitting || !isFormValid"
          class="btn-primary w-full"
        >
          {{ submitting ? 'Processing…' : 'Place Order & Pay' }}
        </button>
      </div>

      <ErrorAlert v-if="error" :message="error" />
    </div>

    <!-- Cash on Delivery -->
    <div v-if="selectedMethod === 'cash' && !allDeferredBackorder" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-5">
      <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Place Order</h2>
      <button
        @click="$emit('placeCash')"
        :disabled="submitting || !isFormValid"
        class="btn-primary w-full"
      >
        {{ submitting ? 'Processing…' : 'Place Order (Cash on Delivery)' }}
      </button>
      <ErrorAlert v-if="error" :message="error" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  paymentMethods: any[]
  selectedMethod: string
  loadingMethods: boolean
  allDeferredBackorder: boolean
  canShowPaymentUI: boolean
  isFormValid: boolean
  submitting: boolean
  error: string | null
  createdOrderId: number | null
  finalTotal: number
  stripePublishableKey: string | null
  customerEmail: string
}>()

defineEmits<{
  'update:selectedMethod': [value: string]
  'createOrder': []
  'placeRedirect': []
  'placeCash': []
  'placeDeferredBackorder': []
  'stripeSuccess': [paymentId: string]
  'paymentError': [error: string]
}>()

// Inline error alert sub-component
const ErrorAlert = defineComponent({
  props: { message: { type: String, required: true } },
  template: `
    <div class="mt-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
      <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm text-red-700">{{ message }}</p>
    </div>
  `
})
</script>
