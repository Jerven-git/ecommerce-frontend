<template>
  <div class="pb-28">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium">Tax Settings</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Tax Settings</h1>
      <p class="text-gray-500 text-sm mt-1">Configure how tax is calculated and displayed for your store</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading tax settings…</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Tax Configuration -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Tax Configuration</p>
            <p class="text-xs text-gray-400">Control tax calculation and display behaviour</p>
          </div>
        </div>

        <div class="px-6 py-5 space-y-6">
          <!-- Enable Tax toggle -->
          <div class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-medium text-gray-900">Enable Tax</p>
              <p class="text-xs text-gray-400 mt-0.5">Turn on tax calculation for all products</p>
            </div>
            <button
              type="button"
              @click="form.tax_enabled = !form.tax_enabled"
              class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              :class="form.tax_enabled ? 'bg-primary-600' : 'bg-gray-200'"
              :aria-checked="form.tax_enabled"
              role="switch"
            >
              <span
                class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                :class="form.tax_enabled ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>

          <template v-if="form.tax_enabled">
            <!-- Tax Rate -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tax Rate</label>
              <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent max-w-xs">
                <input
                  v-model.number="form.tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  class="flex-1 px-3 py-2 text-sm outline-none bg-white"
                  placeholder="0.00"
                />
                <span class="px-3 flex items-center bg-gray-50 border-l border-gray-300 text-gray-500 text-sm select-none">%</span>
              </div>
              <p class="text-xs text-gray-400 mt-1.5">e.g., enter 12 for 12% VAT</p>
            </div>

            <!-- Tax Display Mode -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tax Display Mode</label>
              <p class="text-xs text-gray-400 mb-3 -mt-2">Choose how tax is shown to customers in the cart and checkout</p>

              <div class="space-y-2.5">
                <!-- Inclusive -->
                <button
                  type="button"
                  @click="form.tax_display_mode = 'inclusive'"
                  class="w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-colors"
                  :class="form.tax_display_mode === 'inclusive' ? 'border-primary-500 bg-primary-50/60' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'"
                >
                  <span
                    class="mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                    :class="form.tax_display_mode === 'inclusive' ? 'border-primary-600 bg-primary-600' : 'border-gray-300'"
                  >
                    <span v-if="form.tax_display_mode === 'inclusive'" class="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900">Tax Inclusive</p>
                    <p class="text-xs text-gray-500 mt-0.5">Tax is already included in the displayed price</p>
                    <div class="mt-2.5 p-3 bg-white rounded-lg border border-gray-100 text-xs space-y-0.5">
                      <p class="text-gray-500 font-medium mb-1">Example</p>
                      <p class="text-gray-700">Product price: <span class="font-semibold">$112.00</span></p>
                      <p class="text-gray-400">Includes $12.00 {{ form.tax_name }} ({{ form.tax_rate }}%)</p>
                    </div>
                  </div>
                </button>

                <!-- Exclusive -->
                <button
                  type="button"
                  @click="form.tax_display_mode = 'exclusive'"
                  class="w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-colors"
                  :class="form.tax_display_mode === 'exclusive' ? 'border-primary-500 bg-primary-50/60' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'"
                >
                  <span
                    class="mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                    :class="form.tax_display_mode === 'exclusive' ? 'border-primary-600 bg-primary-600' : 'border-gray-300'"
                  >
                    <span v-if="form.tax_display_mode === 'exclusive'" class="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900">Tax Exclusive</p>
                    <p class="text-xs text-gray-500 mt-0.5">Tax is added separately at checkout</p>
                    <div class="mt-2.5 p-3 bg-white rounded-lg border border-gray-100 text-xs space-y-0.5">
                      <p class="text-gray-500 font-medium mb-1">Example</p>
                      <p class="text-gray-700">Product price: <span class="font-semibold">$100.00</span></p>
                      <p class="text-gray-700">{{ form.tax_name }} ({{ form.tax_rate }}%): <span class="font-semibold">+ $12.00</span></p>
                      <p class="text-gray-700 font-semibold pt-1 mt-0.5 border-t border-gray-100">Total: $112.00</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Tax Name -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tax Label</label>
              <input
                v-model="form.tax_name"
                type="text"
                class="input-field max-w-xs"
                placeholder="VAT, GST, Sales Tax…"
              />
              <p class="text-xs text-gray-400 mt-1.5">Displayed to customers, e.g. "VAT 12%"</p>
            </div>
          </template>
        </div>
      </section>

      <!-- Tax Calculation Preview -->
      <section v-if="form.tax_enabled" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Calculation Preview</p>
            <p class="text-xs text-gray-400">Live preview with your current settings</p>
          </div>
        </div>

        <div class="px-6 py-5">
          <div class="mb-4">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sample Product Price</label>
            <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent max-w-xs">
              <span class="px-3 flex items-center bg-gray-50 border-r border-gray-300 text-gray-500 text-sm select-none">$</span>
              <input
                v-model.number="previewPrice"
                type="number"
                step="0.01"
                min="0"
                class="flex-1 px-3 py-2 text-sm outline-none bg-white"
                placeholder="100.00"
              />
            </div>
          </div>

          <!-- Preview result -->
          <div class="bg-gray-50 rounded-xl p-4 space-y-2">
            <template v-if="form.tax_display_mode === 'inclusive'">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Price shown to customer</span>
                <span class="text-sm font-bold text-gray-900">${{ calculateInclusivePrice.toFixed(2) }}</span>
              </div>
              <p class="text-xs text-gray-400">
                Includes ${{ calculateTaxAmount.toFixed(2) }} {{ form.tax_name }} at {{ form.tax_rate }}%
              </p>
            </template>
            <template v-else>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Base price</span>
                <span class="text-sm text-gray-700">${{ previewPrice.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">{{ form.tax_name }} ({{ form.tax_rate }}%)</span>
                <span class="text-sm text-gray-700">+ ${{ calculateTaxAmount.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between pt-2 mt-1 border-t border-gray-200">
                <span class="text-sm font-semibold text-gray-900">Total</span>
                <span class="text-sm font-bold text-gray-900">${{ calculateInclusivePrice.toFixed(2) }}</span>
              </div>
            </template>
          </div>
        </div>
      </section>
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
              Tax settings saved
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
const previewPrice = ref(100)

const form = ref({
  tax_enabled: false,
  tax_rate: 0,
  tax_display_mode: 'exclusive' as 'inclusive' | 'exclusive',
  tax_name: 'VAT'
})

const calculateTaxAmount = computed(() => {
  if (!form.value.tax_enabled) return 0
  
  if (form.value.tax_display_mode === 'inclusive') {
    return previewPrice.value - (previewPrice.value / (1 + form.value.tax_rate / 100))
  } else {
    return previewPrice.value * (form.value.tax_rate / 100)
  }
})

const calculateInclusivePrice = computed(() => {
  if (!form.value.tax_enabled) return previewPrice.value
  
  if (form.value.tax_display_mode === 'inclusive') {
    return previewPrice.value
  } else {
    return previewPrice.value + calculateTaxAmount.value
  }
})

const loadSettings = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<any>('/tax-settings', {
      method: 'GET'
    })

    if (response?.data) {
      form.value = {
        tax_enabled: response.data.tax_enabled || false,
        tax_rate: response.data.tax_rate || 0,
        tax_display_mode: response.data.tax_display_mode || 'exclusive',
        tax_name: response.data.tax_name || 'VAT'
      }
    }
  } catch (err: any) {
    console.error('Error loading tax settings:', err)
    error.value = err?.data?.message || 'Failed to load tax settings'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  success.value = false
  saveError.value = null

  try {
    await $apiFetch('/tax-settings', {
      method: 'PATCH',
      body: form.value
    })

    success.value = true

    setTimeout(() => {
      success.value = false
    }, 3000)

    await loadSettings()
  } catch (err: any) {
    console.error('Error saving tax settings:', err)
    saveError.value = err?.data?.message || 'Failed to save tax settings'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>