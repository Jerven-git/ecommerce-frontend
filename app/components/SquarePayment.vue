<template>
  <div class="square-payment">
    <div v-if="!squareLoaded" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="text-sm text-gray-600 mt-2">Loading Square...</p>
    </div>

    <div v-else>
      <div id="card-container" class="mb-4"></div>
      
      <div v-if="error" class="p-3 bg-red-50 rounded text-sm text-red-800 mb-4">
        {{ error }}
      </div>

      <button 
        @click="handleSubmit" 
        :disabled="processing"
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
  applicationId: string
  locationId: string
}>()

const emit = defineEmits<{
  (e: 'success', paymentId: string): void
  (e: 'error', error: string): void
}>()

const { $apiFetch } = useNuxtApp()

const squareLoaded = ref(false)
const processing = ref(false)
const error = ref<string | null>(null)

let payments: any = null
let card: any = null

const loadSquare = async () => {
  try {
    // Load Square SDK
    const script = document.createElement('script')
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'
    script.async = true
    
    await new Promise((resolve, reject) => {
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })

    // Wait for Square to be available
    await new Promise((resolve) => {
      const checkSquare = setInterval(() => {
        if ((window as any).Square) {
          clearInterval(checkSquare)
          resolve(true)
        }
      }, 100)
    })

    // Initialize Square Payments
    const Square = (window as any).Square
    payments = Square.payments(props.applicationId, props.locationId)

    // Initialize Card
    card = await payments.card()
    await card.attach('#card-container')

    squareLoaded.value = true
  } catch (err: any) {
    const msg = err?.message ?? 'Failed to load payment form'
    error.value = msg
    emit('error', msg)
  }
}

const handleSubmit = async () => {
  if (!card) return

  processing.value = true
  error.value = null

  try {
    // Tokenize card
    const result = await card.tokenize()
    
    if (result.status === 'OK') {
      // Send token to backend for payment processing
      const response = await $apiFetch<any>('/payments/square/process', {
        method: 'POST',
        body: {
          source_id: result.token,
          amount: Math.round(props.amount * 100), // Convert to cents
          currency: 'USD',
          location_id: props.locationId
        }
      })

      if (response?.payment?.id) {
        emit('success', response.payment.id)
      } else {
        throw new Error('Payment failed')
      }
    } else {
      const errorMessage = result.errors?.map((e: any) => e.message).join(', ') || 'Card validation failed'
      error.value = errorMessage
      emit('error', errorMessage)
    }
  } catch (err: any) {
    const msg = err?.message ?? 'Payment failed'
    error.value = msg
    emit('error', msg)
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  loadSquare()
})

onBeforeUnmount(() => {
  if (card) {
    card.destroy()
    card = null
  }
})
</script>

<style scoped>
#card-container {
  min-height: 100px;
}
</style>