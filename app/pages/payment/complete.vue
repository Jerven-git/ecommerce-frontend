<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">

    <!-- Error State -->
    <Transition name="card-pop" appear>
      <div v-if="error" class="max-w-md w-full">
        <div class="bg-white rounded-2xl border border-red-100 shadow-xl p-10 text-center" role="alert">

          <!-- Error icon with shake -->
          <div class="relative flex items-center justify-center mx-auto mb-6 w-20 h-20">
            <div class="absolute inset-0 rounded-full bg-red-50 animate-ping-slow opacity-60"></div>
            <div class="relative z-10 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <Icon name="heroicons:x-mark" class="w-8 h-8 text-red-500 animate-shake" aria-hidden="true" />
            </div>
          </div>

          <h2 class="text-xl font-bold text-gray-900 mb-2">
            {{ requiresRefund ? 'Refund Required' : 'Payment Failed' }}
          </h2>
          <p class="text-sm text-red-600 mb-8 leading-relaxed">{{ error }}</p>

          <NuxtLink
            :to="requiresRefund ? '/' : '/checkout'"
            class="inline-flex items-center gap-2 btn-primary"
          >
            <Icon name="heroicons:arrow-left" class="w-4 h-4" aria-hidden="true" />
            {{ requiresRefund ? 'Return to Store' : 'Try Again' }}
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Processing State -->
    <Transition name="card-pop" appear>
      <div v-if="!error" class="max-w-md w-full">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-xl p-10 text-center overflow-hidden relative">

          <!-- Background glow -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary-500/5 blur-3xl animate-pulse"></div>
          </div>

          <!-- Orbit rings + icon -->
          <div class="relative flex items-center justify-center mx-auto mb-8 w-28 h-28">

            <!-- Outermost ring -->
            <div class="absolute inset-0 rounded-full border border-primary-200/60 animate-spin-very-slow"></div>
            <!-- Orbiting dot on outer ring -->
            <div class="absolute inset-0 animate-spin-very-slow">
              <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary-400 shadow-md shadow-primary-300"></div>
            </div>

            <!-- Middle ring -->
            <div class="absolute inset-3 rounded-full border border-primary-200/70 animate-spin-slow-reverse"></div>
            <!-- Orbiting dot on middle ring -->
            <div class="absolute inset-3 animate-spin-slow-reverse">
              <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary-400 shadow-sm shadow-primary-300"></div>
            </div>

            <!-- Inner pulse ring -->
            <div class="absolute inset-6 rounded-full bg-primary-50 animate-ping-slow opacity-70"></div>

            <!-- Icon container -->
            <div class="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
              <Icon name="heroicons:shield-check" class="w-7 h-7 text-white animate-pulse-subtle" aria-hidden="true" />
            </div>
          </div>

          <!-- Text -->
          <h2 class="text-xl font-bold text-gray-900 mb-2">Confirming Payment</h2>
          <p class="text-sm text-gray-500 mb-8 leading-relaxed">
            Please wait while we verify your transaction.<br />
            <span class="text-gray-400">This usually takes a few seconds.</span>
          </p>

          <!-- Animated dots progress bar -->
          <div class="flex items-center justify-center gap-2 mb-8">
            <div class="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style="animation-delay: 0ms;"></div>
            <div class="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style="animation-delay: 150ms;"></div>
            <div class="w-2 h-2 rounded-full bg-primary-300 animate-bounce" style="animation-delay: 300ms;"></div>
          </div>

          <!-- Progress track -->
          <div class="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 rounded-full animate-progress-slide"></div>
          </div>

          <!-- Footer note -->
          <p class="text-xs text-gray-400 mt-5">Do not close or refresh this page.</p>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import {
  forgetPaymentAccess,
  paymentAccessTokenFor,
  rememberPaymentAccess,
} from '~/utils/paymentAccess'

const cartStore = useCartStore()
const { $apiFetch } = useNuxtApp()
const route = useRoute()

const error = ref<string | null>(null)
const isDone = ref(false)
const running = ref(false)
const requiresRefund = ref(false)

const paymentIdRef = ref<string>('')
const paymentTokenRef = ref<string>('')

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

function setPaymentAccess(id: unknown, paymentToken?: unknown) {
  const pid = normalizePaymentId(id)
  if (!pid) return
  paymentIdRef.value = pid
  paymentTokenRef.value = paymentAccessTokenFor(pid, paymentToken)
  rememberPaymentAccess(pid, paymentTokenRef.value)
}

async function pollUntilPaid(paymentId: string) {
  const started = Date.now()
  const timeoutMs = 45_000 // 45s window

  while (!isDone.value && Date.now() - started < timeoutMs) {
    try {
      const res = await $apiFetch<any>(`/payments/${paymentId}`, {
        method: 'GET',
        query: paymentTokenRef.value
          ? { payment_token: paymentTokenRef.value }
          : undefined,
      })
      const status = res?.status ?? res?.data?.status ?? null
      const orderStatus = res?.order_status ?? res?.data?.order_status ?? null

      if (orderStatus === 'failed_needs_refund') {
        requiresRefund.value = true
        error.value = 'Your payment was received, but the item became unavailable. The store can now review the order and arrange your refund. Please do not pay again.'
        return false
      }

      if (status === 'paid') return true
      if (status === 'failed') {
        error.value = 'Payment failed. Please try checkout again.'
        return false
      }
    } catch (err: any) {
      if (err?.status === 404 || err?.response?.status === 404) {
        error.value = 'This payment verification link is missing or invalid. Please return to checkout and try again.'
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
  requiresRefund.value = false

  try {
    // init paymentId from query/localStorage
    const q = route.query.payment_id
    const fromQuery = Array.isArray(q) ? q[0] : (q as string | undefined)
    const paymentId = normalizePaymentId(fromQuery || localStorage.getItem('last_payment_id') || '')
    const accessQuery = route.query.payment_token
    const accessFromQuery = Array.isArray(accessQuery) ? accessQuery[0] : accessQuery
    setPaymentAccess(paymentId, accessFromQuery)

    // PayPal: capture first
    if (token.value) {
      try {
        const cap = await $apiFetch<any>('/paypal/capture', {
          method: 'POST',
          body: { token: token.value },
        })

        setPaymentAccess(
          cap?.payment_id ?? cap?.data?.payment_id,
          cap?.payment_token ?? cap?.data?.payment_token ?? paymentTokenRef.value,
        )

        const capStatus = cap?.status ?? cap?.data?.status
        const capOrderStatus = cap?.order_status ?? cap?.data?.order_status
        if (capOrderStatus === 'failed_needs_refund') {
          requiresRefund.value = true
          error.value = 'Your payment was received, but the item became unavailable. The store can now review the order and arrange your refund. Please do not pay again.'
          return
        }

        if (capStatus === 'paid') {
          isDone.value = true
          cartStore.clearCart()
          forgetPaymentAccess(paymentIdRef.value)
          localStorage.removeItem('last_order_id')
          sessionStorage.setItem('order_completed', '1')
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

    const ok = await pollUntilPaid(paymentIdRef.value)

    if (!ok) {
      if (!error.value) {
        error.value = 'Payment is still finalizing. Please refresh in a moment.'
      }
      return
    }

    // success
    isDone.value = true
    cartStore.clearCart()
    forgetPaymentAccess(paymentIdRef.value)
    localStorage.removeItem('last_order_id')
    sessionStorage.setItem('order_completed', '1')
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

<style scoped>
/* ── Card entrance ── */
.card-pop-enter-active {
  animation: card-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes card-pop-in {
  from { opacity: 0; transform: scale(0.92) translateY(20px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}

/* ── Orbit rings ── */
.animate-spin-very-slow {
  animation: spin 8s linear infinite;
}
.animate-spin-slow-reverse {
  animation: spin 5s linear infinite reverse;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Slow ping ── */
.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes ping-slow {
  0%   { transform: scale(1);    opacity: 0.7; }
  70%  { transform: scale(1.5);  opacity: 0;   }
  100% { transform: scale(1.5);  opacity: 0;   }
}

/* ── Icon subtle pulse ── */
.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}
@keyframes pulse-subtle {
  0%, 100% { opacity: 1;    transform: scale(1);    }
  50%       { opacity: 0.8; transform: scale(0.95); }
}

/* ── Shake on error ── */
.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
}
@keyframes shake {
  0%, 100% { transform: translateX(0);    }
  15%       { transform: translateX(-6px); }
  30%       { transform: translateX(6px);  }
  45%       { transform: translateX(-4px); }
  60%       { transform: translateX(4px);  }
  75%       { transform: translateX(-2px); }
  90%       { transform: translateX(2px);  }
}

/* ── Progress shimmer ── */
.animate-progress-slide {
  animation: progress-slide 1.8s ease-in-out infinite;
  background-size: 200% 100%;
}
@keyframes progress-slide {
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(0%);    }
  100% { transform: translateX(100%);  }
}
</style>
