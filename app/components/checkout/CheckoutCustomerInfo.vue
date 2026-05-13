<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Customer Information</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
        <input
          :value="customerName"
          @input="emit('update:customerName', ($event.target as HTMLInputElement).value)"
          @blur="touched.name = true"
          type="text"
          required
          :class="['input-field', showNameError ? '!border-red-300 focus:!ring-red-200' : '']"
          placeholder="Jane Smith"
        />
        <p v-if="showNameError" class="mt-1 text-xs text-red-600">Full name is required.</p>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
        <input
          :value="customerEmail"
          @input="emit('update:customerEmail', ($event.target as HTMLInputElement).value)"
          @blur="touched.email = true"
          type="email"
          required
          :class="['input-field', showEmailError ? '!border-red-300 focus:!ring-red-200' : '']"
          placeholder="jane@example.com"
        />
        <p v-if="showEmailError" class="mt-1 text-xs text-red-600">Email address is required.</p>
      </div>
      <div class="md:col-span-2">
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone *</label>
        <PhoneInput
          :model-value="customerPhone"
          @update:model-value="onPhoneChange"
          :default-country="storeCountry"
          @update:dial-code="emit('update:dialCode', $event)"
          placeholder="Phone number"
          :class="showPhoneError ? 'phone-error' : ''"
        />
        <p v-if="showPhoneError" class="mt-1 text-xs text-red-600">Phone number is required.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  customerName: string
  customerEmail: string
  customerPhone: string
  storeCountry: string
  submitted?: boolean
}>()

const emit = defineEmits<{
  'update:customerName': [value: string]
  'update:customerEmail': [value: string]
  'update:customerPhone': [value: string]
  'update:dialCode': [value: string]
}>()

const touched = reactive({ name: false, email: false, phone: false })

const showNameError = computed(() => (touched.name || props.submitted) && !props.customerName)
const showEmailError = computed(() => (touched.email || props.submitted) && !props.customerEmail)
const showPhoneError = computed(() => (touched.phone || props.submitted) && !props.customerPhone)

function onPhoneChange(value: string) {
  touched.phone = true
  emit('update:customerPhone', value)
}
</script>

<style scoped>
:deep(.phone-error input[type="tel"]) {
  border-color: rgb(252 165 165) !important;
}
:deep(.phone-error input[type="tel"]:focus) {
  --tw-ring-color: rgb(254 202 202) !important;
}
</style>
