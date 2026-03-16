<template>
  <div class="stripe-payment">
    <!-- ✅ Always render mount container in DOM -->
    <div ref="paymentEl" class="mb-4"></div>

    <div v-if="!stripeLoaded" class="text-center py-4">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
      <p class="text-sm text-gray-600 mt-2">Loading Stripe...</p>
    </div>

    <div v-if="error" class="p-3 bg-red-50 rounded text-sm text-red-800 mb-4">
      {{ error }}
    </div>

    <button
      v-if="stripeLoaded"
      @click="handleSubmit"
      :disabled="processing || !stripe || !elements"
      class="btn-primary w-full"
    >
      {{ processing ? 'Processing...' : `Pay $${amount.toFixed(2)}` }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps<{
  amount: number
  publishableKey: string
  customerEmail: string
  orderId: string | number
}>()

const emit = defineEmits<{
  (e: 'success', paymentId: string): void
  (e: 'error', error: string): void
}>()

const { $apiFetch } = useNuxtApp()

const stripeLoaded = ref(false)
const processing = ref(false)
const error = ref<string | null>(null)

const backendPaymentId = ref<string | null>(null)
const paymentEl = ref<HTMLElement | null>(null)

let stripe: any = null
let elements: any = null
let paymentElementInstance: any = null

const emitError = (msg: unknown) => {
  const text = typeof msg === 'string' ? msg : 'Payment failed'
  emit('error', text)
}

const emitSuccess = (paymentId: string) => {
  emit('success', paymentId)
}

const loadStripe = async () => {
  try {
    // wait for DOM
    await nextTick()

    if (!paymentEl.value) {
      throw new Error('Payment element container not found in DOM')
    }

    // Load Stripe.js once
    if (!(window as any).Stripe) {
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.async = true

      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    stripe = (window as any).Stripe(props.publishableKey)

    // ✅ Create PaymentIntent for this order (server decides amount)
    const response = await $apiFetch<any>(`/orders/${props.orderId}/stripe/intent`, {
      method: 'POST'
    })

    const payload = response?.data ?? response
    const clientSecret = payload?.client_secret
    const paymentId = payload?.payment_id

    if (!clientSecret || !paymentId) {
      throw new Error('Failed to create payment intent')
    }

    backendPaymentId.value = String(paymentId)

    elements = stripe.elements({
      clientSecret,
      appearance: { theme: 'stripe' }
    })

    paymentElementInstance = elements.create('payment', {
      fields: {
        billingDetails: {
          address: {
            country: 'never',
          },
        },
      },
    })
    paymentElementInstance.mount(paymentEl.value)

    stripeLoaded.value = true
  } catch (err: any) {
    const msg = err?.message ?? 'Failed to load payment form'
    error.value = msg
    emit('error', msg)
  }
}

const handleSubmit = async () => {
  if (!stripe || !elements) return
  if (!backendPaymentId.value) {
    emit('error', 'Missing payment id')
    return
  }

  processing.value = true
  error.value = null

  try {
    const returnUrl =
      `${window.location.origin}/payment/complete?payment_id=${backendPaymentId.value}`

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required'
    })

    if (submitError) {
      const msg = submitError.message || 'Payment failed'
      error.value = msg
      emit('error', msg)
      return
    }

    // ✅ emit a guaranteed string
    emit('success', backendPaymentId.value)
  } catch (err: any) {
    const msg = err?.message || 'Payment failed'
    error.value = msg
    emit('error', msg)
  } finally {
    processing.value = false
  }
}

onMounted(loadStripe)

onBeforeUnmount(() => {
  try {
    if (paymentElementInstance) paymentElementInstance.unmount()
  } catch {}
  paymentElementInstance = null
  elements = null
  stripe = null
})
</script>
