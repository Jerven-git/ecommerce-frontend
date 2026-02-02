<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">← Dashboard</NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Tax Settings</h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="space-y-6">
        <!-- Tax Configuration -->
        <div class="card">
          <h2 class="text-xl font-bold mb-6">Tax Configuration</h2>
          <p class="text-gray-600 mb-6">Configure how tax is calculated and displayed for your products.</p>

          <div class="space-y-6">
            <!-- Enable Tax -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 class="font-semibold text-lg">Enable Tax</h3>
                <p class="text-sm text-gray-600">Turn on tax calculation for all products</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  v-model="form.tax_enabled" 
                  type="checkbox" 
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Tax Rate -->
            <div v-if="form.tax_enabled">
              <label class="block text-gray-700 font-medium mb-2">Tax Rate (%)</label>
              <div class="relative max-w-xs">
                <input 
                  v-model.number="form.tax_rate" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="100" 
                  class="input-field pr-8" 
                  placeholder="0.00"
                  :disabled="!form.tax_enabled"
                >
                <span class="absolute right-3 top-3 text-gray-500">%</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">Enter the tax percentage (e.g., 12 for 12% VAT)</p>
            </div>

            <!-- Tax Display Mode -->
            <div v-if="form.tax_enabled" class="space-y-4">
              <div>
                <h3 class="font-semibold mb-3">Tax Display Mode</h3>
                <p class="text-sm text-gray-600 mb-4">Choose how tax is displayed to customers in the cart and checkout.</p>
              </div>

              <div class="space-y-3">
                <label class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors" :class="form.tax_display_mode === 'inclusive' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
                  <input 
                    v-model="form.tax_display_mode" 
                    type="radio" 
                    value="inclusive" 
                    class="mt-1 h-4 w-4 text-blue-600"
                  >
                  <div class="ml-3 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-semibold">Tax Inclusive</span>
                      <span v-if="form.tax_display_mode === 'inclusive'" class="text-xs bg-blue-600 text-white px-2 py-1 rounded">Selected</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">Tax is included in the displayed price</p>
                    <div class="mt-2 p-3 bg-white rounded border text-sm">
                      <p class="font-medium text-gray-700 mb-1">Example:</p>
                      <p class="text-gray-600">Product price: <span class="font-semibold">$112.00</span></p>
                      <p class="text-xs text-gray-500 mt-1">This includes $12.00 tax ({{ form.tax_rate }}% of $100.00)</p>
                    </div>
                  </div>
                </label>

                <label class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors" :class="form.tax_display_mode === 'exclusive' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
                  <input 
                    v-model="form.tax_display_mode" 
                    type="radio" 
                    value="exclusive" 
                    class="mt-1 h-4 w-4 text-blue-600"
                  >
                  <div class="ml-3 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-semibold">Tax Exclusive</span>
                      <span v-if="form.tax_display_mode === 'exclusive'" class="text-xs bg-blue-600 text-white px-2 py-1 rounded">Selected</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">Tax is added separately at checkout</p>
                    <div class="mt-2 p-3 bg-white rounded border text-sm">
                      <p class="font-medium text-gray-700 mb-1">Example:</p>
                      <p class="text-gray-600">Product price: <span class="font-semibold">$100.00</span></p>
                      <p class="text-gray-600">Tax ({{ form.tax_rate }}%): <span class="font-semibold">+ $12.00</span></p>
                      <p class="text-gray-600 font-semibold mt-1 pt-1 border-t">Total: $112.00</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Tax Name/Label -->
            <div v-if="form.tax_enabled">
              <label class="block text-gray-700 font-medium mb-2">Tax Name/Label</label>
              <input 
                v-model="form.tax_name" 
                type="text" 
                class="input-field max-w-xs" 
                placeholder="VAT, GST, Sales Tax, etc."
              >
              <p class="text-sm text-gray-500 mt-1">This will be displayed to customers (e.g., "VAT 12%")</p>
            </div>
          </div>
        </div>

        <!-- Tax Calculation Preview -->
        <div v-if="form.tax_enabled" class="card">
          <h2 class="text-xl font-bold mb-6">Tax Calculation Preview</h2>
          <p class="text-gray-600 mb-4">See how tax will be calculated with your current settings.</p>

          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="mb-4">
              <label class="block text-sm text-gray-700 font-medium mb-2">Sample Product Price</label>
              <div class="relative max-w-xs">
                <span class="absolute left-3 top-3 text-gray-500">$</span>
                <input 
                  v-model.number="previewPrice" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="input-field pl-7" 
                  placeholder="100.00"
                >
              </div>
            </div>

            <div class="bg-white p-4 rounded border space-y-2">
              <div v-if="form.tax_display_mode === 'inclusive'">
                <p class="text-lg font-semibold text-gray-900">
                  Price shown to customer: ${{ calculateInclusivePrice.toFixed(2) }}
                </p>
                <p class="text-sm text-gray-600">
                  (Includes ${{ calculateTaxAmount.toFixed(2) }} {{ form.tax_name }} {{ form.tax_rate }}%)
                </p>
              </div>
              <div v-else>
                <p class="text-gray-900">Base Price: <span class="font-semibold">${{ previewPrice.toFixed(2) }}</span></p>
                <p class="text-gray-900">{{ form.tax_name }} ({{ form.tax_rate }}%): <span class="font-semibold">+ ${{ calculateTaxAmount.toFixed(2) }}</span></p>
                <div class="pt-2 mt-2 border-t">
                  <p class="text-lg font-semibold text-gray-900">
                    Total: ${{ calculateInclusivePrice.toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button @click="loadSettings" class="btn-secondary">Reset</button>
          <button @click="saveSettings" class="btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

        <div v-if="success" class="card bg-green-50 border-green-200">
          <p class="text-green-800 font-medium">✓ Tax settings saved successfully!</p>
        </div>

        <div v-if="saveError" class="card bg-red-50 border-red-200">
          <p class="text-red-800 font-medium">{{ saveError }}</p>
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