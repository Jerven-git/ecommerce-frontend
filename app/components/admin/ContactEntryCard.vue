<template>
  <div class="relative p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
    <!-- Remove button -->
    <button
      v-if="showRemove"
      type="button"
      @click="$emit('remove')"
      class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
      title="Remove entry"
    >
      <Icon name="heroicons:x-mark" class="w-4 h-4" aria-hidden="true" />
    </button>

    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1">Label</label>
      <input
        v-model="entry.label"
        type="text"
        class="input-field text-sm"
        placeholder="e.g. Sales, Support, Main Office"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Icon name="heroicons:envelope" class="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <input v-model="entry.email" type="email" class="input-field pl-9 text-sm" placeholder="hello@example.com" />
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Phone</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Icon name="heroicons:phone" class="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <input v-model="entry.phone" type="tel" class="input-field pl-9 text-sm" placeholder="+1 (555) 000-0000" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  entry: { label: string; email: string; phone: string }
  showRemove: boolean
}>()

defineEmits<{
  remove: []
}>()
</script>
