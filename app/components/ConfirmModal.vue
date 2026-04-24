<template>
  <BaseModal :open="open" size="sm" hide-close body-class="p-6" @close="$emit('cancel')">
    <!-- Icon -->
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
      :class="{
        'bg-red-50': variant === 'danger',
        'bg-green-50': variant === 'success',
        'bg-amber-50': variant === 'warning',
      }"
    >
      <slot name="icon">
        <svg
          class="w-6 h-6"
          :class="{
            'text-red-500': variant === 'danger',
            'text-green-500': variant === 'success',
            'text-amber-500': variant === 'warning',
          }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </slot>
    </div>

    <!-- Text -->
    <h2 class="text-base font-semibold text-gray-900 text-center">{{ title }}</h2>
    <p class="text-sm text-gray-500 text-center mt-1">{{ message }}</p>

    <template #footer>
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="loading"
          @click="$emit('confirm')"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 rounded-lg transition-colors"
          :class="{
            'bg-red-600 hover:bg-red-700': variant === 'danger',
            'bg-green-600 hover:bg-green-700': variant === 'success',
            'bg-amber-500 hover:bg-amber-600': variant === 'warning',
          }"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  title: string
  message: string
  confirmText?: string
  loadingText?: string
  loading?: boolean
  variant?: 'danger' | 'success' | 'warning'
}>(), {
  confirmText: 'Confirm',
  loadingText: 'Processing…',
  loading: false,
  variant: 'danger',
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
