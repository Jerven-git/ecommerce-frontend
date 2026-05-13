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
      <p class="text-sm text-gray-500">Loading tax settings...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Tax Configuration -->
      <section data-guide="tax-config" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
              <div class="flex items-center gap-1.5 mb-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax Rate</label>
                <HelpTip text="The percentage of tax applied to each order. For example, enter 12 for 12% Tax or 10 for 10% GST." />
              </div>
              <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent max-w-xs">
                <input v-model.number="form.tax_rate" type="number" step="0.01" min="0" max="100" class="flex-1 px-3 py-2 text-sm outline-none bg-white" placeholder="0.00" />
                <span class="px-3 flex items-center bg-gray-50 border-l border-gray-300 text-gray-500 text-sm select-none">%</span>
              </div>
            </div>

            <!-- Tax Display Mode -->
            <div>
              <div class="flex items-center gap-1.5 mb-3">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax Display Mode</label>
                <HelpTip text="Inclusive: your product prices already include tax (common in AU, UK, EU). Exclusive: tax is added on top at checkout (common in US, CA). Both modes calculate the same final total." />
              </div>

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
                      <p class="text-gray-700">Product price: <span class="font-semibold">{{ format(100 * (1 + form.tax_rate / 100)) }}</span></p>
                      <p class="text-gray-400">Includes {{ format(100 * form.tax_rate / 100) }} {{ form.tax_name }} ({{ form.tax_rate }}%)</p>
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
                      <p class="text-gray-700">Product price: <span class="font-semibold">{{ format(100) }}</span></p>
                      <p class="text-gray-700">{{ form.tax_name }} ({{ form.tax_rate }}%): <span class="font-semibold">+ {{ format(100 * form.tax_rate / 100) }}</span></p>
                      <p class="text-gray-700 font-semibold pt-1 mt-0.5 border-t border-gray-100">Total: {{ format(100 * (1 + form.tax_rate / 100)) }}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Tax Name -->
            <div>
              <div class="flex items-center gap-1.5 mb-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax Label</label>
                <HelpTip text="The name shown to customers on invoices and at checkout. Use your local tax name like Tax, GST, Sales Tax, etc." />
              </div>
              <input v-model="form.tax_name" type="text" class="input-field max-w-xs" placeholder="Tax, GST, Sales Tax..." />
            </div>
          </template>
        </div>
      </section>

      <!-- Regional Tax Rules (collapsible) -->
      <section v-show="form.tax_enabled" data-guide="tax-regional" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          type="button"
          @click="showRegional = !showRegional"
          class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-left">
              <div class="flex items-center gap-1.5">
                <p class="text-sm font-semibold text-gray-900">Regional Tax Rules</p>
                <HelpTip text="If you sell to multiple countries with different tax rates, you can set specific rates per country or state. For example, 10% GST for Australia and 0% for the US. If you only sell in one country, you can skip this." />
              </div>
              <p class="text-xs text-gray-400">Optional &mdash; set different tax rates for different countries</p>
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400 transition-transform" :class="showRegional ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="showRegional" class="px-6 pb-5 space-y-3 border-t border-gray-100 pt-4">
          <!-- Add Country button -->
          <div class="flex justify-end">
            <button @click="addCountryRule" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Country
            </button>
          </div>

          <!-- All Regions rule -->
          <div class="p-4 bg-gray-50 rounded-xl space-y-3">
            <div class="flex items-center gap-3">
              <input type="checkbox" v-model="allRegionRule.enabled" class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-semibold text-gray-900">All Regions</span>
                <HelpTip text="A catch-all rule applied to any buyer whose country doesn't have a specific rule below. If disabled, the global defaults from above are used instead." />
              </div>
            </div>
            <div v-if="allRegionRule.enabled" class="grid grid-cols-3 gap-3 pl-7">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Rate</label>
                <div class="flex rounded-lg border border-gray-300 overflow-hidden">
                  <input v-model.number="allRegionRule.tax_rate" type="number" step="0.01" min="0" max="100" class="flex-1 px-2 py-1.5 text-sm outline-none bg-white w-full" />
                  <span class="px-2 flex items-center bg-gray-50 border-l border-gray-300 text-gray-500 text-xs">%</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Tax Name</label>
                <input v-model="allRegionRule.tax_name" type="text" class="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary-500" placeholder="Tax" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Mode</label>
                <select v-model="allRegionRule.tax_display_mode" class="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="inclusive">Inclusive</option>
                  <option value="exclusive">Exclusive</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Country rules -->
          <div v-for="(rule, idx) in countryRules" :key="rule._key" class="border border-gray-200 rounded-xl overflow-hidden">
            <div class="p-4 bg-white flex items-center gap-3">
              <input type="checkbox" v-model="rule.enabled" class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <div class="flex-1 min-w-0">
                <CountrySelect v-model="rule.country" placeholder="Select country" class="!text-sm" />
              </div>
              <div class="grid grid-cols-3 gap-2 flex-1">
                <div class="flex rounded-lg border border-gray-300 overflow-hidden">
                  <input v-model.number="rule.tax_rate" type="number" step="0.01" min="0" max="100" class="flex-1 px-2 py-1.5 text-sm outline-none bg-white w-full" />
                  <span class="px-2 flex items-center bg-gray-50 border-l border-gray-300 text-gray-500 text-xs">%</span>
                </div>
                <input v-model="rule.tax_name" type="text" class="px-2 py-1.5 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary-500" placeholder="Tax name" />
                <select v-model="rule.tax_display_mode" class="px-2 py-1.5 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="inclusive">Inclusive</option>
                  <option value="exclusive">Exclusive</option>
                </select>
              </div>
              <button @click="toggleStates(idx)" class="text-gray-400 hover:text-gray-600 p-1 transition-colors" :title="rule._showStates ? 'Hide states' : 'Show states'">
                <svg class="w-4 h-4 transition-transform" :class="rule._showStates ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button @click="removeCountryRule(idx)" class="text-gray-400 hover:text-red-500 p-1 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <!-- State rules -->
            <div v-if="rule._showStates && rule.country" class="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1.5">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">State overrides</p>
                  <HelpTip text="Override the country rate for specific states. For example, if Australia is 10% GST but a specific state has a different rate." />
                </div>
                <button @click="addStateRule(idx)" class="text-xs text-primary-600 hover:text-primary-700 font-medium">+ Add State</button>
              </div>

              <div v-if="getStateRules(rule.country).length === 0" class="text-xs text-gray-400 py-2">
                No state overrides. The country rate ({{ rule.tax_rate }}%) applies to all states.
              </div>

              <div v-for="(stateRule, sIdx) in getStateRules(rule.country)" :key="stateRule._key" class="flex items-center gap-2 bg-white rounded-lg p-2.5">
                <input type="checkbox" v-model="stateRule.enabled" class="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <select v-model="stateRule.state" class="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select state</option>
                  <option v-for="s in getStatesForCountry(rule.country)" :key="s" :value="s">{{ s }}</option>
                </select>
                <div class="flex rounded-lg border border-gray-300 overflow-hidden">
                  <input v-model.number="stateRule.tax_rate" type="number" step="0.01" min="0" max="100" class="w-20 px-2 py-1.5 text-sm outline-none bg-white" />
                  <span class="px-2 flex items-center bg-gray-50 border-l border-gray-300 text-gray-500 text-xs">%</span>
                </div>
                <input v-model="stateRule.tax_name" type="text" class="w-24 px-2 py-1.5 text-sm rounded-lg border border-gray-300 outline-none" placeholder="Tax name" />
                <select v-model="stateRule.tax_display_mode" class="px-2 py-1.5 text-sm rounded-lg border border-gray-300 bg-white outline-none">
                  <option value="inclusive">Incl</option>
                  <option value="exclusive">Excl</option>
                </select>
                <button @click="removeStateRule(rule.country, sIdx)" class="text-gray-400 hover:text-red-500 p-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="countryRules.length === 0" class="text-center py-6 text-gray-400">
            <p class="text-sm">No country-specific rules.</p>
            <p class="text-xs mt-1">Click "Add Country" to set different rates per region.</p>
          </div>
        </div>
      </section>

      <!-- Tax Calculation Preview -->
      <section v-show="form.tax_enabled" data-guide="tax-preview" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
              <input v-model.number="previewPrice" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 text-sm outline-none bg-white" placeholder="100.00" />
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-4 space-y-2">
            <template v-if="form.tax_display_mode === 'inclusive'">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Price shown to customer</span>
                <span class="text-sm font-bold text-gray-900">{{ format(previewPrice) }}</span>
              </div>
              <p class="text-xs text-gray-400">
                Includes {{ format(calculateTaxAmount) }} {{ form.tax_name }} at {{ form.tax_rate }}%
              </p>
            </template>
            <template v-else>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Base price</span>
                <span class="text-sm text-gray-700">{{ format(previewPrice) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">{{ form.tax_name }} ({{ form.tax_rate }}%)</span>
                <span class="text-sm text-gray-700">+ {{ format(calculateTaxAmount) }}</span>
              </div>
              <div class="flex items-center justify-between pt-2 mt-1 border-t border-gray-200">
                <span class="text-sm font-semibold text-gray-900">Total</span>
                <span class="text-sm font-bold text-gray-900">{{ format(calculateTotal) }}</span>
              </div>
            </template>
          </div>
        </div>
      </section>
    </div>

    <AdminSettingsSaveFooter
      :saving="saving"
      @save="saveAll"
      @reset="loadAll"
    />

    <AdminToast />
  </div>
</template>

<script setup lang="ts">
import { useRegions } from '~/composables/useRegions'

definePageMeta({ middleware: 'auth' })

const { $apiFetch } = useNuxtApp()
const { getStates } = useRegions()
const { format } = useCurrency()

// --- State ---

const { showToast } = useAdminToast()

const loading = ref(true)
const saving = ref(false)
const showRegional = ref(false)
const previewPrice = ref(100)

const form = ref({
  tax_enabled: false,
  tax_rate: 0,
  tax_display_mode: 'exclusive' as 'inclusive' | 'exclusive',
  tax_name: 'Tax',
  default_display_country: '',
  default_display_state: '',
})

interface TaxRuleForm {
  id?: number
  region_type: 'all' | 'country' | 'state'
  country: string
  state: string
  tax_rate: number
  tax_name: string
  tax_display_mode: 'inclusive' | 'exclusive'
  enabled: boolean
  _key: string
  _showStates?: boolean
}

let keyCounter = 0
const genKey = () => `rule_${++keyCounter}`

const allRegionRule = ref<TaxRuleForm>({
  region_type: 'all', country: '', state: '', tax_rate: 0, tax_name: 'Tax', tax_display_mode: 'exclusive', enabled: false, _key: genKey(),
})

const countryRules = ref<TaxRuleForm[]>([])
const stateRules = ref<TaxRuleForm[]>([])

// --- Computed ---

const calculateTaxAmount = computed(() => {
  if (!form.value.tax_enabled || !form.value.tax_rate) return 0
  if (form.value.tax_display_mode === 'inclusive') {
    return previewPrice.value - (previewPrice.value / (1 + form.value.tax_rate / 100))
  }
  return previewPrice.value * (form.value.tax_rate / 100)
})

const calculateTotal = computed(() => {
  if (!form.value.tax_enabled) return previewPrice.value
  if (form.value.tax_display_mode === 'inclusive') return previewPrice.value
  return previewPrice.value + calculateTaxAmount.value
})

// --- Methods ---

function getStatesForCountry(country: string): string[] {
  if (!country) return []
  return getStates(country)
}

function getStateRules(country: string): TaxRuleForm[] {
  return stateRules.value.filter(r => r.country === country)
}

function addCountryRule() {
  countryRules.value.push({
    region_type: 'country',
    country: '',
    state: '',
    tax_rate: form.value.tax_rate,
    tax_name: form.value.tax_name,
    tax_display_mode: form.value.tax_display_mode,
    enabled: true,
    _key: genKey(),
    _showStates: false,
  })
}

function removeCountryRule(idx: number) {
  const rule = countryRules.value[idx]
  if (rule && rule.country) {
    stateRules.value = stateRules.value.filter(r => r.country !== rule.country)
  }
  countryRules.value.splice(idx, 1)
}

function toggleStates(idx: number) {
  const rule = countryRules.value[idx]
  if (rule) {
    rule._showStates = !rule._showStates
  }
}

function addStateRule(countryIdx: number) {
  const parentRule = countryRules.value[countryIdx]
  if (!parentRule) return
  const country = parentRule.country
  if (!country) return
  stateRules.value.push({
    region_type: 'state',
    country,
    state: '',
    tax_rate: parentRule.tax_rate,
    tax_name: parentRule.tax_name,
    tax_display_mode: parentRule.tax_display_mode,
    enabled: true,
    _key: genKey(),
  })
}

function removeStateRule(country: string, sIdx: number) {
  const countryStateRules = stateRules.value.filter(r => r.country === country)
  const ruleToRemove = countryStateRules[sIdx]
  if (ruleToRemove) {
    const globalIdx = stateRules.value.indexOf(ruleToRemove)
    if (globalIdx !== -1) stateRules.value.splice(globalIdx, 1)
  }
}

// --- Load / Save ---

async function loadAll() {
  loading.value = true

  try {
    const [settingsRes, rulesRes] = await Promise.all([
      $apiFetch<any>('/tax-settings', { method: 'GET' }),
      $apiFetch<any>('/tax-rules', { method: 'GET' }),
    ])

    if (settingsRes?.data) {
      form.value = {
        tax_enabled: settingsRes.data.tax_enabled || false,
        tax_rate: parseFloat(settingsRes.data.tax_rate) || 0,
        tax_display_mode: settingsRes.data.tax_display_mode || 'exclusive',
        tax_name: settingsRes.data.tax_name || 'Tax',
        default_display_country: settingsRes.data.default_display_country || '',
        default_display_state: settingsRes.data.default_display_state || '',
      }
    }

    const rules: any[] = rulesRes?.data ?? []

    const allRule = rules.find((r: any) => r.region_type === 'all')
    if (allRule) {
      allRegionRule.value = {
        id: allRule.id, region_type: 'all', country: '', state: '',
        tax_rate: parseFloat(allRule.tax_rate) || 0, tax_name: allRule.tax_name || 'Tax',
        tax_display_mode: allRule.tax_display_mode || 'exclusive', enabled: allRule.enabled, _key: genKey(),
      }
    } else {
      allRegionRule.value = { region_type: 'all', country: '', state: '', tax_rate: 0, tax_name: 'Tax', tax_display_mode: 'exclusive', enabled: false, _key: genKey() }
    }

    countryRules.value = rules.filter((r: any) => r.region_type === 'country').map((r: any) => ({
      id: r.id, region_type: 'country' as const, country: r.country || '', state: '',
      tax_rate: parseFloat(r.tax_rate) || 0, tax_name: r.tax_name || 'Tax',
      tax_display_mode: r.tax_display_mode || 'exclusive', enabled: r.enabled, _key: genKey(), _showStates: false,
    }))

    stateRules.value = rules.filter((r: any) => r.region_type === 'state').map((r: any) => ({
      id: r.id, region_type: 'state' as const, country: r.country || '', state: r.state || '',
      tax_rate: parseFloat(r.tax_rate) || 0, tax_name: r.tax_name || 'Tax',
      tax_display_mode: r.tax_display_mode || 'exclusive', enabled: r.enabled, _key: genKey(),
    }))

    // Auto-expand if rules exist
    if (countryRules.value.length > 0 || allRegionRule.value.enabled) {
      showRegional.value = true
    }
  } catch (err: any) {
    console.error('Error loading tax settings:', err)
    showToast(err?.data?.message || 'Failed to load tax settings', 'error')
  } finally {
    loading.value = false
  }
}

async function saveAll() {
  saving.value = true

  try {
    await $apiFetch('/tax-settings', {
      method: 'PATCH',
      body: {
        tax_enabled: form.value.tax_enabled,
        tax_rate: form.value.tax_rate,
        tax_display_mode: form.value.tax_display_mode,
        tax_name: form.value.tax_name,
        default_display_country: form.value.default_display_country || null,
        default_display_state: form.value.default_display_state || null,
      }
    })

    // Sync tax rules
    const allRules: any[] = []

    if (allRegionRule.value.enabled || allRegionRule.value.id) {
      allRules.push({
        id: allRegionRule.value.id || undefined,
        region_type: 'all', country: null, state: null,
        tax_rate: allRegionRule.value.tax_rate, tax_name: allRegionRule.value.tax_name,
        tax_display_mode: allRegionRule.value.tax_display_mode, enabled: allRegionRule.value.enabled,
      })
    }

    for (const r of countryRules.value) {
      if (!r.country) continue
      allRules.push({
        id: r.id || undefined, region_type: 'country', country: r.country, state: null,
        tax_rate: r.tax_rate, tax_name: r.tax_name, tax_display_mode: r.tax_display_mode, enabled: r.enabled,
      })
    }

    for (const r of stateRules.value) {
      if (!r.country || !r.state) continue
      allRules.push({
        id: r.id || undefined, region_type: 'state', country: r.country, state: r.state,
        tax_rate: r.tax_rate, tax_name: r.tax_name, tax_display_mode: r.tax_display_mode, enabled: r.enabled,
      })
    }

    await $apiFetch('/tax-rules/sync', { method: 'POST', body: { rules: allRules } })

    showToast('Tax settings saved', 'success')
    await loadAll()
  } catch (err: any) {
    console.error('Error saving tax settings:', err)
    showToast(err?.data?.message || 'Failed to save tax settings', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => { loadAll() })
</script>
