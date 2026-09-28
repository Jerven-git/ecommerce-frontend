<template>
  <nav
    v-if="lastPage > 1"
    class="flex flex-col gap-3 border-t border-admin-border bg-admin-soft/30 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"
    :aria-label="label"
  >
    <p class="flex items-center gap-2 text-admin-muted">
      <span class="hidden sm:inline-flex h-7 items-center rounded-full border border-admin-border bg-admin-surface px-2.5 text-xs font-semibold text-admin-text">Page {{ currentPage }} / {{ lastPage }}</span>
      <span class="sm:hidden">Page <span class="font-semibold text-admin-text">{{ currentPage }}</span> of <span class="font-semibold text-admin-text">{{ lastPage }}</span></span>
      <span v-if="total !== undefined" class="text-xs">· {{ total.toLocaleString() }} total</span>
    </p>
    <div class="grid grid-cols-2 gap-2 sm:flex">
      <button type="button" class="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-admin-border bg-admin-surface px-4 text-sm font-medium text-admin-text hover:bg-admin-soft disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent" :disabled="currentPage <= 1 || loading" :aria-label="`Go to previous page, page ${currentPage - 1}`" title="Previous page" @click="$emit('change', currentPage - 1)">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Previous
      </button>
      <button type="button" class="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-admin-border bg-admin-surface px-4 text-sm font-medium text-admin-text hover:bg-admin-soft disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent" :disabled="currentPage >= lastPage || loading" :aria-label="`Go to next page, page ${currentPage + 1}`" title="Next page" @click="$emit('change', currentPage + 1)">
        Next
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </button>
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
