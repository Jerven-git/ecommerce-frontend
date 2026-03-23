<template>
  <div class="paypal-payment">
    <div v-if="!paypalLoaded" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p class="text-sm text-gray-600 mt-2">Loading PayPal...</p>
    </div>

    <div v-else>
      <div id="paypal-button-container" class="mb-4"></div>
      
      <div v-if="error" class="p-3 bg-red-50 rounded text-sm text-red-800 mb-4">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  amount: number
  clientId: string
  currency?: string
}>()

const emit = defineEmits<{
  (e: 'success', paymentId: string): void
  (e: 'error', error: string): void
}>()

const { $apiFetch } = useNuxtApp()

const paypalLoaded = ref(false)
const error = ref<string | null>(null)

const loadPayPal = async () => {
  try {
    // Load PayPal SDK
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${props.clientId}&currency=${props.currency || 'USD'}`
    script.async = true
    
    await new Promise((resolve, reject) => {
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })

    // Wait for PayPal to be available
    await new Promise((resolve) => {
      const checkPayPal = setInterval(() => {
        if ((window as any).paypal) {
          clearInterval(checkPayPal)
          resolve(true)
        }
      }, 100)
    })

    // Render PayPal buttons
    const paypal = (window as any).paypal

    paypal.Buttons({
      createOrder: async () => {
        try {
          const response = await $apiFetch<any>('/payments/paypal/create-order', {
            method: 'POST',
            body: {
              amount: props.amount,
              currency: props.currency || 'USD'
            }
          })

          if (!response?.order_id) {
            throw new Error('Failed to create PayPal order')
          }

          return response.order_id
        } catch (err: any) {
          console.error('Error creating PayPal order:', err)
          error.value = err.message || 'Failed to create order'
          throw err
        }
      },
      onApprove: async (data: any) => {
        try {
          const response = await $apiFetch<any>('/payments/paypal/capture-order', {
            method: 'POST',
            body: { order_id: data.orderID }
          })

          if (response?.status === 'COMPLETED') {
            emit('success', data.orderID)
          } else {
            throw new Error('Payment not completed')
          }
        } catch (err: any) {
          console.error('Error capturing PayPal order:', err)
          const msg = err?.message ?? 'Failed to complete payment'
          error.value = msg
          emit('error', msg)
        }
      },

      onError: (err: any) => {
        console.error('PayPal error:', err)
        const msg = 'PayPal payment failed'
        error.value = msg
        emit('error', msg)
      },
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      }
    }).render('#paypal-button-container')

    paypalLoaded.value = true
  } catch (err: any) {
    console.error('Error loading PayPal:', err)
    const msg = err?.message ?? 'Failed to load PayPal'
    error.value = msg
    emit('error', msg)
  }
}

onMounted(() => {
  loadPayPal()
})
</script>

<style scoped>
#paypal-button-container {
  min-height: 150px;
}
</style>