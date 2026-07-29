<template>
  <nav
    v-if="lastPage > 1"
    class="flex flex-col gap-3 border-t border-admin-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"
    :aria-label="label"
  >
    <p class="text-admin-muted">
      Page <span class="font-semibold text-admin-text">{{ currentPage }}</span>
      of <span class="font-semibold text-admin-text">{{ lastPage }}</span>
      <span v-if="total !== undefined"> · {{ total.toLocaleString() }} total</span>
    </p>
    <div class="grid grid-cols-2 gap-2 sm:flex">
      <AdminButton
        variant="secondary"
        :disabled="currentPage <= 1 || loading"
        @click="$emit('change', currentPage - 1)"
      >
        Previous
      </AdminButton>
      <AdminButton
        variant="secondary"
        :disabled="currentPage >= lastPage || loading"
        @click="$emit('change', currentPage + 1)"
      >
        Next
      </AdminButton>
    </div>
  </nav>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  currentPage: number
  lastPage: number
  total?: number
  loading?: boolean
  label?: string
}>(), {
  loading: false,
  label: 'Pagination',
})

defineEmits<{ change: [page: number] }>()
</script>
