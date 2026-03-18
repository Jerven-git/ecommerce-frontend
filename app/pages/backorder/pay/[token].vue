<template>
  <div class="min-h-screen flex flex-col">

    <!-- Page Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Backorder Payment</p>
        <h1 class="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
        <p class="text-sm text-gray-500 mt-1">Your backordered item is now available</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-gray-50">
      <div class="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
          <div class="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
          <p class="text-sm text-gray-500">Verifying your payment link...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
          <div class="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="font-semibold text-gray-800 mb-2">{{ errorTitle }}</p>
          <p class="text-sm text-gray-500">{{ error }}</p>
          <NuxtLink to="/" class="inline-block mt-6 btn-primary">Return to Store</NuxtLink>
        </div>

        <!-- Payment form -->
        <div v-else-if="backorderData" class="space-y-5">
          <!-- Order details -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Order Details</h2>

            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Order</span>
                <span class="font-medium text-gray-900">#{{ backorderData.order_id }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Customer</span>
                <span class="font-medium text-gray-900">{{ backorderData.customer_name }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Product</span>
                <span class="font-medium text-gray-900">{{ backorderData.product_name }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Quantity</span>
                <span class="font-medium text-gray-900">{{ backorderData.quantity }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Subtotal</span>
                <span class="font-medium text-gray-900">${{ backorderData.subtotal.toFixed(2) }}</span>
              </div>
              <div v-if="backorderData.tax_amount > 0" class="flex justify-between text-sm">
                <span class="text-gray-500">{{ backorderData.tax_name }} ({{ backorderData.tax_rate }}%)</span>
                <span class="font-medium text-gray-900">${{ backorderData.tax_amount.toFixed(2) }}</span>
              </div>
              <div v-if="backorderData.shipping_amount > 0" class="flex justify-between text-sm">
                <span class="text-gray-500">Shipping</span>
                <span class="font-medium text-gray-900">${{ backorderData.shipping_amount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-sm pt-3 border-t border-gray-100">
                <span class="font-bold text-gray-900">Total</span>
                <span class="text-lg font-bold text-gray-900">${{ backorderData.total.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Expiry warning -->
            <div class="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-xs text-amber-800 leading-relaxed">
                This payment link expires on {{ formatDate(backorderData.expires_at) }}. Please complete your payment before then.
              </p>
            </div>
          </div>

          <!-- Payment method selection -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Payment Method</h2>

            <div v-if="loadingPaymentMethods" class="flex items-center gap-3 py-4">
              <div class="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0"></div>
              <p class="text-sm text-gray-500">Loading payment methods...</p>
            </div>

            <div v-else class="space-y-3">
              <label
                v-for="method in paymentMethods"
                :key="method.id"
                class="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
                :class="selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'"
              >
                <input
                  v-model="selectedMethod"
                  type="radio"
                  :value="method.id"
                  class="mt-0.5 h-4 w-4 accent-blue-600 shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <span class="text-sm font-semibold text-gray-900">{{ method.name }}</span>
                  <p class="text-xs text-gray-500 mt-0.5">{{ method.description }}</p>
                </div>
              </label>
            </div>

            <!-- Non-Stripe: single button to initiate payment -->
            <template v-if="selectedMethod !== 'stripe'">
              <button
                @click="initiatePayment"
                :disabled="!selectedMethod || submitting"
                class="btn-primary w-full mt-5"
              >
                {{ submitting ? 'Processing...' : `Pay $${backorderData.total.toFixed(2)}` }}
              </button>
            </template>

            <!-- Stripe: create order payment then show card form -->
            <template v-else>
              <div v-if="!stripeOrderId" class="mt-5">
                <button
                  @click="prepareStripePayment"
                  :disabled="submitting"
                  class="btn-primary w-full"
                >
                  {{ submitting ? 'Processing...' : 'Continue to Card Payment' }}
                </button>
              </div>
              <div v-else class="mt-5">
                <StripePayment
                  :order-id="String(stripeOrderId)"
                  :amount="backorderData.total"
                  :publishable-key="stripePublishableKey"
                  :customer-email="backorderData.customer_email"
                  :client-secret="stripeClientSecret"
                  :payment-id="stripePaymentId"
                  @success="handleStripeSuccess"
                  @error="handleStripeError"
                />
              </div>
            </template>

            <div v-if="payError" class="mt-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
              <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-700">{{ payError }}</p>
            </div>
          </div>
        </div>

        <!-- Success state -->
        <div v-else-if="paymentSuccess" class="bg-white rounded-2xl border border-green-100 shadow-sm p-10 text-center">
          <div class="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="font-semibold text-gray-800 mb-2">Payment Successful!</p>
          <p class="text-sm text-gray-500">Your backorder payment has been received. We'll process your order shortly.</p>
          <NuxtLink to="/" class="inline-block mt-6 btn-primary">Return to Store</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { $apiFetch } = useNuxtApp()
const token = route.params.token as string

const loading = ref(true)
const error = ref<string | null>(null)
const errorTitle = ref('Invalid Payment Link')
const backorderData = ref<{
  id: number
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  tax_amount: number
  tax_rate: number
  tax_name: string
  shipping_amount: number
  total: number
  customer_name: string
  customer_email: string
  order_id: number
  expires_at: string
} | null>(null)

const paymentMethods = ref<any[]>([])
const loadingPaymentMethods = ref(true)
const selectedMethod = ref('')
const submitting = ref(false)
const payError = ref<string | null>(null)
const paymentSuccess = ref(false)
const stripeOrderId = ref<number | null>(null)
const stripeClientSecret = ref('')
const stripePaymentId = ref<string | undefined>(undefined)
const stripePublishableKey = ref('')

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const verifyToken = async () => {
  loading.value = true
  try {
    const response = await $apiFetch<any>(`/backorders/pay/${token}`, { method: 'GET' })
    backorderData.value = response.data
  } catch (err: any) {
    const status = err?.status ?? err?.statusCode ?? err?.response?.status
    if (status === 410) {
      errorTitle.value = 'Link Expired'
      error.value = 'This payment link has expired. Please contact us if you still want to purchase this item.'
    } else if (status === 404) {
      errorTitle.value = 'Invalid Link'
      error.value = 'This payment link is not valid. Please check the link in your email.'
    } else if (status === 422) {
      errorTitle.value = 'Already Paid'
      error.value = 'This backorder has already been paid. No further action is needed.'
    } else {
      error.value = err?.data?.message || 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const loadPaymentMethods = async () => {
  loadingPaymentMethods.value = true
  try {
    const response = await $apiFetch<any>('/payment-settings/methods', { method: 'GET' })
    // Filter out cash — backorders require online payment
    paymentMethods.value = (response?.data ?? []).filter((m: any) => m.id !== 'cash')
    if (paymentMethods.value.length > 0) {
      selectedMethod.value = paymentMethods.value[0].id
    }
    // Capture Stripe publishable key
    const stripeMethod = paymentMethods.value.find((m: any) => m.id === 'stripe')
    if (stripeMethod?.config?.publishable_key) {
      stripePublishableKey.value = stripeMethod.config.publishable_key
    }
  } catch {
    paymentMethods.value = []
  } finally {
    loadingPaymentMethods.value = false
  }
}

const initiatePayment = async () => {
  if (!selectedMethod.value || !backorderData.value) return

  submitting.value = true
  payError.value = null

  try {
    const response = await $apiFetch<any>(`/backorders/pay/${token}`, {
      method: 'POST',
      body: { payment_method: selectedMethod.value },
    })

    const data = response?.data
    if (data?.order_id && data?.payment_id) {
      const redirectUrl = data?.redirect_url
      if (redirectUrl) {
        localStorage.setItem('last_payment_id', String(data.payment_id))
        window.location.href = redirectUrl
        return
      }
    }
  } catch (err: any) {
    payError.value = err?.data?.message || 'Failed to initiate payment. Please try again.'
  } finally {
    submitting.value = false
  }
}

const prepareStripePayment = async () => {
  if (!backorderData.value) return

  submitting.value = true
  payError.value = null

  try {
    const response = await $apiFetch<any>(`/backorders/pay/${token}`, {
      method: 'POST',
      body: { payment_method: 'stripe' },
    })

    const data = response?.data
    if (data?.order_id && data?.client_secret && data?.payment_id) {
      stripeOrderId.value = data.order_id
      stripeClientSecret.value = data.client_secret
      stripePaymentId.value = String(data.payment_id)
    } else {
      throw new Error('Failed to prepare payment')
    }
  } catch (err: any) {
    payError.value = err?.data?.message || 'Failed to prepare payment. Please try again.'
  } finally {
    submitting.value = false
  }
}

const handleStripeSuccess = (paymentId: string) => {
  localStorage.setItem('last_payment_id', paymentId)
  navigateTo(`/payment/complete?payment_id=${paymentId}`)
}

const handleStripeError = (errorMessage: string) => {
  payError.value = errorMessage
}

onMounted(() => {
  verifyToken()
  loadPaymentMethods()
})
</script>
