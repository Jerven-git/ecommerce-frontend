<template>
  <div class="space-y-4 border-t border-admin-border pt-5">
    <div>
      <h3 class="text-xs font-semibold uppercase tracking-[0.04em] text-admin-muted">Content source</h3>
      <p class="mt-1 text-xs leading-5 text-admin-muted">Only eligible content owned by this store is available.</p>
    </div>

    <label class="block text-xs font-semibold text-admin-text">
      Source
      <select :value="block.settings.source" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" @change="setSource">
        <option v-for="source in sources" :key="source" :value="source">{{ sourceLabel(source) }}</option>
      </select>
    </label>

    <label class="block text-xs font-semibold text-admin-text">
      Maximum shown
      <input :value="block.settings.limit" type="number" min="1" max="24" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" @input="setLimit" />
    </label>

    <div v-if="block.settings.source === 'category'" class="space-y-2">
      <label class="block text-xs font-semibold text-admin-text">
        Category
        <select :value="block.settings.category_id ?? ''" class="mt-2 min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface px-3 text-base text-admin-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" @change="setCategory">
          <option value="">Choose a category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.title }}</option>
        </select>
      </label>
      <p v-if="!loading && categories.length === 0" class="text-xs leading-5 text-admin-muted">No categories are available for {{ contentLabel }}.</p>
    </div>

    <template v-if="block.settings.source === 'selected'">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <h4 class="text-xs font-semibold text-admin-text">Selected {{ contentLabel }}</h4>
          <span class="text-xs tabular-nums text-admin-muted">{{ selectedIds.length }}/24</span>
        </div>
        <div v-if="selectedItems.length" class="divide-y divide-admin-border border-y border-admin-border">
          <div v-for="(item, index) in selectedItems" :key="item.id" class="flex min-h-14 items-center gap-2 py-1.5">
            <img v-if="item.image_url" :src="item.image_url" alt="" class="h-10 w-10 shrink-0 rounded-lg object-cover" loading="lazy" />
            <span v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-admin-soft text-admin-muted"><Icon :name="contentIcon" class="h-4 w-4" aria-hidden="true" /></span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-xs font-semibold text-admin-text">{{ item.title }}</span>
              <span v-if="item.unavailable" class="mt-0.5 block text-xs text-admin-warning">Unavailable on the storefront</span>
            </span>
            <span class="flex shrink-0 items-center">
              <button type="button" class="admin-focus flex h-11 w-9 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-soft hover:text-admin-text disabled:opacity-35" :disabled="index === 0" :aria-label="'Move ' + item.title + ' up'" @click="moveSelected(index, -1)"><Icon name="heroicons:chevron-up" class="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" class="admin-focus flex h-11 w-9 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-soft hover:text-admin-text disabled:opacity-35" :disabled="index === selectedItems.length - 1" :aria-label="'Move ' + item.title + ' down'" @click="moveSelected(index, 1)"><Icon name="heroicons:chevron-down" class="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" class="admin-focus flex h-11 w-9 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-danger-soft hover:text-admin-danger" :aria-label="'Remove ' + item.title" @click="removeSelected(item.id)"><Icon name="heroicons:x-mark" class="h-4 w-4" aria-hidden="true" /></button>
            </span>
          </div>
        </div>
        <div v-else class="rounded-xl border border-dashed border-admin-border px-3 py-4 text-center">
          <p class="text-xs font-medium text-admin-text">No {{ contentLabel }} selected</p>
          <p class="mt-1 text-xs leading-5 text-admin-muted">Search below and add the records this section should show.</p>
        </div>
      </div>

      <label class="block text-xs font-semibold text-admin-text">
        Find {{ contentLabel }}
        <span class="relative mt-2 block">
          <Icon name="heroicons:magnifying-glass" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
          <input v-model="search" type="search" class="min-h-11 w-full rounded-xl border border-admin-border bg-admin-surface py-2 pl-9 pr-3 text-base text-admin-text placeholder:text-admin-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :placeholder="'Search ' + contentLabel" />
        </span>
      </label>

      <div v-if="loading" class="space-y-2" role="status" aria-live="polite">
        <span class="sr-only">Loading {{ contentLabel }}…</span>
        <div v-for="row in 3" :key="row" class="flex min-h-12 animate-pulse items-center gap-3 border-b border-admin-border py-2 motion-reduce:animate-none">
          <span class="h-9 w-9 rounded-lg bg-admin-soft" />
          <span class="h-3 flex-1 rounded bg-admin-soft" />
        </div>
      </div>
      <div v-else-if="error" class="rounded-xl bg-admin-danger-soft p-3" role="alert">
        <p class="text-xs leading-5 text-admin-danger">{{ error }}</p>
        <button type="button" class="admin-focus mt-2 min-h-11 rounded-lg px-3 text-xs font-semibold text-admin-danger hover:bg-admin-surface" @click="loadOptions">Try again</button>
      </div>
      <div v-else-if="availableItems.length" class="divide-y divide-admin-border border-y border-admin-border">
        <div v-for="item in availableItems" :key="item.id" class="flex min-h-14 items-center gap-2 py-1.5">
          <img v-if="item.image_url" :src="item.image_url" alt="" class="h-10 w-10 shrink-0 rounded-lg object-cover" loading="lazy" />
          <span v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-admin-soft text-admin-muted"><Icon :name="contentIcon" class="h-4 w-4" aria-hidden="true" /></span>
          <span class="min-w-0 flex-1 truncate text-xs font-semibold text-admin-text">{{ item.title }}</span>
          <button type="button" class="admin-focus min-h-11 shrink-0 rounded-lg px-3 text-xs font-semibold text-admin-accent-strong hover:bg-admin-accent-soft disabled:cursor-not-allowed disabled:opacity-45" :disabled="selectedIds.length >= 24" @click="addSelected(item)">Add</button>
        </div>
      </div>
      <p v-else class="rounded-xl border border-dashed border-admin-border px-3 py-4 text-center text-xs leading-5 text-admin-muted">No eligible {{ contentLabel }} match this search.</p>
    </template>

    <p v-else-if="!loading && !error" class="rounded-xl bg-admin-soft px-3 py-2 text-xs leading-5 text-admin-muted">{{ automaticSourceCopy }}</p>
    <p v-if="block.settings.source !== 'selected' && error" class="rounded-xl bg-admin-danger-soft px-3 py-2 text-xs text-admin-danger" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type {
  WebsitePageBlock,
  WebsitePageCollectionItem,
  WebsitePageConnectedBlockType,
  WebsitePageContentCategory,
} from '~/types/websitePage'

type PickerItem = WebsitePageCollectionItem & { unavailable?: boolean }

const props = defineProps<{
  block: WebsitePageBlock
  sources: string[]
}>()
const emit = defineEmits<{
  patch: [settings: Record<string, unknown>]
}>()

const pagesApi = useWebsitePages()
const search = ref('')
const items = ref<WebsitePageCollectionItem[]>([])
const categories = ref<WebsitePageContentCategory[]>([])
const knownItems = ref<Record<number, WebsitePageCollectionItem>>({})
const loading = ref(false)
const error = ref('')
let requestSequence = 0
let searchTimer: ReturnType<typeof setTimeout> | null = null

const type = computed(() => props.block.type as WebsitePageConnectedBlockType)
const selectedIds = computed<number[]>(() => Array.isArray(props.block.settings.item_ids)
  ? props.block.settings.item_ids.map(Number).filter(id => Number.isInteger(id) && id > 0).slice(0, 24)
  : [])
const selectedItems = computed<PickerItem[]>(() => selectedIds.value.map(id => knownItems.value[id] ?? {
  id,
  title: 'Unavailable item #' + id,
  summary: null,
  url: '',
  image_url: null,
  unavailable: true,
}))
const availableItems = computed(() => items.value.filter(item => !selectedIds.value.includes(item.id)))
const contentLabel = computed(() => ({
  'product-list': 'products',
  'collection-list': 'collections',
  'service-list': 'services',
  'blog-post-list': 'blog posts',
})[type.value])
const contentIcon = computed(() => ({
  'product-list': 'heroicons:cube',
  'collection-list': 'heroicons:tag',
  'service-list': 'heroicons:wrench-screwdriver',
  'blog-post-list': 'heroicons:newspaper',
})[type.value])
const automaticSourceCopy = computed(() => {
  if (props.block.settings.source === 'category' && !props.block.settings.category_id) {
    return 'Choose a category to populate this section and its preview.'
  }
  return 'The preview uses the current eligible ' + contentLabel.value + ' for this source.'
})

function sourceLabel(source: string) {
  return {
    selected: 'Hand-picked',
    recent: 'Newest',
    featured: 'Featured',
    category: 'Category',
    all: 'All',
  }[source] || source
}
function patch(settings: Record<string, unknown>) {
  emit('patch', settings)
}
function setSource(event: Event) {
  patch({ source: (event.target as HTMLSelectElement).value })
}
function setLimit(event: Event) {
  const value = Math.min(24, Math.max(1, Number((event.target as HTMLInputElement).value) || 1))
  patch({ limit: value })
}
function setCategory(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  patch({ category_id: Number.isInteger(value) && value > 0 ? value : null })
}
function addSelected(item: WebsitePageCollectionItem) {
  if (selectedIds.value.includes(item.id) || selectedIds.value.length >= 24) return
  knownItems.value[item.id] = item
  patch({ item_ids: [...selectedIds.value, item.id] })
}
function removeSelected(id: number) {
  patch({ item_ids: selectedIds.value.filter(itemId => itemId !== id) })
}
function moveSelected(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= selectedIds.value.length) return
  const next = [...selectedIds.value]
  const [id] = next.splice(index, 1)
  if (id) next.splice(target, 0, id)
  patch({ item_ids: next })
}
async function loadOptions() {
  const sequence = ++requestSequence
  loading.value = true
  error.value = ''
  try {
    const response = await pagesApi.contentOptions({
      type: type.value,
      search: search.value.trim() || undefined,
      ids: selectedIds.value,
      limit: 24,
    })
    if (sequence !== requestSequence) return
    items.value = response.data.items
    categories.value = response.data.categories
    for (const item of response.data.items) knownItems.value[item.id] = item
  } catch (requestError: any) {
    if (sequence !== requestSequence) return
    error.value = requestError?.data?.message || 'The available content could not be loaded.'
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}
function scheduleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { void loadOptions() }, 250)
}

watch(() => [type.value, selectedIds.value.join(',')], () => { void loadOptions() }, { immediate: true })
watch(search, scheduleSearch)
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
  requestSequence += 1
})
</script>
