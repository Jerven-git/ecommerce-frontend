<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Shipping Address</h2>
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Street Address *</label>
        <textarea :value="address" @input="$emit('update:address', ($event.target as HTMLTextAreaElement).value)" required rows="3" class="input-field resize-none" placeholder="123 Main St, Apt 4B"></textarea>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Country *</label>
          <CountrySelect :model-value="country" @update:model-value="$emit('update:country', $event)" placeholder="Select country" required />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">State / Province *</label>
          <SearchableSelect :model-value="state" @update:model-value="$emit('update:state', $event)" :options="stateOptions" placeholder="Select state / province" required allow-free-text :min-search-length="1" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">City *</label>
          <SearchableSelect :model-value="city" @update:model-value="$emit('update:city', $event)" :options="cityOptions" placeholder="Select city" required allow-free-text :min-search-length="1" />
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
defineProps<{
  address: string
  country: string
  state: string
  city: string
  postcode: string
  stateOptions: string[]
  cityOptions: string[]
}>()

defineEmits<{
  'update:address': [value: string]
  'update:country': [value: string]
  'update:state': [value: string]
  'update:city': [value: string]
  'update:postcode': [value: string]
}>()
</script>
