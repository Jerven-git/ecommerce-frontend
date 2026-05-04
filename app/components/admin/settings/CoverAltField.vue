<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
    <div>
      <p class="text-sm font-semibold text-gray-900">{{ label }}</p>
      <p class="text-xs text-gray-400">Describe what the cover image shows. Used by screen readers and image search.</p>
    </div>
    <input
      v-model="model"
      type="text"
      maxlength="255"
      :placeholder="placeholder"
      class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
    />
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: '' })

defineProps<{
  label: string
  placeholder?: string
}>()
</script>
