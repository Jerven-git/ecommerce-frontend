<template>
  <div data-guide="settings-save" class="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-end gap-4">
      <!-- Action buttons -->
      <div class="grid grid-cols-2 gap-2 w-[240px] shrink-0">
        <button
          @click="emit('reset')"
          type="button"
          class="h-8 flex items-center justify-center text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="saving"
        >
          Reset
        </button>
        <button
          type="button"
          class="h-8 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="saving"
          @click="emit('save')"
        >
          <svg v-if="saving" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  saving: boolean
}>()

const emit = defineEmits<{
  save: []
  reset: []
}>()
</script>
