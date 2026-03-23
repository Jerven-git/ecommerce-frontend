<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Delivery Method</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

      <label
        class="relative flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
        :class="modelValue === 'delivery'
          ? 'border-primary-500 bg-primary-50/50'
          : 'border-gray-200 hover:border-gray-300 bg-white'"
      >
        <input :checked="modelValue === 'delivery'" @change="$emit('update:modelValue', 'delivery')" type="radio" name="deliveryMethod" value="delivery" class="mt-0.5 h-4 w-4 accent-primary-600 shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-gray-900">Delivery</span>
            <span
              v-if="modelValue === 'delivery'"
              class="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full font-medium shrink-0"
            >Selected</span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">Delivered to your address</p>
        </div>
      </label>

      <label
        class="relative flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
        :class="modelValue === 'pickup'
          ? 'border-primary-500 bg-primary-50/50'
          : 'border-gray-200 hover:border-gray-300 bg-white'"
      >
        <input :checked="modelValue === 'pickup'" @change="$emit('update:modelValue', 'pickup')" type="radio" name="deliveryMethod" value="pickup" class="mt-0.5 h-4 w-4 accent-primary-600 shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-gray-900">Self Pickup</span>
            <span
              v-if="modelValue === 'pickup'"
              class="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full font-medium shrink-0"
            >Selected</span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">Collect in-store · No shipping fee</p>
        </div>
      </label>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: 'delivery' | 'pickup'
}>()

defineEmits<{
  'update:modelValue': [value: 'delivery' | 'pickup']
}>()
</script>
