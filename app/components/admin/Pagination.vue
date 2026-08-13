<template>
  <nav
    v-if="totalItems > 0 && totalPages > 1"
    class="admin-pagination"
    :aria-label="`${itemLabel} pagination`"
  >
    <p class="sr-only" aria-live="polite">
      Showing {{ firstItem }} to {{ lastItem }} of {{ totalItems }} {{ itemLabel }}. Page {{ currentPage }} of {{ totalPages }}.
    </p>

    <div class="admin-pagination__controls">
      <button
        type="button"
        class="admin-pagination__button admin-pagination__direction"
        :disabled="currentPage <= 1"
        aria-label="Go to previous page"
        @click="$emit('goToPage', currentPage - 1)"
      >
        <Icon name="heroicons:chevron-left" class="admin-pagination__icon" aria-hidden="true" />
      </button>

      <div class="admin-pagination__pages">
        <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
          <span v-if="page === '…'" class="admin-pagination__ellipsis" aria-hidden="true">…</span>
          <button
            v-else
            type="button"
            class="admin-pagination__button admin-pagination__page"
            :class="{ 'is-current': page === currentPage }"
            :aria-label="`Go to page ${page}`"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="$emit('goToPage', page as number)"
          >
            {{ page }}
          </button>
        </template>
      </div>

      <button
        type="button"
        class="admin-pagination__button admin-pagination__direction"
        :disabled="currentPage >= totalPages"
        aria-label="Go to next page"
        @click="$emit('goToPage', currentPage + 1)"
      >
        <Icon name="heroicons:chevron-right" class="admin-pagination__icon" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  itemLabel?: string
}>(), {
  itemLabel: 'items',
})

defineEmits<{
  goToPage: [page: number]
}>()

const firstItem = computed(() => ((props.currentPage - 1) * props.perPage) + 1)
const lastItem = computed(() => Math.min(props.currentPage * props.perPage, props.totalItems))

const visiblePages = computed<(number | '…')[]>(() => {
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
    pages.push(page)
  }
  if (current < total - 2) pages.push('…')
  pages.push(total)

  return pages
})
</script>

<style scoped>
.admin-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  max-width: 100%;
  overflow-x: auto;
  padding: 0.125rem;
}

.admin-pagination__controls,
.admin-pagination__pages {
  display: flex;
  align-items: center;
}

.admin-pagination__controls {
  flex: 0 0 auto;
  gap: 0;
  padding: 0.25rem;
  border: 1px solid var(--admin-border);
  border-radius: 0.75rem;
  background: var(--admin-surface);
}

.admin-pagination__pages {
  gap: 0;
}

.admin-pagination__button {
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 9999px;
  color: var(--admin-text-muted);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1;
  transition: background-color 140ms ease, color 140ms ease, transform 120ms ease;
}

.admin-pagination__button:not(:disabled):hover {
  color: var(--admin-text);
  background: var(--admin-surface-soft);
}

.admin-pagination__button:not(:disabled):active {
  transform: scale(0.96);
}

.admin-pagination__button:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}

.admin-pagination__button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.admin-pagination__direction {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.admin-pagination__page {
  flex: 0 0 auto;
}

.admin-pagination__page.is-current,
.admin-pagination__page.is-current:hover {
  color: #ffffff;
  background: var(--color-primary-600);
}

.admin-pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  color: var(--admin-text-muted);
  font-size: 0.6875rem;
}

.admin-pagination__icon {
  width: 0.875rem;
  height: 0.875rem;
}

@media (prefers-reduced-motion: reduce) {
  .admin-pagination__button {
    transition: none;
  }

  .admin-pagination__button:not(:disabled):active {
    transform: none;
  }
}
</style>
