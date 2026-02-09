<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <h1 class="text-2xl font-bold mb-2">Confirming payment…</h1>
      <p class="text-gray-600" v-if="!error">Please wait.</p>
      <p class="text-red-600" v-else>{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
const { $apiFetch } = useNuxtApp()
const route = useRoute()

const error = ref<string | null>(null)
const isDone = ref(false)
const running = ref(false)

const paymentId = computed(() => {
  const q = route.query.payment_id
  const fromQuery = Array.isArray(q) ? q[0] : (q as string | undefined)
  return fromQuery || localStorage.getItem('last_payment_id') || ''
})

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const getStatus = (res: any): string | null => {
  // Your backend returns status at root: { id, status, provider, order_id }
  if (typeof res?.status === 'string') return res.status

  // Some wrappers might wrap it: { data: { status } }
  if (typeof res?.data?.status === 'string') return res.data.status

  return null
}

const verifyAndFinish = async () => {
  if (running.value || isDone.value) return
  running.value = true
  error.value = null

  try {
    if (!paymentId.value) {
      error.value = 'Missing payment id.'
      return
    }

    // 15 tries with mild backoff (about ~25-30s total)
    for (let i = 0; i < 15; i++) {
      if (isDone.value) return

      try {
        const res = await $apiFetch<any>(`/payments/${paymentId.value}`, { method: 'GET' })
        const status = getStatus(res)

        if (status === 'paid') {
          isDone.value = true
          cartStore.clearCart()
          localStorage.removeItem('last_payment_id')
          localStorage.removeItem('last_order_id')
          await navigateTo('/order-success')
          return
        }

        // If status is something unexpected, still keep polling
      } catch (err: any) {
        // If backend returns 404, stop immediately (wrong id stored)
        if (err?.status === 404 || err?.response?.status === 404) {
          error.value = 'Payment record not found. Please try checkout again.'
          return
        }
        // ignore transient errors
      }

      // backoff: 1s, 1s, 1.5s, 2s, 2.5s...
      const wait = 1000 + i * 250
      await sleep(wait)
    }

    error.value = 'Payment is not confirmed yet. Please refresh in a moment.'
  } finally {
    running.value = false
  }
}

onMounted(verifyAndFinish)

// Stop polling if user navigates away
onBeforeRouteLeave(() => {
  isDone.value = true
})
</script>
