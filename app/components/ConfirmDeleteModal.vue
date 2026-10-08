<template>
  <BaseModal :open="open" :aria-label="title" size="sm" hide-close body-class="p-6" @close="$emit('cancel')">
    <!-- Icon -->
    <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon name="heroicons:trash" class="w-6 h-6 text-red-500" aria-hidden="true" />
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
          :disabled="deleting"
          @click="$emit('confirm')"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors"
        >
          <Icon name="heroicons:arrow-path" v-if="deleting" class="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          {{ deleting ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
  deleting?: boolean
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
