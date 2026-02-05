<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Checkout</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Checkout Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Customer Information -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4">Customer Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input v-model="form.customer_name" type="text" required class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input v-model="form.customer_email" type="email" required class="input-field" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input v-model="form.customer_phone" type="tel" class="input-field" />
              </div>
            </div>
          </div>

          <!-- Delivery Method -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4">Delivery Method</h2>
            <div class="space-y-3">
              <label
                class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors"
                :class="deliveryMethod === 'delivery'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'"
              >
                <input
                  v-model="deliveryMethod"
                  type="radio"
                  value="delivery"
                  class="mt-1 h-4 w-4 text-blue-600"
                >
                <div class="ml-3 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold">Delivery</span>
                    <span
                      v-if="deliveryMethod === 'delivery'"
                      class="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                    >Selected</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">Get it delivered to your address</p>
                </div>
              </label>

              <label
                class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors"
                :class="deliveryMethod === 'pickup'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'"
              >
                <input
                  v-model="deliveryMethod"
                  type="radio"
                  value="pickup"
                  class="mt-1 h-4 w-4 text-blue-600"
                >
                <div class="ml-3 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold">Self Pickup</span>
                    <span
                      v-if="deliveryMethod === 'pickup'"
                      class="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                    >Selected</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">Pick up from our store - No shipping fee</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Shipping Address -->
          <div v-if="deliveryMethod === 'delivery'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4">Shipping Address</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                <textarea v-model="form.shipping_address" required rows="3" class="input-field"></textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input v-model="form.city" type="text" required class="input-field" @change="updateShipping" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
                  <input v-model="form.state" type="text" required class="input-field" @change="updateShipping" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <input v-model="form.country" type="text" required class="input-field" @change="updateShipping" />
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Options -->
          <div v-if="deliveryMethod === 'delivery'" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4">Additional Shipping Services</h2>

            <div v-if="shippingOptions.length === 0" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p class="text-sm text-yellow-800">
                <strong>No shipping options configured.</strong>
              </p>
            </div>

            <p v-else class="text-sm text-gray-600 mb-4">Select optional services for your delivery</p>

            <div v-if="shippingOptions.length > 0" class="space-y-3">
              <label
                v-for="option in shippingOptions"
                :key="option.id"
                class="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  :value="option.id"
                  v-model="selectedShippingOptions"
                  @change="updateShippingOptions"
                  class="mt-1 h-4 w-4 text-blue-600"
                />
                <div class="ml-3 flex-1">
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="font-medium">{{ option.name }}</span>
                      <p class="text-sm text-gray-600 mt-1">{{ option.description }}</p>
                    </div>
                    <span class="font-semibold text-blue-600 ml-4">
                      +${{ parseFloat(option.fee || 0).toFixed(2) }}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Payment Method Selection -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4">Payment Method</h2>

            <div v-if="loadingPaymentMethods" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p class="text-sm text-gray-600 mt-2">Loading payment methods...</p>
            </div>

            <div v-else-if="paymentMethods.length === 0" class="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p class="text-sm text-yellow-800">
                <strong>No payment methods available.</strong><br>
                Please enable payment methods in Admin → Payment Settings.
              </p>
            </div>

            <div v-else class="space-y-3">
              <label
                v-for="method in paymentMethods"
                :key="method.id"
                class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors"
                :class="selectedPaymentMethod === method.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'"
              >
                <input
                  v-model="selectedPaymentMethod"
                  type="radio"
                  :value="method.id"
                  class="mt-1 h-4 w-4 text-blue-600"
                >
                <div class="ml-3 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold">{{ method.name }}</span>
                    <span
                      v-if="selectedPaymentMethod === method.id"
                      class="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                    >Selected</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">{{ method.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Payment Area -->
          <div
            v-if="selectedPaymentMethod && selectedPaymentMethod !== 'cash' && canShowPaymentUI"
            class="bg-white rounded-lg shadow p-6"
          >
            <h2 class="text-xl font-bold mb-4">Payment</h2>

            <!-- Stripe SDK -->
            <div v-if="selectedPaymentMethod === 'stripe'">
              <div v-if="!createdOrderId" class="space-y-3">
                <p class="text-sm text-gray-600">
                  Click continue to create your order and load the card form.
                </p>
                <button
                  @click="createOrderOnly"
                  :disabled="submitting || !isFormValid"
                  class="btn-primary w-full"
                >
                  {{ submitting ? 'Processing...' : 'Continue to Card Payment' }}
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

            <!-- Redirect Providers -->
            <div v-else class="space-y-3">
              <p class="text-sm text-gray-600">You will be redirected to complete payment.</p>
              <button
                @click="placeOrderAndRedirect"
                :disabled="submitting || !isFormValid"
                class="btn-primary w-full"
              >
                {{ submitting ? 'Processing...' : 'Place Order & Pay' }}
              </button>
            </div>

            <div v-if="error" class="mt-4 p-3 bg-red-50 rounded text-sm text-red-800">
              {{ error }}
            </div>
          </div>

          <!-- Cash -->
          <div v-if="selectedPaymentMethod === 'cash'" class="bg-white rounded-lg shadow p-6">
            <button
              @click="placeCashOrder"
              :disabled="submitting || !isFormValid"
              class="btn-primary w-full"
            >
              {{ submitting ? 'Processing...' : 'Place Order (Cash on Delivery)' }}
            </button>

            <div v-if="error" class="mt-4 p-3 bg-red-50 rounded text-sm text-red-800">
              {{ error }}
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 class="text-xl font-bold mb-4">Order Summary</h2>

            <div class="space-y-3 mb-4 pb-4 border-b max-h-64 overflow-y-auto">
              <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between text-sm">
                <span class="text-gray-700">{{ item.name }} × {{ item.quantity }}</span>
                <span class="font-medium">${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>

            <div class="space-y-2 mb-4 pb-4 border-b">
              <div class="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${{ cartStore.subtotal.toFixed(2) }}</span>
              </div>

              <div v-if="cartStore.taxInfo.enabled">
                <div v-if="cartStore.taxInfo.mode === 'inclusive'" class="text-sm text-gray-600 italic">
                  <p>(Includes {{ cartStore.taxInfo.name }} {{ cartStore.taxInfo.rate }}%: ${{ cartStore.taxAmount.toFixed(2) }})</p>
                </div>
                <div v-else class="flex justify-between text-gray-700">
                  <span>{{ cartStore.taxInfo.name }} ({{ cartStore.taxInfo.rate }}%)</span>
                  <span>${{ cartStore.taxAmount.toFixed(2) }}</span>
                </div>
              </div>

              <div v-if="deliveryMethod === 'pickup'" class="flex justify-between text-green-600 font-semibold">
                <span>Shipping (Self Pickup)</span>
                <span>FREE</span>
              </div>
              <div v-else-if="!cartStore.shippingCalculation" class="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span class="text-sm">Enter address</span>
              </div>
              <div v-else>
                <div class="flex justify-between text-gray-700 font-medium">
                  <span>Shipping</span>
                  <span v-if="cartStore.shippingCalculation.free_shipping" class="text-green-600">FREE</span>
                  <span v-else>${{ cartStore.shippingCost.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="flex justify-between text-2xl font-bold mb-6">
              <span>Total</span>
              <span>${{ finalTotal.toFixed(2) }}</span>
            </div>

            <NuxtLink to="/cart" class="btn-secondary w-full block text-center">Back to Cart</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
const { $apiFetch } = useNuxtApp()

const deliveryMethod = ref<'delivery' | 'pickup'>('delivery')

const form = ref({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  shipping_address: '',
  city: '',
  state: '',
  country: ''
})

const shippingOptions = ref<any[]>([])
const selectedShippingOptions = ref<string[]>([])
const paymentMethods = ref<any[]>([])
const selectedPaymentMethod = ref<string>('')
const loadingPaymentMethods = ref(true)

const submitting = ref(false)
const error = ref<string | null>(null)

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
    !!form.value.country
})

const canShowPaymentUI = computed(() => isFormValid.value)

const finalTotal = computed(() => {
  if (deliveryMethod.value === 'pickup') {
    return cartStore.taxInfo.mode === 'inclusive'
      ? cartStore.subtotal
      : cartStore.subtotal + cartStore.taxAmount
  }
  return cartStore.grandTotal
})

const getPaymentConfig = (methodId: string) => {
  const method = paymentMethods.value.find(m => m.id === methodId)
  return method?.config || null
}

const updateShipping = async () => {
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
}

const updateShippingOptions = () => {
  if (deliveryMethod.value === 'delivery') {
    cartStore.setShippingOptions(selectedShippingOptions.value)
  }
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
    customer_phone: form.value.customer_phone,
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
      : []
  }
}

// Stripe: create order first, then show StripePayment UI
const createOrderOnly = async () => {
  if (!isFormValid.value) return

  submitting.value = true
  error.value = null

  try {
    const orderRes = await $apiFetch<any>('/orders', {
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

    const payRes = await $apiFetch<any>(`/orders/${createdOrderId.value}/pay`, {
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
  }
}

// StripePayment should emit backend payment_id (not the paymentIntent id)
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
    await $apiFetch('/orders', {
      method: 'POST',
      body: buildOrderData()
    })

    cartStore.clearCart()
    navigateTo('/order-success')
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Failed to place order.'
  } finally {
    submitting.value = false
  }
}

watch(deliveryMethod, (newMethod) => {
  if (newMethod === 'pickup') {
    cartStore.shippingCalculation = null
    selectedShippingOptions.value = []
    cartStore.setShippingOptions([])
  } else {
    updateShipping()
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

  loadShippingOptions()
  loadPaymentMethods()
  cartStore.calculateTax()
})
</script>
