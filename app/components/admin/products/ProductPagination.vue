<template>
  <div class="mt-6 flex items-center justify-between">
    <p class="text-sm text-gray-500">
      Showing {{ ((currentPage - 1) * perPage) + 1 }}–{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} products
    </p>
    <div class="flex items-center gap-1">
      <button
        @click="$emit('goToPage', currentPage - 1)"
        :disabled="currentPage <= 1"
        class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <template v-for="page in visiblePages" :key="page">
        <span v-if="page === '...'" class="px-2 text-gray-400 text-sm">...</span>
        <button
          v-else
          @click="$emit('goToPage', page as number)"
          class="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
          :class="page === currentPage
            ? 'bg-primary-600 text-white border-primary-600'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
        >
          {{ page }}
        </button>
      </template>
      <button
        @click="$emit('goToPage', currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  visiblePages: (number | string)[]
}>()

defineEmits<{
  goToPage: [page: number]
}>()
</script>
