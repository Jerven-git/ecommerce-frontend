<template>
  <div class="pb-28">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium">Payment Settings</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Payment Settings</h1>
      <p class="text-gray-500 text-sm mt-1">Enable and configure payment methods for your store</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading payment settings…</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Load error -->
      <div v-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-5 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm text-red-700 pt-1">{{ error }}</p>
      </div>

      <!-- Payment Methods -->
      <section data-guide="payment-methods" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Payment Methods</p>
            <p class="text-xs text-gray-400">Toggle which payment options are available at checkout</p>
          </div>
        </div>

        <div class="divide-y divide-gray-100">
          <!-- Cash -->
          <div class="px-6 py-5">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">Cash Payment</p>
                  <p class="text-xs text-gray-400 mt-0.5">Accept cash on delivery or pickup</p>
                </div>
              </div>
              <button
                type="button"
                @click="form.cash_enabled = !form.cash_enabled"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="form.cash_enabled ? 'bg-primary-600' : 'bg-gray-200'"
                :aria-checked="form.cash_enabled"
                role="switch"
              >
                <span
                  class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                  :class="form.cash_enabled ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>

          <!-- Stripe -->
          <div class="px-6 py-5">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">Stripe</p>
                  <p class="text-xs text-gray-400 mt-0.5">Accept credit/debit cards via Stripe</p>
                </div>
              </div>
              <button
                type="button"
                @click="form.stripe_enabled = !form.stripe_enabled"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="form.stripe_enabled ? 'bg-primary-600' : 'bg-gray-200'"
                :aria-checked="form.stripe_enabled"
                role="switch"
              >
                <span
                  class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                  :class="form.stripe_enabled ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div v-if="form.stripe_enabled" class="mt-3 ml-[52px] px-3 py-2 bg-primary-50 rounded-lg">
                <p class="text-xs text-primary-700">
                  Set <code class="font-mono font-semibold">STRIPE_SECRET_KEY</code> in your server environment variables.
                </p>
              </div>
            </Transition>
          </div>

          <!-- PayPal -->
          <div class="px-6 py-5">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 01-.794.68H7.72a.483.483 0 01-.476-.558L8.926 9.306a.946.946 0 01.934-.807h2.094c4.066 0 6.826-1.676 7.69-6.51a5.47 5.47 0 00.05-.434.183.183 0 01.305-.142 3.994 3.994 0 011.645 2.32c.339.966.442 2.061.305 3.228z"/>
                    <path d="M8.926 9.306h2.094c4.066 0 6.826-1.676 7.69-6.51a5.47 5.47 0 00.05-.434.183.183 0 01.305-.142 3.994 3.994 0 011.645 2.32c.34.966.442 2.061.305 3.228.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 01-.794.68H7.72a.483.483 0 01-.476-.558L8.926 9.306z" opacity="0.7"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">PayPal</p>
                  <p class="text-xs text-gray-400 mt-0.5">Accept payments via PayPal</p>
                </div>
              </div>
              <button
                type="button"
                @click="form.paypal_enabled = !form.paypal_enabled"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="form.paypal_enabled ? 'bg-primary-600' : 'bg-gray-200'"
                :aria-checked="form.paypal_enabled"
                role="switch"
              >
                <span
                  class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                  :class="form.paypal_enabled ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div v-if="form.paypal_enabled" class="mt-3 ml-[52px] px-3 py-2 bg-primary-50 rounded-lg">
                <p class="text-xs text-primary-700">
                  Set <code class="font-mono font-semibold">PAYPAL_CLIENT_ID</code> in your server environment variables.
                </p>
              </div>
            </Transition>
          </div>

          <!-- Square -->
          <div class="px-6 py-5">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">Square</p>
                  <p class="text-xs text-gray-400 mt-0.5">Accept payments via Square</p>
                </div>
              </div>
              <button
                type="button"
                @click="form.square_enabled = !form.square_enabled"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="form.square_enabled ? 'bg-primary-600' : 'bg-gray-200'"
                :aria-checked="form.square_enabled"
                role="switch"
              >
                <span
                  class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                  :class="form.square_enabled ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div v-if="form.square_enabled" class="mt-3 ml-[52px] px-3 py-2 bg-gray-100 rounded-lg">
                <p class="text-xs text-gray-600">
                  Set <code class="font-mono font-semibold">SQUARE_ACCESS_TOKEN</code> in your server environment variables.
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </section>

      <!-- Security Notice -->
      <div data-guide="payment-security" class="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 mb-1">Security Notice</p>
            <p class="text-xs text-gray-500 leading-relaxed">
              Payment credentials are stored in server environment variables (<code class="font-mono">.env</code>) and are never exposed to the frontend or stored in the database.
              Use test/sandbox mode during development.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky footer -->
    <div class="fixed bottom-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md border-t border-gray-200">
      <div class="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <!-- Feedback -->
        <div class="flex items-center gap-2 min-w-0">
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="success" class="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Payment settings saved
            </div>
          </Transition>
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="saveError" class="flex items-center gap-1.5 text-red-500 text-sm font-medium truncate">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="truncate">{{ saveError }}</span>
            </div>
          </Transition>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <button @click="loadSettings" :disabled="saving" class="btn-secondary">Reset</button>
          <button
            @click="saveSettings"
            :disabled="saving"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { $apiFetch } = useNuxtApp()

const loading = ref(true)
const saving = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const saveError = ref<string | null>(null)

const form = ref({
  cash_enabled: true,

  stripe_enabled: false,

  paypal_enabled: false,

  square_enabled: false
})

const loadSettings = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<any>('/payment-settings', { method: 'GET' })

    if (response?.data) {
      form.value = {
        cash_enabled: response.data.cash_enabled ?? true,

        stripe_enabled: response.data.stripe_enabled ?? false,

        paypal_enabled: response.data.paypal_enabled ?? false,

        square_enabled: response.data.square_enabled ?? false
      }
    }
  } catch (err: any) {
    console.error('Error loading payment settings:', err)
    error.value = err?.data?.message || 'Failed to load payment settings'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  success.value = false
  saveError.value = null

  try {
    await $apiFetch('/payment-settings', {
      method: 'PATCH',
      body: form.value
    })

    success.value = true
    setTimeout(() => (success.value = false), 3000)

    await loadSettings()
  } catch (err: any) {
    console.error('Error saving payment settings:', err)
    saveError.value = err?.data?.message || 'Failed to save payment settings'
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>