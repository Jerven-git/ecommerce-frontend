<template>
  <dialog ref="dialog" class="section-library admin-shell" :class="themeClass" :aria-labelledby="titleId" @cancel.prevent="$emit('close')" @click="closeOnBackdrop">
    <header class="library-header">
      <div><h2 :id="titleId" class="text-base font-semibold">Add a section</h2><p class="mt-1 text-xs text-admin-muted">Choose a design, make it yours.</p></div>
      <button type="button" class="library-icon" aria-label="Close section library" @click="$emit('close')"><Icon name="heroicons:x-mark" class="h-5 w-5" aria-hidden="true" /></button>
    </header>
    <div class="library-body">
      <aside class="library-catalog" aria-label="Section library">
        <label class="library-search"><Icon name="heroicons:magnifying-glass" class="h-4 w-4 shrink-0 text-admin-muted" aria-hidden="true" /><input ref="searchInput" v-model="query" type="search" aria-label="Search sections" placeholder="Search sections" autocomplete="off" /></label>
        <label class="sr-only" for="section-library-group">Section category</label>
        <select id="section-library-group" v-model="group" class="library-group"><option value="all">All sections</option><option v-for="category in groups" :key="category">{{ category }}</option></select>
        <div class="library-list">
          <p v-if="!filtered.length" class="p-4 text-sm text-admin-muted" role="status">No sections found. Try another search or category.</p>
          <template v-for="category in groups" :key="category">
            <div v-if="filtered.some(item => websitePageSectionGroup(item.type) === category)" class="mb-4">
              <h3 class="mb-1 px-3 text-xs font-semibold text-admin-muted">{{ category }}</h3>
              <button v-for="definition in filtered.filter(item => websitePageSectionGroup(item.type) === category)" :key="definition.type" type="button" class="library-row" :aria-pressed="selectedType === definition.type" @click="choose(definition)">
                <Icon :name="definition.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                <span class="min-w-0 flex-1"><span class="block text-sm font-semibold">{{ definition.label }}</span><span class="mt-1 block text-xs text-admin-muted">{{ definition.variants.length }} layouts<span v-if="definition.content_mode === 'connected'"> · Store content</span></span></span>
                <Icon name="heroicons:chevron-right" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </template>
        </div>
      </aside>
      <section v-if="selected && exampleDocument" class="library-detail" aria-label="Section design preview">
        <div class="library-description"><h3 class="text-lg font-semibold">{{ selected.label }}</h3><p class="mt-1 max-w-xl text-sm leading-6 text-admin-muted">{{ selected.description }}</p></div>
        <div class="library-preview-toolbar">
          <span class="text-xs font-medium text-admin-muted">Layout preview</span>
          <div class="library-viewports" role="group" aria-label="Preview viewport">
            <button type="button" :aria-pressed="previewWidth === 1100" @click="previewWidth = 1100"><Icon name="heroicons:computer-desktop" class="h-4 w-4" aria-hidden="true" />Desktop</button>
            <button type="button" :aria-pressed="previewWidth === 390" @click="previewWidth = 390"><Icon name="heroicons:device-phone-mobile" class="h-4 w-4" aria-hidden="true" />Mobile</button>
          </div>
        </div>
        <div class="library-preview"><AdminWebsitePagePreview fit-canvas :canvas-width="previewWidth" iframe-title="Section layout preview" title="Section preview" :document="exampleDocument" :media="{}" :collections="exampleCollections" class="h-full w-full rounded-lg" /></div>
        <div class="library-layouts"><AdminWebsitePageLayoutPicker v-model="selectedVariant" :variants="selected.variants" :type="selected.type" /></div>
        <p class="px-5 pb-4 text-xs leading-5 text-admin-muted">Example layout with editable starter text. Add your own images and factual figures. Connected sections use your store’s published content after adding.</p>
      </section>
      <div v-else class="flex items-center justify-center p-8 text-sm text-admin-muted">Choose a section to preview its layouts.</div>
    </div>
    <footer class="library-footer"><p class="hidden text-xs text-admin-muted sm:block">New sections are added to your private draft.</p><button type="button" class="library-add" :disabled="!selected" @click="add"><Icon name="heroicons:plus" class="h-4 w-4" aria-hidden="true" />Add section</button></footer>
  </dialog>
</template>

<script setup lang="ts">
import type { WebsitePageBlockDefinition, WebsitePageDocument } from '~/types/websitePage'
import type { WebsiteBlockType } from '~/themes/contracts'
import { websitePageExampleBlock, websitePageExampleCollections, websitePageSectionGroup } from '~/utils/websitePageStarters'

const props = defineProps<{ open: boolean, definitions: WebsitePageBlockDefinition[] }>()
const emit = defineEmits<{ close: [], add: [type: WebsiteBlockType, variant: string | null] }>()
const { themeClass } = useAdminAppearance()
const titleId = useId()
const dialog = ref<HTMLDialogElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const previewWidth = ref(1100)
const query = ref('')
const group = ref('all')
const selectedType = ref<string>('hero')
const selectedVariant = ref<string | null>(null)
let previousFocus: HTMLElement | null = null
let previousOverflow = ''
const groups = ['Banners', 'Text and images', 'Lists and galleries', 'Forms', 'Store content']
const filtered = computed(() => props.definitions.filter(definition => (group.value === 'all' || websitePageSectionGroup(definition.type) === group.value) && `${definition.label} ${definition.description}`.toLowerCase().includes(query.value.trim().toLowerCase())))
const selected = computed(() => filtered.value.find(definition => definition.type === selectedType.value) ?? filtered.value[0])
const exampleBlock = computed(() => selected.value ? websitePageExampleBlock(selected.value, selectedVariant.value ?? selected.value.default_variant) : null)
const exampleDocument = computed<WebsitePageDocument | null>(() => exampleBlock.value ? { blocks: [exampleBlock.value], seo: { title: null, description: null, noindex: false, og_image_media_id: null }, localized_content: {} } : null)
const exampleCollections = computed(() => exampleBlock.value ? websitePageExampleCollections(exampleBlock.value) : {})
function choose(definition: WebsitePageBlockDefinition) { selectedType.value = definition.type; selectedVariant.value = definition.default_variant }
watch(() => selected.value?.type, () => { selectedVariant.value = selected.value?.default_variant ?? null })
function add() { if (selected.value) emit('add', selected.value.type, selectedVariant.value ?? selected.value.default_variant) }
function closeOnBackdrop(event: MouseEvent) {
  if (event.target !== dialog.value) return
  const bounds = dialog.value!.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) emit('close')
}
function restore() { document.body.style.overflow = previousOverflow; if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); previousFocus = null }
watch(() => props.open, async open => {
  await nextTick()
  if (open && dialog.value && !dialog.value.open) {
    previousFocus = document.activeElement as HTMLElement | null
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    query.value = ''; group.value = 'all'
    if (props.definitions[0]) choose(props.definitions[0])
    dialog.value.showModal()
    searchInput.value?.focus()
  } else if (!open && dialog.value?.open) { dialog.value.close(); restore() }
}, { immediate: true })
onBeforeUnmount(() => { if (dialog.value?.open) { dialog.value.close(); restore() } })
</script>

<style scoped>
.section-library { width: min(72rem, calc(100vw - 3rem)); max-width: none; max-height: calc(100dvh - 3rem); padding: 0; border: 1px solid var(--admin-border); border-radius: 1rem; background: var(--admin-surface); color: var(--admin-text); box-shadow: var(--admin-shadow-transient); font-family: ui-sans-serif, system-ui, sans-serif; }
.section-library[open] { display: flex; flex-direction: column; }
.section-library::backdrop { background: rgb(15 23 42 / .45); }
.library-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--admin-border); }
.library-icon { display: flex; align-items: center; justify-content: center; width: 2.75rem; min-height: 2.75rem; border-radius: .5rem; color: var(--admin-text-muted); }
.library-icon:hover { background: var(--admin-surface-soft); }
.library-body { display: grid; grid-template-columns: 17rem minmax(0, 1fr); min-height: 0; height: min(42rem, calc(100dvh - 14rem)); }
.library-catalog { display: flex; flex-direction: column; min-height: 0; padding: 1rem .5rem 0; border-right: 1px solid var(--admin-border); }
.library-search { display: flex; align-items: center; gap: .5rem; margin: 0 .5rem .75rem; padding: 0 .75rem; border: 1px solid var(--admin-border); border-radius: .5rem; }
.library-search input { width: 100%; min-width: 0; min-height: 2.75rem; border: 0; background: transparent; font-size: .8125rem; color: var(--admin-text); outline: none; box-shadow: none; }
.library-search input:focus { outline: none; box-shadow: none; }
.library-search:focus-within { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
.library-group { min-height: 2.75rem; margin: 0 .5rem 1.25rem; padding: 0 .5rem; border: 1px solid var(--admin-border); border-radius: .5rem; background: var(--admin-surface); font-size: .8125rem; }
.library-list { min-height: 0; flex: 1; overflow-y: auto; }
.library-row { display: flex; align-items: center; gap: .75rem; width: 100%; min-height: 4.25rem; padding: .75rem; border-radius: .5rem; text-align: left; }
.library-row:hover { background: var(--admin-surface-soft); }
.library-row[aria-pressed="true"] { color: var(--admin-accent-strong); background: var(--admin-accent-soft); }
.library-detail { display: flex; flex-direction: column; min-height: 0; overflow-y: auto; }
.library-description { padding: 1.25rem; }
.library-preview { height: 25rem; min-height: 15rem; flex-shrink: 0; padding: 1rem; margin: 0 1.25rem; background: var(--admin-surface-soft); border-radius: .75rem; }
.library-preview-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .5rem; padding: 0 1.25rem .75rem; }
.library-viewports { display: flex; gap: .25rem; padding: .25rem; border: 1px solid var(--admin-border); border-radius: .5rem; }
.library-viewports button { display: inline-flex; align-items: center; gap: .375rem; min-height: 2rem; padding: .25rem .5rem; border-radius: .25rem; color: var(--admin-text-muted); font-size: .75rem; }
.library-viewports button[aria-pressed="true"] { background: var(--admin-accent-soft); color: var(--admin-accent-strong); }
.library-layouts { padding: 1rem 1.25rem; }
.library-layouts :deep(.layout-options) { grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr)); }
.library-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .75rem 1.25rem; border-top: 1px solid var(--admin-border); }
.library-add { display: inline-flex; justify-content: center; align-items: center; gap: .5rem; min-height: 2.75rem; padding: 0 1.25rem; border-radius: .5rem; background: var(--admin-accent); color: var(--admin-on-accent); font-size: .8125rem; font-weight: 600; }
.library-add:hover { background: var(--admin-accent-strong); }
.library-add:disabled { opacity: .5; cursor: not-allowed; }
:is(button, select):focus-visible { outline: 2px solid var(--admin-accent); outline-offset: 2px; }
@media (max-width: 767px) {
  .section-library { width: calc(100vw - 1rem); max-height: calc(100dvh - 1rem); }
  .library-header { padding: .75rem; }
  .library-body { display: flex; flex-direction: column; height: calc(100dvh - 12rem); overflow-y: auto; }
  .library-catalog { flex-shrink: 0; border-right: 0; border-bottom: 1px solid var(--admin-border); }
  .library-list { max-height: 10rem; }
  .library-detail { flex-shrink: 0; overflow: visible; }
  .library-preview { height: 18rem; }
  .library-search input, .library-group { font-size: 1rem; }
  .library-footer { justify-content: flex-end; }
}
</style>
