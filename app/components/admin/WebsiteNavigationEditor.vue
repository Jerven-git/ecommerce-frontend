<template>
  <section class="space-y-4" aria-labelledby="header-navigation-title">
    <div>
      <h3 id="header-navigation-title" class="text-sm font-semibold text-admin-text">Header navigation</h3>
      <p class="mt-1 text-xs leading-5 text-admin-muted">Choose the links customers see in your store’s desktop and mobile menus. Save and publish the website to make changes live.</p>
    </div>
    <p v-if="requestedPageUuid && !loading && !error" class="rounded-md bg-admin-soft px-3 py-2 text-xs leading-5 text-admin-text" role="status">{{ requestMessage }}</p>
    <div v-for="(item, index) in modelValue" :key="item.id" class="space-y-2 border-b border-admin-border pb-3">
      <div class="flex items-center gap-1">
        <label class="min-w-0 flex-1 text-xs font-semibold text-admin-text">Menu label
          <input :value="item.label" maxlength="80" required class="editor-input mt-1" :aria-label="`Menu label ${index + 1}`" @input="patch(index, { label: ($event.target as HTMLInputElement).value })" />
        </label>
        <button type="button" class="nav-control" :aria-label="`${item.visible ? 'Hide' : 'Show'} ${item.label}`" :aria-pressed="item.visible" @click="patch(index, { visible: !item.visible })"><Icon :name="item.visible ? 'heroicons:eye' : 'heroicons:eye-slash'" class="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" class="nav-control" :aria-label="`Remove ${item.label}`" @click="remove(index)"><Icon name="heroicons:trash" class="h-4 w-4" aria-hidden="true" /></button>
      </div>
      <div class="flex items-center justify-between gap-2">
        <p class="min-w-0 truncate text-xs text-admin-muted" :title="destination(item)">{{ destination(item) }}</p>
        <div class="flex shrink-0">
          <button type="button" class="nav-control" :disabled="index === 0" :aria-label="`Move ${item.label} up`" @click="move(index, -1)"><Icon name="heroicons:arrow-up" class="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" class="nav-control" :disabled="index === modelValue.length - 1" :aria-label="`Move ${item.label} down`" @click="move(index, 1)"><Icon name="heroicons:arrow-down" class="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </div>
      <p v-if="item.children.length" class="text-xs text-admin-muted">{{ item.children.length }} nested links retained</p>
    </div>
    <p v-if="!modelValue.length" class="text-xs leading-5 text-admin-muted">No menu links. Add a published page below.</p>
    <div v-if="loading" class="text-xs text-admin-muted" role="status">Loading your store’s pages…</div>
    <div v-else-if="error" class="space-y-2 text-xs text-admin-danger" role="alert"><p>{{ error }}</p><button type="button" class="min-h-11 font-semibold underline" @click="$emit('retry')">Try again</button></div>
    <div v-else class="space-y-3">
      <label for="header-page-picker" class="block text-xs font-semibold text-admin-text">Add menu link</label>
      <select id="header-page-picker" v-model="selectedPage" class="editor-input" :disabled="(!availablePages.length && !availableLinks.length) || atLimit">
        <option value="">Choose a destination</option>
        <optgroup v-if="availablePages.length" label="Published pages">
          <option v-for="page in availablePages" :key="page.uuid" :value="`page:${page.uuid}`">{{ page.title }} · {{ page.path }}</option>
        </optgroup>
        <optgroup v-if="availableLinks.length" label="Store pages">
          <option v-for="link in availableLinks" :key="link.path" :value="`link:${link.path}`">{{ link.label }} · {{ link.path }}</option>
        </optgroup>
      </select>
      <button type="button" class="admin-focus inline-flex min-h-11 items-center gap-2 rounded-lg border border-admin-border px-3 text-xs font-semibold text-admin-accent-strong hover:bg-admin-soft disabled:cursor-not-allowed disabled:opacity-40" :disabled="!selectedPage || atLimit" @click="add"><Icon name="heroicons:plus" class="h-4 w-4" aria-hidden="true" />Add to header</button>
      <p v-if="atLimit" class="text-xs leading-5 text-admin-muted">The header has reached its navigation limit. Remove a link to add another.</p>
      <p v-else-if="!availablePages.length" class="text-xs leading-5 text-admin-muted">{{ pages.some(page => page.is_published) ? 'All published pages are already in your navigation.' : 'Publish a page first, then add it here.' }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ModuleKey } from '~/composables/useSiteConfig'
import type { WebsiteNavigationItem } from '~/composables/useSiteConfig'
import type { WebsitePageSummary } from '~/types/websitePage'
const props = withDefaults(defineProps<{
  modelValue: WebsiteNavigationItem[]
  pages: WebsitePageSummary[]
  requestedPageUuid?: string
  loading?: boolean
  error?: string
}>(), { requestedPageUuid: '', loading: false, error: '' })
const emit = defineEmits<{ 'update:modelValue': [value: WebsiteNavigationItem[]]; retry: [] }>()
const selectedPage = ref('')
const { isEnabled } = useModules()
const storeLinks: Array<{ label: string; path: string; module?: ModuleKey }> = [
  { label: 'Home', path: '/' }, { label: 'Shop', path: '/shop', module: 'shop' },
  { label: 'Services', path: '/services', module: 'services' }, { label: 'Blog', path: '/blog', module: 'blog' },
  { label: 'About', path: '/about', module: 'about' }, { label: 'Contact', path: '/contact', module: 'contact' },
  { label: 'Commissions', path: '/commissions', module: 'commissions' }, { label: 'Gift Cards', path: '/gift-cards', module: 'gift_cards' },
]
const availableLinks = computed(() => storeLinks.filter(link => (!link.module || isEnabled(link.module))
  && !allItems(props.modelValue).some(item => item.kind === 'link' && item.value === link.path)))
function allItems(items: WebsiteNavigationItem[]): WebsiteNavigationItem[] {
  return items.flatMap(item => [item, ...allItems(item.children ?? [])])
}
function linksToPage(item: WebsiteNavigationItem, page: WebsitePageSummary) {
  return (item.kind === 'page' && item.value === page.uuid)
    || (item.kind === 'link' && (item.value === page.path || Boolean(page.published_path && item.value === page.published_path)))
}
const atLimit = computed(() => props.modelValue.length >= 20 || allItems(props.modelValue).length >= 100)
const availablePages = computed(() => props.pages.filter(page => page.is_published
  && !allItems(props.modelValue).some(item => linksToPage(item, page))))
const requestedPage = computed(() => props.pages.find(page => page.uuid === props.requestedPageUuid))
const requestedPageLinked = computed(() => Boolean(requestedPage.value && allItems(props.modelValue).some(item =>
  linksToPage(item, requestedPage.value!),
)))
const requestMessage = computed(() => {
  if (!requestedPage.value?.is_published) return 'This page is unavailable or not published. Choose another published page below.'
  if (requestedPageLinked.value) return 'This page already has a link in the website draft. Check its visibility and position, then save and publish to apply your changes.'
  if (atLimit.value) return 'Remove a menu link before adding this page.'
  return `Ready to add “${requestedPage.value.title}”. Choose Add to header, then save and publish the website draft.`
})
let handledRequest = ''
let lastRequest = ''
watch([requestedPage, () => props.requestedPageUuid, () => props.loading, () => props.error], ([page, uuid]) => {
  if (uuid !== lastRequest) { selectedPage.value = ''; handledRequest = ''; lastRequest = uuid }
  if (!page?.is_published || props.loading || props.error || handledRequest === page.uuid) return
  if (!requestedPageLinked.value && !atLimit.value) selectedPage.value = `page:${page.uuid}`
  handledRequest = page.uuid
}, { immediate: true })
function destination(item: WebsiteNavigationItem) {
  if (item.kind === 'group') return 'Menu group'
  if (item.kind === 'page') return props.pages.find(page => page.uuid === item.value)?.path ?? 'Page unavailable'
  return item.value || 'No destination'
}
function patch(index: number, changes: Partial<WebsiteNavigationItem>) {
  emit('update:modelValue', props.modelValue.map((item, i) => i === index ? { ...item, ...changes } : item))
}
function remove(index: number) { emit('update:modelValue', props.modelValue.filter((_, i) => i !== index)) }
function move(index: number, direction: number) {
  const target = index + direction
  if (target < 0 || target >= props.modelValue.length) return
  const next = [...props.modelValue]
  const [item] = next.splice(index, 1)
  if (item) next.splice(target, 0, item)
  emit('update:modelValue', next)
}
function add() {
  if (atLimit.value) return
  const page = availablePages.value.find(page => `page:${page.uuid}` === selectedPage.value)
  const link = availableLinks.value.find(link => `link:${link.path}` === selectedPage.value)
  if (!page && !link) return
  emit('update:modelValue', [...props.modelValue, { id: `nav-${crypto.randomUUID()}`, label: (page?.title ?? link!.label).slice(0, 80), kind: page ? 'page' : 'link', value: page?.uuid ?? link!.path, visible: true, children: [] }])
  selectedPage.value = ''
}

</script>

<style scoped>
.editor-input { display: block; width: 100%; min-height: 2.75rem; padding: .625rem .75rem; border: 1px solid var(--admin-border); border-radius: .75rem; background: var(--admin-surface); color: var(--admin-text); font-size: .8125rem; line-height: 1.25rem; }
.editor-input:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
@media (max-width: 767px) { .editor-input { font-size: 1rem; } }

.nav-control { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 2.75rem; min-height: 2.75rem; color: var(--admin-muted); border-radius: .375rem; }
.nav-control:hover { background: var(--admin-soft); color: var(--admin-text); }
.nav-control:focus-visible { outline: 2px solid var(--admin-accent); outline-offset: -2px; }
.nav-control:disabled { opacity: .3; cursor: not-allowed; }
</style>
