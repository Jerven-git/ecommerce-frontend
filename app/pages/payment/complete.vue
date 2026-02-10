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

const paymentIdRef = ref<string>('')

// read query params once
const token = computed(() => {
  const q = route.query.token
  return Array.isArray(q) ? q[0] : ((q as string) || '')
})

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function normalizePaymentId(v: unknown): string {
  if (!v) return ''
  return String(v).trim()
}

function setPaymentId(id: unknown) {
  const pid = normalizePaymentId(id)
  if (!pid) return
  paymentIdRef.value = pid
  localStorage.setItem('last_payment_id', pid)
}

async function pollUntilPaid(paymentId: string) {
  const started = Date.now()
  const timeoutMs = 45_000 // 45s window

  while (!isDone.value && Date.now() - started < timeoutMs) {
    try {
      const res = await $apiFetch<any>(`/payments/${paymentId}`, { method: 'GET' })
      const status = res?.status ?? res?.data?.status ?? null

      if (status === 'paid') return true
      if (status === 'failed') {
        error.value = 'Payment failed. Please try checkout again.'
        return false
      }
    } catch (err: any) {
      if (err?.status === 404 || err?.response?.status === 404) {
        error.value = 'Payment record not found. Please try checkout again.'
        return false
      }
      // ignore transient errors and continue polling
    }

    await sleep(1500)
  }

  return false
}

const verifyAndFinish = async () => {
  if (running.value || isDone.value) return
  running.value = true
  error.value = null

  try {
    // init paymentId from query/localStorage
    const q = route.query.payment_id
    const fromQuery = Array.isArray(q) ? q[0] : (q as string | undefined)
    setPaymentId(fromQuery || localStorage.getItem('last_payment_id') || '')

    // PayPal: capture first
    if (token.value) {
      try {
        const cap = await $apiFetch<any>('/paypal/capture', {
          method: 'POST',
          body: { token: token.value },
        })

        setPaymentId(cap?.payment_id ?? cap?.data?.payment_id)

        const capStatus = cap?.status ?? cap?.data?.status
        if (capStatus === 'paid') {
          isDone.value = true
          cartStore.clearCart()
          localStorage.removeItem('last_payment_id')
          localStorage.removeItem('last_order_id')
          await navigateTo('/order-success')
          return
        }
      } catch (e: any) {
        error.value = e?.data?.message || e?.message || 'PayPal capture failed.'
        return
      }
    }

    if (!paymentIdRef.value) {
      error.value = 'Missing payment id.'
      return
    }

    // fallback polling (short)
    const ok = await (async () => {
      for (let i = 0; i < 8; i++) {
        const ok = await pollUntilPaid(paymentIdRef.value)
        if (ok) return true
        await sleep(1500)
      }
      return false
    })()

    if (!ok) {
      error.value = 'Payment is still finalizing. Please refresh in a moment.'
      return
    }

    // success
    isDone.value = true
    cartStore.clearCart()
    localStorage.removeItem('last_payment_id')
    localStorage.removeItem('last_order_id')
    await navigateTo('/order-success')
  } finally {
    running.value = false
  }
}

onMounted(verifyAndFinish)

onBeforeRouteLeave(() => {
  isDone.value = true
})
</script>
