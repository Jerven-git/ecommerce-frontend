<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Additional Shipping Services</h2>

    <div v-if="options.length === 0" class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
      <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-xs text-amber-800 font-medium">No additional shipping options configured.</p>
    </div>

    <div v-else class="space-y-3">
      <p class="text-sm text-gray-500 mb-3">Select optional add-ons for your delivery</p>
      <label
        v-for="option in options"
        :key="option.id"
        class="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-all"
      >
        <input
          type="checkbox"
          :value="option.id"
          :checked="modelValue.includes(option.id)"
          @change="onToggle(option.id, ($event.target as HTMLInputElement).checked)"
          class="mt-0.5 h-4 w-4 accent-primary-600 rounded shrink-0"
        />
        <div class="flex-1 min-w-0 flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ option.name }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ option.description }}</p>
          </div>
          <span class="text-sm font-bold accent-primary-600 shrink-0">+${{ parseFloat(option.fee || 0).toFixed(2) }}</span>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  options: any[]
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const onToggle = (id: string, checked: boolean) => {
  const updated = checked
    ? [...props.modelValue, id]
    : props.modelValue.filter(v => v !== id)
  emit('update:modelValue', updated)
}
</script>
