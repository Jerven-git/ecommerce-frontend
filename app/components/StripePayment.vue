<template>
  <div class="stripe-payment">
    <div v-if="!stripeLoaded" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="text-sm text-gray-600 mt-2">Loading Stripe...</p>
    </div>

    <div v-else>
      <div id="payment-element" class="mb-4"></div>
      
      <div v-if="error" class="p-3 bg-red-50 rounded text-sm text-red-800 mb-4">
        {{ error }}
      </div>

      <button 
        @click="handleSubmit" 
        :disabled="processing || !stripe || !elements"
        class="btn-primary w-full"
      >
        {{ processing ? 'Processing...' : `Pay $${amount.toFixed(2)}` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  amount: number
  publishableKey: string
  customerEmail: string
}>()

const emit = defineEmits<{
  (e: 'success', paymentId: string): void
  (e: 'error', error: string): void
}>()

const { $apiFetch } = useNuxtApp()

const stripeLoaded = ref(false)
const processing = ref(false)
const error = ref<string | null>(null)

let stripe: any = null
let elements: any = null

const loadStripe = async () => {
  try {
    // Load Stripe.js
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.async = true
    
    await new Promise((resolve, reject) => {
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })

    // Initialize Stripe
    stripe = (window as any).Stripe(props.publishableKey)

    // Create payment intent on backend
    const response = await $apiFetch<any>('/payments/stripe/create-intent', {
      method: 'POST',
      body: {
        amount: Math.round(props.amount * 100), // Convert to cents
        currency: 'usd',
        customer_email: props.customerEmail
      }
    })

    if (!response?.client_secret) {
      throw new Error('Failed to create payment intent')
    }

    // Create Elements instance
    elements = stripe.elements({
      clientSecret: response.client_secret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#2563eb',
        }
      }
    })

    // Create and mount Payment Element
    const paymentElement = elements.create('payment')
    paymentElement.mount('#payment-element')

    stripeLoaded.value = true
  } catch (err: any) {
    console.error('Error loading Stripe:', err)
    const msg = err?.message ?? 'Failed to load payment form'
    error.value = msg
    emit('error', msg)
  }
}

const handleSubmit = async () => {
  if (!stripe || !elements) return

  processing.value = true
  error.value = null

  try {
    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/order-success',
      },
      redirect: 'if_required'
    })

    if (submitError) {
      error.value = submitError.message
      if (error.value) {
        emit('error', error.value)
      }
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      emit('success', paymentIntent.id)
    }
  } catch (err: any) {
    console.error('Payment error:', err)
    error.value = err.message || 'Payment failed'
    if (error.value) {
      emit('error', error.value)
    }
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  loadStripe()
})

onBeforeUnmount(() => {
  if (elements) {
    elements = null
  }
  if (stripe) {
    stripe = null
  }
})
</script>

<style scoped>
#payment-element {
  margin-bottom: 1rem;
}
</style>