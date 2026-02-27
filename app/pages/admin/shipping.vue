<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium">Shipping</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Shipping Settings</h1>
      <p class="text-gray-500 text-sm mt-1">Configure rates, zones, and delivery options</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading shipping settings…</p>
    </div>

    <div v-else class="space-y-5 pb-24">

      <!-- General Shipping Options -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">General Options</h2>
            <p class="text-xs text-gray-400">Add-on fees and free shipping threshold</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Express Post Fee</label>
              <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                <input v-model.number="form.express_post_fee" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
              </div>
              <p class="text-xs text-gray-400 mt-1">Additional fee for express delivery</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Registered Post Fee</label>
              <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                <input v-model.number="form.registered_post_fee" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
              </div>
              <p class="text-xs text-gray-400 mt-1">Additional fee for registered mail</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Insurance Fee</label>
              <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                <input v-model.number="form.insurance_fee" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
              </div>
              <p class="text-xs text-gray-400 mt-1">Additional fee for shipping insurance</p>
            </div>
          </div>

          <div class="pt-1">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Free Shipping Threshold
              <span class="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent max-w-xs">
              <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
              <input v-model.number="form.free_shipping_threshold" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
            </div>
            <p class="text-xs text-gray-400 mt-1">Orders above this amount qualify for free shipping. Set to 0 to disable.</p>
          </div>
        </div>
      </section>

      <!-- Shipping Zones -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Shipping Zones & Rates</h2>
            <p class="text-xs text-gray-400">Base rates apply to standard shipping per destination</p>
          </div>
        </div>

        <div class="divide-y divide-gray-100">
          <div v-for="zone in shippingZones" :key="zone.id" class="px-6 py-4">
            <!-- Zone header row -->
            <div class="flex items-center justify-between">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900">{{ zone.label }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ zone.description }}</p>
              </div>
              <!-- Toggle switch -->
              <button
                type="button"
                @click="zone.enabled = !zone.enabled"
                class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                :class="zone.enabled ? 'bg-blue-600' : 'bg-gray-200'"
                :aria-label="`Toggle ${zone.label}`"
              >
                <span
                  class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                  :class="zone.enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'"
                />
              </button>
            </div>

            <!-- Rate inputs (visible when enabled) -->
            <div v-if="zone.enabled" class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5">Base Rate</label>
                <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                  <input v-model.number="zone.base_rate" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5">Per KG Rate
                  <span class="ml-1 font-normal text-gray-400">(optional)</span>
                </label>
                <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                  <input v-model.number="zone.per_kg_rate" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
                </div>
                <p class="text-xs text-gray-400 mt-1">Charge per kilogram</p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5">Per CBM Rate
                  <span class="ml-1 font-normal text-gray-400">(optional)</span>
                </label>
                <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                  <input v-model.number="zone.per_cbm_rate" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
                </div>
                <p class="text-xs text-gray-400 mt-1">Charge per cubic meter</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Store Location -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Store Location</h2>
            <p class="text-xs text-gray-400">Used to determine shipping zones accurately</p>
          </div>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <CountrySelect v-model="form.store_country" placeholder="Select country" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">State / Province</label>
              <SearchableSelect v-model="form.store_state" :options="stateOptions" placeholder="Select state / province" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <SearchableSelect v-model="form.store_city" :options="cityOptions" placeholder="Select city" allow-free-text />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Sticky Save Footer -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Feedback messages -->
        <div class="flex items-center min-w-0">
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="success" class="flex items-center gap-2 text-green-700 text-sm font-medium">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Saved successfully
            </div>
          </Transition>
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-if="saveError" class="flex items-center gap-2 text-red-600 text-sm font-medium min-w-0">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="truncate">{{ saveError }}</span>
            </div>
          </Transition>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-3 shrink-0">
          <button
            @click="loadSettings"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="saving"
          >
            Reset
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="saving"
            @click="saveSettings"
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

interface ShippingZone {
  id: string
  label: string
  description: string
  enabled: boolean
  base_rate: number
  per_kg_rate: number
  per_cbm_rate: number
}

const { $apiFetch } = useNuxtApp()
const { getStates, getCities } = useRegions()

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

// Dynamic state/city options based on selected country/state
const stateOptions = computed(() => getStates(form.value.store_country))
const cityOptions = computed(() => getCities(form.value.store_country, form.value.store_state))

// Clear dependent fields when parent changes
watch(() => form.value.store_country, () => {
  form.value.store_state = ''
  form.value.store_city = ''
})
watch(() => form.value.store_state, () => {
  form.value.store_city = ''
})

const shippingZones = ref<ShippingZone[]>([
  {
    id: 'own_city',
    label: 'Own City',
    description: 'Same city as store location',
    enabled: true,
    base_rate: 0,
    per_kg_rate: 0,
    per_cbm_rate: 0
  },
  {
    id: 'own_state',
    label: 'Own State/Province',
    description: 'Same state/province, different city',
    enabled: true,
    base_rate: 0,
    per_kg_rate: 0,
    per_cbm_rate: 0
  },
  {
    id: 'own_country',
    label: 'Own Country',
    description: 'Same country, different state/province',
    enabled: true,
    base_rate: 0,
    per_kg_rate: 0,
    per_cbm_rate: 0
  },
  {
    id: 'other_country',
    label: 'Other Country (International)',
    description: 'Any international destination',
    enabled: true,
    base_rate: 0,
    per_kg_rate: 0,
    per_cbm_rate: 0
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
            existingZone.per_cbm_rate = parseFloat(zone.per_cbm_rate) || 0
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
          per_kg_rate: zone.per_kg_rate,
          per_cbm_rate: zone.per_cbm_rate
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