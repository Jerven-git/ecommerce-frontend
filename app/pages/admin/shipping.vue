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
      <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading shipping settings…</p>
    </div>

    <div v-else class="space-y-5 pb-24">

      <!-- General Shipping Options -->
      <section data-guide="shipping-fees" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">General Options</h2>
            <p class="text-xs text-gray-400">Add-on fees and free shipping threshold</p>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Carrier Preset -->
          <div class="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <label class="text-sm font-medium text-gray-700">Carrier Preset</label>
                  <HelpTip text="Choose a carrier to quickly fill in labels, rates, and weight tiers with standard values. You can edit everything after applying. This does not lock you into a carrier — it's just a starting point." />
                </div>
                <select
                  v-model="selectedPreset"
                  class="w-full md:max-w-xs px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="auspost">Australia Post (recommended)</option>
                  <option value="generic">Generic / Other carrier</option>
                </select>
                <p class="text-xs text-gray-400 mt-1">Pre-fills labels, rates, and weight tiers. You can edit them after applying.</p>
              </div>
              <button
                type="button"
                @click="applyPreset"
                class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors shrink-0"
              >
                Apply preset
              </button>
            </div>
          </div>

          <!-- Add-on services: label + fee stacked per tile -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- Express -->
            <div class="space-y-2">
              <div class="flex items-center gap-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Express delivery</label>
                <HelpTip text="Express is a faster shipping method the customer can choose at checkout. Flat Rate charges a single price (e.g. prepaid satchel). Weight Tiers charges based on the package weight — the system automatically uses volumetric weight (Length x Width x Height / 5000) if the box is bulky but light, so oversized packages are priced fairly. Product dimensions are pulled from each product's settings." />
              </div>
              <input
                v-model="form.express_label"
                type="text"
                maxlength="100"
                placeholder="Express Post"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p class="text-xs text-gray-400">Shown to customers at checkout</p>

              <!-- Pricing mode toggle -->
              <div class="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                <button
                  type="button"
                  @click="form.express_pricing_mode = 'flat'"
                  class="flex-1 px-3 py-1.5 font-medium transition-colors"
                  :class="form.express_pricing_mode === 'flat' ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
                >Flat Rate</button>
                <button
                  type="button"
                  @click="form.express_pricing_mode = 'weight_tiered'"
                  class="flex-1 px-3 py-1.5 font-medium transition-colors"
                  :class="form.express_pricing_mode === 'weight_tiered' ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
                >Weight Tiers</button>
              </div>

              <!-- Flat rate input -->
              <div v-if="form.express_pricing_mode === 'flat'">
                <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                  <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                  <input v-model.number="form.express_post_fee" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
                </div>
                <p class="text-xs text-gray-400 mt-1">Satchel / prepaid flat rate</p>
              </div>

              <!-- Weight tier table -->
              <div v-else class="space-y-2">
                <div v-for="(tier, index) in form.express_weight_tiers" :key="index" class="flex items-center gap-2">
                  <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent flex-1">
                    <input v-model.number="tier.max_weight_g" type="number" step="1" min="1" class="flex-1 px-2 py-1.5 text-xs outline-none w-full" placeholder="Max g" />
                    <span class="px-2 flex items-center bg-gray-50 text-gray-400 text-xs border-l border-gray-300 select-none">g</span>
                  </div>
                  <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent flex-1">
                    <span class="px-2 flex items-center bg-gray-50 text-gray-400 text-xs border-r border-gray-300 select-none">$</span>
                    <input v-model.number="tier.rate" type="number" step="0.01" min="0" class="flex-1 px-2 py-1.5 text-xs outline-none w-full" placeholder="Rate" />
                  </div>
                  <button type="button" @click="form.express_weight_tiers.splice(index, 1)" class="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="form.express_weight_tiers.push({ max_weight_g: 0, rate: 0 })"
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                  Add tier
                </button>
                <p class="text-xs text-gray-400">Orders are matched to the first tier where total weight &le; max weight</p>
              </div>
            </div>

            <!-- Registered -->
            <div class="space-y-2">
              <div class="flex items-center gap-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tracked / Registered mail</label>
                <HelpTip text="A flat-rate shipping method that provides tracking and proof of delivery. The customer selects this as an alternative to Standard or Express at checkout. Set the fee to 0 to hide this option." />
              </div>
              <input
                v-model="form.registered_label"
                type="text"
                maxlength="100"
                placeholder="Registered Post"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p class="text-xs text-gray-400">Shown to customers at checkout</p>
              <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                <input v-model.number="form.registered_post_fee" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
              </div>
              <p class="text-xs text-gray-400">Flat fee added when customer opts in</p>
            </div>

            <!-- Insurance (value-based) -->
            <div class="space-y-2">
              <div class="flex items-center gap-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Shipping insurance</label>
                <HelpTip text="Insurance is an optional add-on the customer can tick at checkout on top of any shipping method. It is charged as a percentage of the order value with a minimum fee. For example, 1.5% on a $300 order = $4.50. If the calculated amount is below the minimum, the minimum fee is charged instead." />
              </div>
              <input
                v-model="form.insurance_label"
                type="text"
                maxlength="100"
                placeholder="Shipping Insurance"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p class="text-xs text-gray-400">Shown to customers at checkout</p>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                    <input v-model.number="form.insurance_rate_percent" type="number" step="0.01" min="0" max="100" class="flex-1 px-3 py-2 text-sm outline-none w-full" placeholder="1.50" />
                    <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-l border-gray-300 select-none">%</span>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">Rate of order value</p>
                </div>
                <div>
                  <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                    <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                    <input v-model.number="form.insurance_min_fee" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none w-full" placeholder="2.00" />
                  </div>
                  <p class="text-xs text-gray-400 mt-1">Minimum fee</p>
                </div>
              </div>
              <p class="text-xs text-gray-500 italic">e.g. 1.5% of $300 = $4.50 (or min, whichever is greater)</p>
            </div>
          </div>

          <div class="pt-1">
            <div class="flex items-center gap-1.5 mb-1.5">
              <label class="text-sm font-medium text-gray-700">Free Shipping Threshold
                <span class="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
              </label>
              <HelpTip text="When an order subtotal reaches this amount, the base zone shipping cost (base rate + weight + volume) becomes free. Express and Registered method fees and Insurance add-ons still apply. Set to 0 to disable free shipping." />
            </div>
            <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent max-w-xs">
              <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
              <input v-model.number="form.free_shipping_threshold" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
            </div>
            <p class="text-xs text-gray-400 mt-1">Orders above this amount qualify for free shipping. Set to 0 to disable.</p>
          </div>
        </div>
      </section>

      <!-- Shipping Zones -->
      <section data-guide="shipping-zones" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h2 class="text-sm font-semibold text-gray-900">Shipping Zones & Rates</h2>
              <HelpTip text="Zones are determined by comparing the customer's address to your store location. Each zone has a base rate (flat starting cost), a per-kg rate (charged per kilogram of product weight), and a per-cbm rate (charged per cubic metre for bulky items). These rates apply to Standard shipping. Express and Registered have their own fees configured above." />
            </div>
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
                class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="zone.enabled ? 'bg-primary-600' : 'bg-gray-200'"
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
                <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                  <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                  <input v-model.number="zone.base_rate" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5">Per KG Rate
                  <span class="ml-1 font-normal text-gray-400">(optional)</span>
                </label>
                <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                  <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                  <input v-model.number="zone.per_kg_rate" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
                </div>
                <p class="text-xs text-gray-400 mt-1">Applies to products set to <span class="font-semibold text-gray-500">Weight</span> mode</p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5">Per CBM Rate
                  <span class="ml-1 font-normal text-gray-400">(optional)</span>
                </label>
                <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                  <span class="px-3 flex items-center bg-gray-50 text-gray-500 text-sm border-r border-gray-300 select-none">$</span>
                  <input v-model.number="zone.per_cbm_rate" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none" placeholder="0.00" />
                </div>
                <p class="text-xs text-gray-400 mt-1">Applies to products set to <span class="font-semibold text-gray-500">Dimensions</span> mode</p>
              </div>
            </div>
            <!-- Permanent note about product shipping mode -->
            <div v-if="zone.enabled" class="mt-3 flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
              <svg class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-xs text-blue-800 leading-relaxed">Each product has a shipping calculation mode: <strong>Weight</strong> (uses Per KG rate) or <strong>Dimensions</strong> (uses Per CBM rate). Set this when creating or editing a product to control which rate applies.</p>
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
            <div class="flex items-center gap-1.5">
              <h2 class="text-sm font-semibold text-gray-900">Store Location</h2>
              <HelpTip text="Your store's physical location is used to determine which shipping zone a customer falls into. For example, a customer in the same city gets 'Own City' rates, same state gets 'Own State' rates, and so on. Make sure this is set correctly for accurate zone matching." />
            </div>
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

const { showToast } = useAdminToast()

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const isLoading = ref(false)

const form = ref({
  express_post_fee: 0,
  registered_post_fee: 0,
  insurance_fee: 0,
  insurance_rate_percent: 0,
  insurance_min_fee: 0,
  express_label: '',
  express_pricing_mode: 'flat' as 'flat' | 'weight_tiered',
  express_weight_tiers: [] as { max_weight_g: number; rate: number }[],
  registered_label: '',
  insurance_label: '',
  free_shipping_threshold: 0,
  store_country: '',
  store_state: '',
  store_city: ''
})

// Carrier preset selector — frontend-only convenience that pre-fills the
// editable label inputs. Not persisted to the backend.
const selectedPreset = ref<'auspost' | 'generic'>('auspost')

const PRESETS = {
  auspost: {
    express_label: 'Express Post',
    express_post_fee: 15.00,
    express_pricing_mode: 'flat' as const,
    express_weight_tiers: [
      { max_weight_g: 250, rate: 9.10 },
      { max_weight_g: 500, rate: 11.80 },
      { max_weight_g: 1000, rate: 14.80 },
      { max_weight_g: 3000, rate: 17.10 },
      { max_weight_g: 5000, rate: 19.60 },
    ],
    registered_label: 'Registered Post',
    registered_post_fee: 7.55,
    insurance_label: 'Shipping Insurance',
    insurance_rate_percent: 1.50,
    insurance_min_fee: 1.50,
  },
  generic: {
    express_label: 'Express Delivery',
    express_post_fee: 0,
    express_pricing_mode: 'flat' as const,
    express_weight_tiers: [] as { max_weight_g: number; rate: number }[],
    registered_label: 'Tracked & Signed Mail',
    registered_post_fee: 0,
    insurance_label: 'Shipping Insurance',
    insurance_rate_percent: 0,
    insurance_min_fee: 0,
  }
}

const hasCustomValues = () => {
  const defaultLabels = [...Object.values(PRESETS.auspost).filter(v => typeof v === 'string'),
    ...Object.values(PRESETS.generic).filter(v => typeof v === 'string'), '']
  return !defaultLabels.includes(form.value.express_label)
    || !defaultLabels.includes(form.value.registered_label)
    || !defaultLabels.includes(form.value.insurance_label)
    || form.value.express_post_fee > 0
    || form.value.registered_post_fee > 0
    || form.value.insurance_rate_percent > 0
}

const applyPreset = () => {
  const preset = PRESETS[selectedPreset.value]
  if (hasCustomValues()) {
    const ok = window.confirm('Replace current labels and rates with the selected preset defaults?')
    if (!ok) return
  }
  form.value.express_label = preset.express_label
  form.value.express_post_fee = preset.express_post_fee
  form.value.express_pricing_mode = preset.express_pricing_mode
  form.value.express_weight_tiers = JSON.parse(JSON.stringify(preset.express_weight_tiers))
  form.value.registered_label = preset.registered_label
  form.value.registered_post_fee = preset.registered_post_fee
  form.value.insurance_label = preset.insurance_label
  form.value.insurance_rate_percent = preset.insurance_rate_percent
  form.value.insurance_min_fee = preset.insurance_min_fee
}

// Dynamic state/city options based on selected country/state
const stateOptions = computed(() => getStates(form.value.store_country))
const cityOptions = computed(() => getCities(form.value.store_country, form.value.store_state))

// Clear dependent fields when parent changes
watch(() => form.value.store_country, () => {
  if (isLoading.value) return
  form.value.store_state = ''
  form.value.store_city = ''
})
watch(() => form.value.store_state, () => {
  if (isLoading.value) return
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
      isLoading.value = true
      form.value = {
        express_post_fee: response.data.express_post_fee || 0,
        registered_post_fee: response.data.registered_post_fee || 0,
        insurance_fee: response.data.insurance_fee || 0,
        insurance_rate_percent: response.data.insurance_rate_percent || 0,
        insurance_min_fee: response.data.insurance_min_fee || 0,
        express_label: response.data.express_label || 'Express Post',
        express_pricing_mode: response.data.express_pricing_mode || 'flat',
        express_weight_tiers: response.data.express_weight_tiers || [],
        registered_label: response.data.registered_label || 'Registered Post',
        insurance_label: response.data.insurance_label || 'Shipping Insurance',
        free_shipping_threshold: response.data.free_shipping_threshold || 0,
        store_country: response.data.store_country || '',
        store_state: response.data.store_state || '',
        store_city: response.data.store_city || ''
      }
      // Apply AusPost defaults on first load if everything is unconfigured
      const isUnconfigured = !response.data.express_post_fee
        && !response.data.registered_post_fee
        && !response.data.insurance_rate_percent
        && !response.data.insurance_fee
      if (isUnconfigured) {
        selectedPreset.value = 'auspost'
        applyPreset()
      }

      nextTick(() => { isLoading.value = false })

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

    showToast('Shipping settings saved', 'success')
    await loadSettings()
  } catch (err: any) {
    console.error('Error saving shipping settings:', err)
    showToast(err?.data?.message || 'Failed to save shipping settings', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>