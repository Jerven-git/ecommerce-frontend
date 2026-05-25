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
              <button type="button" @click="form.cash_enabled = !form.cash_enabled" class="payment-toggle" :class="form.cash_enabled ? 'bg-primary-600' : 'bg-gray-200'" :aria-checked="form.cash_enabled" role="switch">
                <span class="payment-toggle-knob" :class="form.cash_enabled ? 'translate-x-6' : 'translate-x-1'"></span>
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
              <button type="button" @click="form.stripe_enabled = !form.stripe_enabled" class="payment-toggle" :class="form.stripe_enabled ? 'bg-primary-600' : 'bg-gray-200'" :aria-checked="form.stripe_enabled" role="switch">
                <span class="payment-toggle-knob" :class="form.stripe_enabled ? 'translate-x-6' : 'translate-x-1'"></span>
              </button>
            </div>
            <Transition v-bind="expandTransition">
              <div v-if="form.stripe_enabled" class="mt-4 ml-[52px] space-y-4">
                <div>
                  <label class="payment-label">Publishable key</label>
                  <input v-model="form.stripe_publishable_key" type="text" class="payment-input" placeholder="pk_live_…" autocomplete="off" />
                </div>
                <div>
                  <label class="payment-label">Secret key <CredentialBadge :configured="configured.stripe_secret_key" /></label>
                  <input v-model="form.stripe_secret_key" type="password" class="payment-input" :placeholder="secretPlaceholder(configured.stripe_secret_key)" autocomplete="off" />
                </div>
                <div>
                  <label class="payment-label">Webhook signing secret <CredentialBadge :configured="configured.stripe_webhook_secret" /></label>
                  <input v-model="form.stripe_webhook_secret" type="password" class="payment-input" :placeholder="secretPlaceholder(configured.stripe_webhook_secret)" autocomplete="off" />
                </div>
                <WebhookUrlField :url="webhookUrls.stripe" />
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
              <button type="button" @click="form.paypal_enabled = !form.paypal_enabled" class="payment-toggle" :class="form.paypal_enabled ? 'bg-primary-600' : 'bg-gray-200'" :aria-checked="form.paypal_enabled" role="switch">
                <span class="payment-toggle-knob" :class="form.paypal_enabled ? 'translate-x-6' : 'translate-x-1'"></span>
              </button>
            </div>
            <Transition v-bind="expandTransition">
              <div v-if="form.paypal_enabled" class="mt-4 ml-[52px] space-y-4">
                <div>
                  <label class="payment-label">Mode</label>
                  <select v-model="form.paypal_mode" class="payment-input">
                    <option value="sandbox">Sandbox (test)</option>
                    <option value="live">Live</option>
                  </select>
                </div>
                <div>
                  <label class="payment-label">Client ID</label>
                  <input v-model="form.paypal_client_id" type="text" class="payment-input" placeholder="AY…" autocomplete="off" />
                </div>
                <div>
                  <label class="payment-label">Secret <CredentialBadge :configured="configured.paypal_secret" /></label>
                  <input v-model="form.paypal_secret" type="password" class="payment-input" :placeholder="secretPlaceholder(configured.paypal_secret)" autocomplete="off" />
                </div>
                <div>
                  <label class="payment-label">Webhook ID</label>
                  <input v-model="form.paypal_webhook_id" type="text" class="payment-input" placeholder="WH-…" autocomplete="off" />
                </div>
                <WebhookUrlField :url="webhookUrls.paypal" />
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
              <button type="button" @click="form.square_enabled = !form.square_enabled" class="payment-toggle" :class="form.square_enabled ? 'bg-primary-600' : 'bg-gray-200'" :aria-checked="form.square_enabled" role="switch">
                <span class="payment-toggle-knob" :class="form.square_enabled ? 'translate-x-6' : 'translate-x-1'"></span>
              </button>
            </div>
            <Transition v-bind="expandTransition">
              <div v-if="form.square_enabled" class="mt-4 ml-[52px] space-y-4">
                <div>
                  <label class="payment-label">Mode</label>
                  <select v-model="form.square_mode" class="payment-input">
                    <option value="sandbox">Sandbox (test)</option>
                    <option value="live">Live</option>
                  </select>
                </div>
                <div>
                  <label class="payment-label">Application ID</label>
                  <input v-model="form.square_application_id" type="text" class="payment-input" placeholder="sq0idp-…" autocomplete="off" />
                </div>
                <div>
                  <label class="payment-label">Location ID</label>
                  <input v-model="form.square_location_id" type="text" class="payment-input" placeholder="L…" autocomplete="off" />
                </div>
                <div>
                  <label class="payment-label">Access token <CredentialBadge :configured="configured.square_access_token" /></label>
                  <input v-model="form.square_access_token" type="password" class="payment-input" :placeholder="secretPlaceholder(configured.square_access_token)" autocomplete="off" />
                </div>
                <div>
                  <label class="payment-label">Webhook signature key <CredentialBadge :configured="configured.square_webhook_secret" /></label>
                  <input v-model="form.square_webhook_secret" type="password" class="payment-input" :placeholder="secretPlaceholder(configured.square_webhook_secret)" autocomplete="off" />
                </div>
                <WebhookUrlField :url="webhookUrls.square" />
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
              Secret keys are encrypted before they are stored and are never sent back to the browser — saved secrets show only as “Configured”. Leave a secret field blank to keep the current value. Use Sandbox/test mode while setting up.
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

const expandTransition = {
  enterActiveClass: 'transition duration-150 ease-out',
  enterFromClass: 'opacity-0 -translate-y-1',
  enterToClass: 'opacity-100 translate-y-0',
  leaveActiveClass: 'transition duration-100 ease-in',
  leaveFromClass: 'opacity-100',
  leaveToClass: 'opacity-0',
}

const blankForm = () => ({
  cash_enabled: true,
  stripe_enabled: false,
  paypal_enabled: false,
  square_enabled: false,

  stripe_publishable_key: '',
  stripe_secret_key: '',
  stripe_webhook_secret: '',

  paypal_client_id: '',
  paypal_secret: '',
  paypal_mode: 'sandbox',
  paypal_webhook_id: '',

  square_application_id: '',
  square_access_token: '',
  square_location_id: '',
  square_webhook_secret: '',
  square_mode: 'sandbox',
})

const form = ref(blankForm())

// Whether each secret already has a value stored (the value itself is never sent
// to the browser). Drives the "Configured" badge + placeholder.
const configured = ref({
  stripe_secret_key: false,
  stripe_webhook_secret: false,
  paypal_secret: false,
  square_access_token: false,
  square_webhook_secret: false,
})

const webhookUrls = ref<{ stripe?: string; paypal?: string; square?: string }>({})

const secretPlaceholder = (isConfigured: boolean) =>
  isConfigured ? 'Configured — leave blank to keep' : 'Not set'

const loadSettings = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<any>('/payment-settings', { method: 'GET' })
    webhookUrls.value = response?.webhook_urls ?? {}
    const data = response?.data
    if (data) {
      form.value = {
        ...blankForm(),
        cash_enabled: data.cash_enabled ?? true,
        stripe_enabled: data.stripe_enabled ?? false,
        paypal_enabled: data.paypal_enabled ?? false,
        square_enabled: data.square_enabled ?? false,
        // Public identifiers are returned and prefilled; secrets stay blank.
        stripe_publishable_key: data.stripe_publishable_key ?? '',
        paypal_client_id: data.paypal_client_id ?? '',
        paypal_mode: data.paypal_mode ?? 'sandbox',
        paypal_webhook_id: data.paypal_webhook_id ?? '',
        square_application_id: data.square_application_id ?? '',
        square_location_id: data.square_location_id ?? '',
        square_mode: data.square_mode ?? 'sandbox',
      }
      configured.value = {
        stripe_secret_key: !!data.stripe_secret_key_configured,
        stripe_webhook_secret: !!data.stripe_webhook_secret_configured,
        paypal_secret: !!data.paypal_secret_configured,
        square_access_token: !!data.square_access_token_configured,
        square_webhook_secret: !!data.square_webhook_secret_configured,
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
    // Send the whole form; the backend leaves blank credential fields unchanged,
    // so empty secret inputs never wipe a stored secret.
    await $apiFetch('/payment-settings', {
      method: 'PATCH',
      body: form.value,
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

<style scoped>
.payment-toggle {
  @apply relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}
.payment-toggle-knob {
  @apply inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform;
}
.payment-label {
  @apply flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5;
}
.payment-input {
  @apply w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}
</style>
