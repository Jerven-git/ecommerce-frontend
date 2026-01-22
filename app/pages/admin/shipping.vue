<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">← Dashboard</NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Shipping Settings</h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="space-y-6">
        <!-- General Shipping Options -->
        <div class="card">
          <h2 class="text-xl font-bold mb-6">General Shipping Options</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-gray-700 font-medium mb-2">Express Post Added Value</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-500">$</span>
                  <input v-model.number="form.express_post_fee" type="number" step="0.01" min="0" class="input-field pl-7" placeholder="0.00" />
                </div>
                <p class="text-sm text-gray-500 mt-1">Additional fee for express delivery</p>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2">Registered Post Added Value</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-500">$</span>
                  <input v-model.number="form.registered_post_fee" type="number" step="0.01" min="0" class="input-field pl-7" placeholder="0.00" />
                </div>
                <p class="text-sm text-gray-500 mt-1">Additional fee for registered mail</p>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2">Insurance Added Value</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-500">$</span>
                  <input v-model.number="form.insurance_fee" type="number" step="0.01" min="0" class="input-field pl-7" placeholder="0.00" />
                </div>
                <p class="text-sm text-gray-500 mt-1">Additional fee for shipping insurance</p>
              </div>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Free Shipping Threshold (Optional)</label>
              <div class="relative max-w-xs">
                <span class="absolute left-3 top-3 text-gray-500">$</span>
                <input v-model.number="form.free_shipping_threshold" type="number" step="0.01" min="0" class="input-field pl-7" placeholder="0.00" />
              </div>
              <p class="text-sm text-gray-500 mt-1">Offer free shipping for orders above this amount (leave 0 to disable)</p>
            </div>
          </div>
        </div>

        <!-- Shipping Zones -->
        <div class="card">
          <h2 class="text-xl font-bold mb-6">Shipping Zones & Rates</h2>
          <p class="text-gray-600 mb-6">Configure shipping rates based on destination. Base rates apply to standard shipping.</p>
          
          <div class="space-y-4">
            <div v-for="zone in shippingZones" :key="zone.id" class="p-4 border rounded-lg">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h3 class="font-semibold text-lg">{{ zone.label }}</h3>
                  <p class="text-sm text-gray-500">{{ zone.description }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <label class="flex items-center cursor-pointer">
                    <input 
                      v-model="zone.enabled" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded"
                    />
                    <span class="ml-2 text-sm text-gray-700">Enable</span>
                  </label>
                </div>
              </div>

              <div v-if="zone.enabled" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-700 font-medium mb-2">Base Rate</label>
                  <div class="relative">
                    <span class="absolute left-3 top-3 text-gray-500">$</span>
                    <input 
                      v-model.number="zone.base_rate" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      class="input-field pl-7" 
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-gray-700 font-medium mb-2">Per KG Rate (Optional)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-3 text-gray-500">$</span>
                    <input 
                      v-model.number="zone.per_kg_rate" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      class="input-field pl-7" 
                      placeholder="0.00"
                    />
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Additional charge per kilogram</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Store Location -->
        <div class="card">
          <h2 class="text-xl font-bold mb-6">Store Location</h2>
          <p class="text-gray-600 mb-4">Set your store location to calculate shipping zones accurately</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Country</label>
              <input v-model="form.store_country" type="text" class="input-field" placeholder="Philippines" />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">State/Province</label>
              <input v-model="form.store_state" type="text" class="input-field" placeholder="Metro Manila" />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">City</label>
              <input v-model="form.store_city" type="text" class="input-field" placeholder="Manila" />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button @click="loadSettings" class="btn-secondary">Reset</button>
          <button @click="saveSettings" class="btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save All Changes' }}
          </button>
        </div>

        <div v-if="success" class="card bg-green-50 border-green-200">
          <p class="text-green-800 font-medium">Shipping settings saved successfully!</p>
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

interface ShippingZone {
  id: string
  label: string
  description: string
  enabled: boolean
  base_rate: number
  per_kg_rate: number
}

const { $apiFetch } = useNuxtApp()

const loading = ref(true)
const saving = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const saveError = ref<string | null>(null)

const form = ref({
  express_post_fee: 0,
  registered_post_fee: 0,
  insurance_fee: 0,
  free_shipping_threshold: 0,
  store_country: '',
  store_state: '',
  store_city: ''
})

const shippingZones = ref<ShippingZone[]>([
  {
    id: 'own_city',
    label: 'Own City',
    description: 'Same city as store location',
    enabled: true,
    base_rate: 0,
    per_kg_rate: 0
  },
  {
    id: 'own_state',
    label: 'Own State/Province',
    description: 'Same state/province, different city',
    enabled: true,
    base_rate: 0,
    per_kg_rate: 0
  },
  {
    id: 'own_country',
    label: 'Own Country',
    description: 'Same country, different state/province',
    enabled: true,
    base_rate: 0,
    per_kg_rate: 0
  },
  {
    id: 'other_city',
    label: 'Other City (International)',
    description: 'Different country, specific city',
    enabled: false,
    base_rate: 0,
    per_kg_rate: 0
  },
  {
    id: 'other_state',
    label: 'Other State (International)',
    description: 'Different country, specific state/region',
    enabled: false,
    base_rate: 0,
    per_kg_rate: 0
  },
  {
    id: 'other_country',
    label: 'Other Country (International)',
    description: 'Any international destination',
    enabled: true,
    base_rate: 0,
    per_kg_rate: 0
  }
])

const loadSettings = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<any>('/shipping-settings', {
      method: 'GET'
    })

    if (response?.data) {
      form.value = {
        express_post_fee: response.data.express_post_fee || 0,
        registered_post_fee: response.data.registered_post_fee || 0,
        insurance_fee: response.data.insurance_fee || 0,
        free_shipping_threshold: response.data.free_shipping_threshold || 0,
        store_country: response.data.store_country || '',
        store_state: response.data.store_state || '',
        store_city: response.data.store_city || ''
      }

      // Load shipping zones
      if (response.data.zones) {
        response.data.zones.forEach((zone: any) => {
          const existingZone = shippingZones.value.find(z => z.id === zone.zone_type)
          if (existingZone) {
            existingZone.enabled = zone.enabled
            existingZone.base_rate = parseFloat(zone.base_rate)
            existingZone.per_kg_rate = parseFloat(zone.per_kg_rate)
          }
        })
      }
    }
  } catch (err: any) {
    console.error('Error loading shipping settings:', err)
    error.value = err?.data?.message || 'Failed to load shipping settings'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  success.value = false
  saveError.value = null

  try {
    await $apiFetch('/shipping-settings', {
      method: 'PATCH',
      body: {
        ...form.value,
        zones: shippingZones.value.map(zone => ({
          zone_type: zone.id,
          enabled: zone.enabled,
          base_rate: zone.base_rate,
          per_kg_rate: zone.per_kg_rate
        }))
      }
    })

    success.value = true

    setTimeout(() => {
      success.value = false
    }, 3000)

    await loadSettings()
  } catch (err: any) {
    console.error('Error saving shipping settings:', err)
    saveError.value = err?.data?.message || 'Failed to save shipping settings'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>