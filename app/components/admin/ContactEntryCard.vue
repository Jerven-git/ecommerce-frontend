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
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
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
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <input v-model="entry.email" type="email" class="input-field pl-9 text-sm" placeholder="hello@example.com" />
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Phone</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
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
