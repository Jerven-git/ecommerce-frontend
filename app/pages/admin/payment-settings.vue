<template>
  <div class="pb-28">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium">Payment Settings</span>
      </div>
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
        <div class="divide-y divide-gray-100">
          <!-- Cash -->
          <div class="px-6 py-5">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Icon name="mdi:cash" class="w-5 h-5 text-green-600" />
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
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background-color:#635BFF">
                  <Icon name="simple-icons:stripe" class="w-5 h-5 text-white" />
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
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background-color:#003087">
                  <Icon name="simple-icons:paypal" class="w-5 h-5 text-white" />
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
                <div class="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                  <Icon name="simple-icons:square" class="w-5 h-5 text-white" />
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

    <AdminSettingsSaveFooter
      :saving="saving"
      @save="saveSettings"
      @reset="loadSettings"
    />

    <AdminToast />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { $apiFetch } = useNuxtApp()

const { showToast } = useAdminToast()

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

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

  try {
    await $apiFetch('/payment-settings', {
      method: 'PATCH',
      body: form.value
    })

    showToast('Payment settings saved', 'success')
    await loadSettings()
  } catch (err: any) {
    console.error('Error saving payment settings:', err)
    showToast(err?.data?.message || 'Failed to save payment settings', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>