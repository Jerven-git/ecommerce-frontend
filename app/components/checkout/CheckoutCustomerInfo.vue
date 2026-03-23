<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Customer Information</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
        <input :value="customerName" @input="$emit('update:customerName', ($event.target as HTMLInputElement).value)" type="text" required class="input-field" placeholder="Jane Smith" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
        <input :value="customerEmail" @input="$emit('update:customerEmail', ($event.target as HTMLInputElement).value)" type="email" required class="input-field" placeholder="jane@example.com" />
      </div>
      <div class="md:col-span-2">
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
        <PhoneInput
          :model-value="customerPhone"
          @update:model-value="$emit('update:customerPhone', $event)"
          :default-country="storeCountry"
          @update:dial-code="$emit('update:dialCode', $event)"
          placeholder="Phone number"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  customerName: string
  customerEmail: string
  customerPhone: string
  storeCountry: string
}>()

defineEmits<{
  'update:customerName': [value: string]
  'update:customerEmail': [value: string]
  'update:customerPhone': [value: string]
  'update:dialCode': [value: string]
}>()
</script>
