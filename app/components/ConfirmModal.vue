<template>
  <BaseModal :open="open" :aria-label="title" size="sm" hide-close body-class="p-6" @close="$emit('cancel')">
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
        <Icon name="heroicons:exclamation-triangle" class="w-6 h-6" :class="{ 'text-red-500': variant === 'danger', 'text-green-500': variant === 'success', 'text-amber-500': variant === 'warning', }" aria-hidden="true" />
      </slot>
    </div>

    <!-- Text -->
    <h2 class="font-semibold text-gray-900 text-center" :class="compact ? 'font-sans text-sm' : 'text-base'">{{ title }}</h2>
    <p class="text-gray-500 text-center mt-1" :class="compact ? 'font-sans text-xs leading-5' : 'text-sm'">{{ message }}</p>

    <template #footer>
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="min-h-11 flex-1 px-4 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          :class="compact ? 'font-sans text-xs' : 'text-sm'"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="loading"
          @click="$emit('confirm')"
          class="min-h-11 flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white disabled:opacity-60 rounded-lg transition-colors"
          :class="{
            'bg-red-600 hover:bg-red-700': variant === 'danger',
            'bg-green-600 hover:bg-green-700': variant === 'success',
            'bg-amber-500 hover:bg-amber-600': variant === 'warning',
            'font-sans': compact,
            'text-xs': compact,
            'text-sm': !compact,
          }"
        >
          <Icon name="heroicons:arrow-path" v-if="loading" class="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
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
  compact?: boolean
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
