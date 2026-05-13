<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Shipping Address</h2>
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Street Address *</label>
        <textarea
          :value="address"
          @input="$emit('update:address', ($event.target as HTMLTextAreaElement).value)"
          @blur="touched.address = true"
          required
          rows="3"
          :class="['input-field resize-none', showAddressError ? '!border-red-300 focus:!ring-red-200' : '']"
          placeholder="123 Main St, Apt 4B"
        ></textarea>
        <p v-if="showAddressError" class="mt-1 text-xs text-red-600">Street address is required.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Country *</label>
          <CountrySelect
            :model-value="country"
            @update:model-value="onCountryChange"
            placeholder="Select country"
            required
            :class="showCountryError ? 'select-error' : ''"
          />
          <p v-if="showCountryError" class="mt-1 text-xs text-red-600">Country is required.</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">State / Province *</label>
          <SearchableSelect
            :model-value="state"
            @update:model-value="onStateChange"
            :options="stateOptions"
            placeholder="Select state / province"
            required
            allow-free-text
            :min-search-length="1"
            :class="showStateError ? 'select-error' : ''"
          />
          <p v-if="showStateError" class="mt-1 text-xs text-red-600">State / province is required.</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">City *</label>
          <SearchableSelect
            :model-value="city"
            @update:model-value="onCityChange"
            :options="cityOptions"
            placeholder="Select city"
            required
            allow-free-text
            :min-search-length="1"
            :class="showCityError ? 'select-error' : ''"
          />
          <p v-if="showCityError" class="mt-1 text-xs text-red-600">City is required.</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Postcode</label>
          <input :value="postcode" @input="$emit('update:postcode', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="e.g. 2000" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  address: string
  country: string
  state: string
  city: string
  postcode: string
  stateOptions: string[]
  cityOptions: string[]
  submitted?: boolean
}>()

const emit = defineEmits<{
  'update:address': [value: string]
  'update:country': [value: string]
  'update:state': [value: string]
  'update:city': [value: string]
  'update:postcode': [value: string]
}>()

const touched = reactive({ address: false, country: false, state: false, city: false })

const showAddressError = computed(() => (touched.address || props.submitted) && !props.address)
const showCountryError = computed(() => (touched.country || props.submitted) && !props.country)
const showStateError = computed(() => (touched.state || props.submitted) && !props.state)
const showCityError = computed(() => (touched.city || props.submitted) && !props.city)

function onCountryChange(value: string) {
  touched.country = true
  emit('update:country', value)
}

function onStateChange(value: string) {
  touched.state = true
  emit('update:state', value)
}

function onCityChange(value: string) {
  touched.city = true
  emit('update:city', value)
}
</script>

<style scoped>
:deep(.select-error input) {
  border-color: rgb(252 165 165) !important;
}
:deep(.select-error input:focus) {
  --tw-ring-color: rgb(254 202 202) !important;
}
</style>
