<template>
  <div class="min-h-screen flex flex-col">

    <!-- Page Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Almost there</p>
        <h1 class="text-3xl font-bold text-gray-900">Checkout</h1>
        <p class="text-sm text-gray-500 mt-1">Complete your order below</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Left: Form -->
          <div class="lg:col-span-2 space-y-5">

            <!-- Customer Information -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Customer Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
                  <input v-model="form.customer_name" type="text" required class="input-field" placeholder="Jane Smith" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
                  <input v-model="form.customer_email" type="email" required class="input-field" placeholder="jane@example.com" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
                  <PhoneInput
                    v-model="form.customer_phone"
                    :default-country="storeCountry"
                    @update:dial-code="phoneDialCode = $event"
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>

            <!-- Delivery Method -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Delivery Method</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <label
                  class="relative flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
                  :class="deliveryMethod === 'delivery'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'"
                >
                  <input v-model="deliveryMethod" type="radio" value="delivery" class="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-sm font-semibold text-gray-900">Delivery</span>
                      <span
                        v-if="deliveryMethod === 'delivery'"
                        class="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium shrink-0"
                      >Selected</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">Delivered to your address</p>
                  </div>
                </label>

                <label
                  class="relative flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
                  :class="deliveryMethod === 'pickup'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'"
                >
                  <input v-model="deliveryMethod" type="radio" value="pickup" class="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-sm font-semibold text-gray-900">Self Pickup</span>
                      <span
                        v-if="deliveryMethod === 'pickup'"
                        class="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium shrink-0"
                      >Selected</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">Collect in-store · No shipping fee</p>
                  </div>
                </label>

              </div>
            </div>

            <!-- Shipping Address -->
            <div v-if="deliveryMethod === 'delivery'" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Shipping Address</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Street Address *</label>
                  <textarea v-model="form.shipping_address" required rows="3" class="input-field resize-none" placeholder="123 Main St, Apt 4B"></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Country *</label>
                    <CountrySelect v-model="form.country" placeholder="Select country" required />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">State / Province *</label>
                    <SearchableSelect v-model="form.state" :options="checkoutStateOptions" placeholder="Select state / province" required allow-free-text />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">City *</label>
                    <SearchableSelect v-model="form.city" :options="checkoutCityOptions" placeholder="Select city" required allow-free-text />
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Options -->
            <div v-if="deliveryMethod === 'delivery'" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Additional Shipping Services</h2>

              <div v-if="shippingOptions.length === 0" class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-amber-800 font-medium">No additional shipping options configured.</p>
              </div>

              <div v-else class="space-y-3">
                <p class="text-sm text-gray-500 mb-3">Select optional add-ons for your delivery</p>
                <label
                  v-for="option in shippingOptions"
                  :key="option.id"
                  class="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-all"
                >
                  <input
                    type="checkbox"
                    :value="option.id"
                    v-model="selectedShippingOptions"
                    @change="updateShippingOptions"
                    class="mt-0.5 h-4 w-4 text-blue-600 rounded shrink-0"
                  />
                  <div class="flex-1 min-w-0 flex items-start justify-between gap-4">
                    <div>
                      <p class="text-sm font-semibold text-gray-900">{{ option.name }}</p>
                      <p class="text-xs text-gray-500 mt-0.5">{{ option.description }}</p>
                    </div>
                    <span class="text-sm font-bold text-blue-600 shrink-0">+${{ parseFloat(option.fee || 0).toFixed(2) }}</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Payment Method</h2>

              <!-- Loading -->
              <div v-if="loadingPaymentMethods" class="flex items-center gap-3 py-4">
                <div class="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0"></div>
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
                  :class="selectedPaymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'"
                >
                  <input
                    v-model="selectedPaymentMethod"
                    type="radio"
                    :value="method.id"
                    class="mt-0.5 h-4 w-4 text-blue-600 shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-sm font-semibold text-gray-900">{{ method.name }}</span>
                      <span
                        v-if="selectedPaymentMethod === method.id"
                        class="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium shrink-0"
                      >Selected</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">{{ method.description }}</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Payment UI (Stripe / Redirect) -->
            <div
              v-if="selectedPaymentMethod && selectedPaymentMethod !== 'cash' && canShowPaymentUI"
              class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Payment</h2>

              <!-- Stripe -->
              <div v-if="selectedPaymentMethod === 'stripe'">
                <div v-if="!createdOrderId" class="space-y-4">
                  <p class="text-sm text-gray-500">Click continue to create your order and load the card form.</p>
                  <button
                    @click="createOrderOnly"
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
                  :publishable-key="getPaymentConfig('stripe')?.publishable_key"
                  :customer-email="form.customer_email"
                  @success="handleStripeSuccess"
                  @error="handlePaymentError"
                />
              </div>

              <!-- Redirect providers (PayPal, Square, etc.) -->
              <div v-else class="space-y-4">
                <p class="text-sm text-gray-500">You will be redirected to complete payment.</p>
                <button
                  @click="placeOrderAndRedirect"
                  :disabled="submitting || !isFormValid"
                  class="btn-primary w-full"
                >
                  {{ submitting ? 'Processing…' : 'Place Order & Pay' }}
                </button>
              </div>

              <div v-if="error" class="mt-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>

            <!-- Cash on Delivery -->
            <div v-if="selectedPaymentMethod === 'cash'" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Place Order</h2>
              <button
                @click="placeCashOrder"
                :disabled="submitting || !isFormValid"
                class="btn-primary w-full"
              >
                {{ submitting ? 'Processing…' : 'Place Order (Cash on Delivery)' }}
              </button>

              <div v-if="error" class="mt-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>

          </div>

          <!-- Right: Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
              <h2 class="text-base font-bold text-gray-900 mb-5">Order Summary</h2>

              <!-- Item list -->
              <div class="space-y-2.5 pb-4 border-b border-gray-100 max-h-60 overflow-y-auto">
                <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between items-start gap-2">
                  <span class="text-sm text-gray-600 leading-snug">{{ item.name }} <span class="text-gray-400">×{{ item.quantity }}</span></span>
                  <span class="text-sm font-medium text-gray-900 shrink-0">${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>

              <!-- Discount Code -->
              <div class="py-4 border-b border-gray-100">
                <div v-if="!appliedDiscount" class="flex gap-2">
                  <input
                    v-model="discountCode"
                    type="text"
                    class="input-field flex-1 uppercase font-mono tracking-widest text-sm"
                    placeholder="DISCOUNT CODE"
                    :disabled="applyingDiscount"
                    @keydown.enter.prevent="applyDiscount"
                  />
                  <button
                    type="button"
                    @click="applyDiscount"
                    :disabled="applyingDiscount || !discountCode.trim()"
                    class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shrink-0"
                  >
                    <span v-if="applyingDiscount" class="flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </span>
                    <span v-else>Apply</span>
                  </button>
                </div>
                <div v-else class="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p class="text-xs font-bold text-green-700 font-mono tracking-wider">{{ appliedDiscount.code }}</p>
                      <p class="text-xs text-green-600">
                        {{ appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}% off` : `$${parseFloat(String(appliedDiscount.value)).toFixed(2)} off` }}
                      </p>
                    </div>
                  </div>
                  <button type="button" @click="removeDiscount" class="text-gray-400 hover:text-red-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p v-if="discountError" class="mt-1.5 text-xs text-red-600">{{ discountError }}</p>
              </div>

              <!-- Totals -->
              <div class="space-y-2.5 py-4 border-b border-gray-100">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span class="font-medium text-gray-900">${{ cartStore.subtotal.toFixed(2) }}</span>
                </div>

                <template v-if="cartStore.taxInfo.enabled">
                  <div v-if="cartStore.taxInfo.mode === 'inclusive'" class="text-xs text-gray-400">
                    Includes {{ cartStore.taxInfo.name }} {{ cartStore.taxInfo.rate }}%:
                    <span class="font-medium">${{ cartStore.taxAmount.toFixed(2) }}</span>
                  </div>
                  <div v-else class="flex justify-between text-sm text-gray-600">
                    <span>{{ cartStore.taxInfo.name }} ({{ cartStore.taxInfo.rate }}%)</span>
                    <span class="font-medium text-gray-900">${{ cartStore.taxAmount.toFixed(2) }}</span>
                  </div>
                </template>

                <div v-if="deliveryMethod === 'pickup'" class="flex justify-between text-sm">
                  <span class="text-gray-600">Shipping (Pickup)</span>
                  <span class="font-semibold text-green-600">FREE</span>
                </div>
                <div v-else-if="cartStore.shippingError" class="space-y-2">
                  <div class="flex justify-between text-sm text-red-500">
                    <span>Shipping</span>
                    <span class="font-medium">Unavailable</span>
                  </div>
                  <div class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-xs text-amber-800 leading-relaxed">
                      We don't currently ship to this location. Please try a different address or contact us for assistance.
                    </p>
                  </div>
                </div>
                <div v-else-if="!cartStore.shippingCalculation" class="flex justify-between text-sm text-gray-400">
                  <span>Shipping</span>
                  <span class="italic">Enter address</span>
                </div>
                <div v-else class="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span v-if="cartStore.shippingCalculation.free_shipping" class="font-semibold text-green-600">FREE</span>
                  <span v-else class="font-medium text-gray-900">${{ cartStore.shippingCost.toFixed(2) }}</span>
                </div>

                <div v-if="appliedDiscount" class="flex justify-between text-sm text-green-700">
                  <span>Discount ({{ appliedDiscount.code }})</span>
                  <span class="font-semibold">-${{ discountAmount.toFixed(2) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center pt-4">
                <span class="font-bold text-gray-900">Total</span>
                <span class="text-xl font-bold text-gray-900">${{ finalTotal.toFixed(2) }}</span>
              </div>

              <NuxtLink to="/cart" class="btn-secondary w-full block text-center mt-5">
                Back to Cart
              </NuxtLink>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- DEV: Test busy overlay button (remove before production) -->
    <button
      @click="testBusyOverlay"
      class="fixed bottom-4 right-4 z-40 px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-red-600 transition-colors"
    >
      Test Busy Overlay
    </button>

    <!-- Busy / Queue Overlay -->
    <Transition name="fade">
      <div v-if="busyQueue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
          <div class="flex justify-center mb-5">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div class="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <div class="absolute inset-3 rounded-full border-4 border-blue-300 border-b-transparent animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
            </div>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Just a moment...</h3>
          <p class="text-sm text-gray-500 leading-relaxed">{{ busyMessage }}</p>
          <div class="mt-4 flex justify-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay: 0s;"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay: 0.15s;"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay: 0.3s;"></span>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
const { $apiFetch } = useNuxtApp()
const { getStates, getCities } = useRegions()

const deliveryMethod = ref<'delivery' | 'pickup'>('delivery')
const storeCountry = ref('')
const phoneDialCode = ref('')

const form = ref({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  shipping_address: '',
  city: '',
  state: '',
  country: ''
})

// Dynamic state/city options based on selected country/state
const checkoutStateOptions = computed(() => getStates(form.value.country))
const checkoutCityOptions = computed(() => getCities(form.value.country, form.value.state))

// Clear dependent fields when parent changes
watch(() => form.value.country, () => {
  form.value.state = ''
  form.value.city = ''
})
watch(() => form.value.state, () => {
  form.value.city = ''
})

const shippingOptions = ref<any[]>([])
const selectedShippingOptions = ref<string[]>([])
const paymentMethods = ref<any[]>([])
const selectedPaymentMethod = ref<string>('')
const loadingPaymentMethods = ref(true)

const submitting = ref(false)
const error = ref<string | null>(null)
const busyQueue = ref(false)
const busyMessage = ref('')

const discountCode = ref('')
const appliedDiscount = ref<{ code: string; type: 'percentage' | 'fixed'; value: number } | null>(null)
const applyingDiscount = ref(false)
const discountError = ref<string | null>(null)

// store created order id (so Stripe can mount after order exists)
const createdOrderId = ref<number | null>(null)

const isFormValid = computed(() => {
  const basicInfo =
    form.value.customer_name &&
    form.value.customer_email &&
    selectedPaymentMethod.value

  if (deliveryMethod.value === 'pickup') return !!basicInfo

  return !!basicInfo &&
    !!form.value.shipping_address &&
    !!form.value.city &&
    !!form.value.state &&
    !!form.value.country &&
    !cartStore.shippingError
})

const canShowPaymentUI = computed(() => isFormValid.value)

const discountAmount = computed(() => {
  if (!appliedDiscount.value) return 0
  const base = cartStore.subtotal
  if (appliedDiscount.value.type === 'percentage') {
    return Math.min(base * (appliedDiscount.value.value / 100), base)
  }
  return Math.min(appliedDiscount.value.value, base)
})

const finalTotal = computed(() => {
  const base = (() => {
    if (deliveryMethod.value === 'pickup') {
      return cartStore.taxInfo.mode === 'inclusive'
        ? cartStore.subtotal
        : cartStore.subtotal + cartStore.taxAmount
    }
    return cartStore.grandTotal
  })()
  return Math.max(0, base - discountAmount.value)
})

const applyDiscount = async () => {
  const code = discountCode.value.trim().toUpperCase()
  if (!code) return

  applyingDiscount.value = true
  discountError.value = null

  try {
    const res = await $apiFetch<any>('/discounts/validate', {
      method: 'POST',
      body: { code, order_amount: cartStore.subtotal }
    })
    
    const unwrapped = res?.data ?? res
    const discount = unwrapped?.discount ?? unwrapped
    appliedDiscount.value = {
      code: discount.code ?? code,
      type: discount.type,
      value: parseFloat(String(discount.value ?? 0))
    }
    discountCode.value = ''
  } catch (err: any) {
    discountError.value = err?.data?.message || 'Invalid or expired discount code.'
  } finally {
    applyingDiscount.value = false
  }
}

const removeDiscount = () => {
  appliedDiscount.value = null
  discountCode.value = ''
  discountError.value = null
}

const getPaymentConfig = (methodId: string) => {
  const method = paymentMethods.value.find(m => m.id === methodId)
  return method?.config || null
}

let shippingDebounceTimer: ReturnType<typeof setTimeout>
const debouncedShippingUpdate = () => {
  clearTimeout(shippingDebounceTimer)
  shippingDebounceTimer = setTimeout(async () => {
    if (deliveryMethod.value === 'pickup') {
      cartStore.shippingCalculation = null
      return
    }
    if (form.value.country && form.value.state && form.value.city) {
      await cartStore.calculateShipping({
        country: form.value.country,
        state: form.value.state,
        city: form.value.city
      })
    }
  }, 500)
}

// Watch address fields for changes (handles typing, autofill, paste)
watch(
  () => [form.value.city, form.value.state, form.value.country],
  () => {
    if (deliveryMethod.value === 'delivery') {
      debouncedShippingUpdate()
    }
  }
)

const updateShippingOptions = () => {
  if (deliveryMethod.value === 'delivery') {
    cartStore.setShippingOptions(selectedShippingOptions.value)
  }
}

const loadStoreCountry = async () => {
  try {
    const res = await $apiFetch<any>('/shipping-settings', { method: 'GET' })
    if (res?.data?.store_country) {
      storeCountry.value = res.data.store_country
    }
  } catch { /* non-critical */ }
}

const loadShippingOptions = async () => {
  try {
    const response = await $apiFetch<any>('/shipping/options', { method: 'GET' })
    if (response?.data) shippingOptions.value = response.data
  } catch (err) {
    console.error('Error loading shipping options:', err)
  }
}

const loadPaymentMethods = async () => {
  loadingPaymentMethods.value = true
  error.value = null

  try {
    const response = await $apiFetch<any>('/payment-settings/methods', { method: 'GET' })
    paymentMethods.value = response?.data ?? []

    if (!selectedPaymentMethod.value && paymentMethods.value.length > 0) {
      selectedPaymentMethod.value = paymentMethods.value[0].id
    }
  } catch (err: any) {
    paymentMethods.value = []
    error.value = err?.data?.message || 'Failed to load payment methods.'
  } finally {
    loadingPaymentMethods.value = false
  }
}

const buildOrderData = () => {
  const shippingAddress = deliveryMethod.value === 'pickup'
    ? 'Self Pickup'
    : `${form.value.shipping_address}, ${form.value.city}, ${form.value.state}, ${form.value.country}`

  return {
    customer_name: form.value.customer_name,
    customer_email: form.value.customer_email,
    customer_phone: form.value.customer_phone
      ? `${phoneDialCode.value} ${form.value.customer_phone}`.trim()
      : '',
    shipping_address: shippingAddress,

    country: form.value.country,
    state: form.value.state,
    city: form.value.city,

    delivery_method: deliveryMethod.value,
    payment_method: selectedPaymentMethod.value,
    items: cartStore.items.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    })),
    shipping_options: deliveryMethod.value === 'delivery'
      ? selectedShippingOptions.value
      : [],
    discount_code: appliedDiscount.value?.code ?? null
  }
}

// DEV: Test the busy overlay (remove before production)
const testBusyOverlay = () => {
  busyQueue.value = true
  busyMessage.value = 'We\'re experiencing high demand. Your order will be placed shortly...'
  setTimeout(() => { busyQueue.value = false }, 5000)
}

// Retry-aware fetch: shows busy UI on 429 and auto-retries
const fetchWithRetry = async <T = any>(url: string, opts: any, maxRetries = 3): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await $apiFetch<T>(url, opts)
    } catch (err: any) {
      const status = err?.status ?? err?.statusCode ?? err?.response?.status
      if (status === 429 && attempt < maxRetries) {
        const retryAfter = parseInt(err?.response?.headers?.get?.('Retry-After') || err?.data?.retry_after || '5', 10)
        const waitSeconds = Math.min(Math.max(retryAfter, 2), 30)
        busyQueue.value = true
        busyMessage.value = 'We\'re experiencing high demand. Your order will be placed shortly...'
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000))
        continue
      }
      throw err
    }
  }
  throw new Error('Server is busy. Please try again in a moment.')
}

// Stripe: create order first, then show StripePayment UI
const createOrderOnly = async () => {
  if (!isFormValid.value) return

  submitting.value = true
  error.value = null

  try {
    const orderRes = await fetchWithRetry<any>('/orders', {
      method: 'POST',
      body: buildOrderData()
    })

  const orderId = orderRes?.data?.order?.id

  if (!orderId) throw new Error('Order ID missing from /orders response')
  createdOrderId.value = Number(orderId)

  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Failed to create order.'
  } finally {
    submitting.value = false
    busyQueue.value = false
  }
}

// PayPal/Square: create order (if needed) then redirect
const placeOrderAndRedirect = async () => {
  if (!isFormValid.value) return
  if (!selectedPaymentMethod.value) return
  if (selectedPaymentMethod.value === 'stripe') return

  submitting.value = true
  error.value = null

  try {
    if (!createdOrderId.value) {
      await createOrderOnly()
      if (!createdOrderId.value) return
    }

    const payRes = await fetchWithRetry<any>(`/orders/${createdOrderId.value}/pay`, {
      method: 'POST',
      body: { provider: selectedPaymentMethod.value } // paypal|square
    })

    const payload = payRes?.data ?? payRes
    const paymentId = payload?.payment_id ?? payload?.id ?? null

    const redirectUrl =
      payload?.redirect_url ??
      payload?.approval_url ??
      payload?.checkout_url ??
      payload?.url ??
      null

    if (!redirectUrl) throw new Error('redirect_url missing from /orders/{order}/pay')

    if (paymentId) localStorage.setItem('last_payment_id', String(paymentId))
    window.location.href = redirectUrl
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Failed to start payment.'
  } finally {
    submitting.value = false
    busyQueue.value = false
  }
}

const handleStripeSuccess = async (paymentId: string) => {
  localStorage.setItem('last_payment_id', paymentId)
  navigateTo(`/payment/complete?payment_id=${paymentId}`)
}

const handlePaymentError = (errorMessage: string) => {
  error.value = errorMessage
}

const placeCashOrder = async () => {
  if (!isFormValid.value) return

  submitting.value = true
  error.value = null

  try {
    await fetchWithRetry('/orders', {
      method: 'POST',
      body: buildOrderData()
    })

    cartStore.clearCart()
    navigateTo('/order-success')
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Failed to place order.'
  } finally {
    submitting.value = false
    busyQueue.value = false
  }
}

watch(deliveryMethod, (newMethod) => {
  if (newMethod === 'pickup') {
    cartStore.shippingCalculation = null
    selectedShippingOptions.value = []
    cartStore.setShippingOptions([])
  } else {
    debouncedShippingUpdate()
  }
})

// If user changes provider after creating an order, reset orderId
watch(selectedPaymentMethod, () => {
  createdOrderId.value = null
})

onMounted(() => {
  if (cartStore.items.length === 0) {
    navigateTo('/cart')
    return
  }

  loadStoreCountry()
  loadShippingOptions()
  loadPaymentMethods()
  cartStore.calculateTax()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
