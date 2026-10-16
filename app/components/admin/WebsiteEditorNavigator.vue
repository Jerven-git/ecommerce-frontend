<template>
  <BaseModal :open="open" title="Find content" subtitle="Search pages and sections" size="md" body-class="p-0" @close="$emit('close')">
    <div class="border-b border-admin-border p-3">
      <label class="relative block">
        <span class="sr-only">Search pages and sections</span>
        <Icon name="heroicons:magnifying-glass" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
        <input
          ref="searchInput"
          v-model="query"
          type="search"
          class="min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface py-2 pl-9 pr-3 text-xs text-admin-text outline-none placeholder:text-admin-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
          placeholder="Search pages and sections"
          autocomplete="off"
          autofocus
        />
      </label>
    </div>

    <div class="max-h-80 overflow-y-auto p-2">
      <p v-if="!filteredItems.length" class="px-3 py-8 text-center text-xs text-admin-muted">No matching content found.</p>
      <button
        v-for="item in filteredItems"
        :key="`${item.page}:${item.section}`"
        type="button"
        class="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-admin-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
        :class="item.page === currentPage && item.section === currentSection ? 'bg-admin-accent-soft' : ''"
        @click="selectItem(item)"
      >
        <Icon :name="item.icon" class="h-4 w-4 shrink-0" :class="item.page === currentPage && item.section === currentSection ? 'text-admin-accent-strong' : 'text-admin-muted'" aria-hidden="true" />
        <span class="min-w-0 flex-1">
          <span class="block truncate text-xs font-semibold text-admin-text">{{ item.sectionLabel }}</span>
          <span class="block truncate text-xs text-admin-muted">{{ item.pageLabel }}</span>
        </span>
        <span v-if="item.disabled" class="shrink-0 text-[11px] font-medium text-admin-warning">Disabled</span>
        <Icon v-else name="heroicons:arrow-right" class="h-3.5 w-3.5 shrink-0 text-admin-muted" aria-hidden="true" />
      </button>
    </div>

    <template #footer>
      <p class="text-xs text-admin-muted"><kbd class="rounded border border-admin-border bg-admin-soft px-1.5 py-0.5 font-sans">Ctrl/⌘ K</kbd> opens this navigator anywhere in the editor.</p>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { WebsiteEditorNavigationItem, WebsiteEditorPageId } from '~/utils/websiteEditorPages'

const props = defineProps<{
  open: boolean
  items: WebsiteEditorNavigationItem[]
  currentPage: WebsiteEditorPageId
  currentSection: string
}>()

const emit = defineEmits<{
  close: []
  navigate: [item: WebsiteEditorNavigationItem]
}>()

const query = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const filteredItems = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  if (!term) return props.items
  return props.items.filter(item => `${item.pageLabel} ${item.sectionLabel}`.toLocaleLowerCase().includes(term))
})

watch(() => props.open, async open => {
  if (!open) {
    query.value = ''
    return
  }
  await nextTick()
  searchInput.value?.focus()
})

function selectItem(item: WebsiteEditorNavigationItem) {
  emit('navigate', item)
  emit('close')
}
</script>
