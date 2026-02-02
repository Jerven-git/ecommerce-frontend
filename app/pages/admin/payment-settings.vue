<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">← Dashboard</NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Payment Settings</h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="space-y-6">
        <!-- Load error (optional) -->
        <div v-if="error" class="card bg-red-50 border-red-200">
          <p class="text-red-800 font-medium">{{ error }}</p>
        </div>

        <!-- Cash -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold">Cash Payment</h2>
              <p class="text-gray-600 text-sm">Accept cash on delivery or pickup</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="form.cash_enabled" type="checkbox" class="sr-only peer">
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer
                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
                after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>
        </div>

        <!-- Stripe -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg class="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold">Stripe</h2>
                <p class="text-gray-600 text-sm">Accept credit/debit cards via Stripe</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="form.stripe_enabled" type="checkbox" class="sr-only peer">
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer
                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
                after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>

          <div v-if="form.stripe_enabled" class="pt-4 border-t">
            <p class="text-xs text-gray-500">
              Configure Stripe keys in your server environment variables (e.g. <span class="font-mono">STRIPE_SECRET_KEY</span>).
            </p>
          </div>
        </div>

        <!-- PayPal -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 01-.794.68H7.72a.483.483 0 01-.476-.558L8.926 9.306a.946.946 0 01.934-.807h2.094c4.066 0 6.826-1.676 7.69-6.51a5.47 5.47 0 00.05-.434.183.183 0 01.305-.142 3.994 3.994 0 011.645 2.32c.339.966.442 2.061.305 3.228z"/>
                  <path d="M8.926 9.306h2.094c4.066 0 6.826-1.676 7.69-6.51a5.47 5.47 0 00.05-.434.183.183 0 01.305-.142 3.994 3.994 0 011.645 2.32c.34.966.442 2.061.305 3.228.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 01-.794.68H7.72a.483.483 0 01-.476-.558L8.926 9.306z" opacity="0.7"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold">PayPal</h2>
                <p class="text-gray-600 text-sm">Accept payments via PayPal</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="form.paypal_enabled" type="checkbox" class="sr-only peer">
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer
                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
                after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>

          <div v-if="form.paypal_enabled" class="pt-4 border-t">
            <p class="text-xs text-gray-500">
              Configure PayPal credentials in the server environment variables (e.g. <span class="font-mono">PAYPAL_CLIENT_ID</span>).
            </p>
          </div>
        </div>

        <!-- Square -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold">Square</h2>
                <p class="text-gray-600 text-sm">Accept payments via Square</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="form.square_enabled" type="checkbox" class="sr-only peer">
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer
                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
                after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>

          <div v-if="form.square_enabled" class="pt-4 border-t">
            <p class="text-xs text-gray-500">
              Configure Square credentials in the server environment variables (e.g. <span class="font-mono">SQUARE_ACCESS_TOKEN</span>).
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <button @click="loadSettings" class="btn-secondary">Reset</button>
          <button @click="saveSettings" class="btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

        <div v-if="success" class="card bg-green-50 border-green-200">
          <p class="text-green-800 font-medium">✓ Payment settings saved successfully!</p>
        </div>

        <div v-if="saveError" class="card bg-red-50 border-red-200">
          <p class="text-red-800 font-medium">{{ saveError }}</p>
        </div>

        <!-- Updated Security Notice -->
        <div class="card bg-yellow-50 border-yellow-200">
          <div class="flex">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="text-sm text-yellow-800">
              <p class="font-semibold mb-1">Security Notice</p>
              <p>
                Payment credentials are stored in server environment variables (.env) and are never exposed to the frontend or stored in the database.
                Use test/sandbox mode during development.
              </p>
            </div>
          </div>
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