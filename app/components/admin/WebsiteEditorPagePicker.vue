<template>
  <div ref="wrapperRef" class="relative shrink-0" @focusout="handleFocusOut">
    <button
      ref="triggerRef"
      type="button"
      class="page-picker-trigger page-picker-focus group flex min-h-11 w-48 items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-2 text-left transition-[border-color,box-shadow] hover:border-admin-accent/40 focus-visible:border-admin-accent sm:w-52"
      :aria-label="`Preview page: ${selectedOption.label}`"
      :aria-expanded="open"
      :aria-controls="listboxId"
      aria-haspopup="dialog"
      @click="toggle"
      @keydown.down.prevent="openPicker(1)"
      @keydown.up.prevent="openPicker(-1)"
      @keydown.escape.prevent="closePicker()"
    >
      <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-admin-soft text-admin-accent-strong transition-colors group-hover:bg-admin-accent-soft">
        <Icon :name="selectedOption.icon" class="h-4 w-4" aria-hidden="true" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-xs font-semibold text-admin-text">{{ selectedOption.label }}</span>
        <span v-if="selectedOption.storefrontDisabled" class="block truncate text-xs text-admin-warning">Disabled on storefront</span>
      </span>
      <Icon
        name="heroicons:chevron-down"
        class="h-4 w-4 shrink-0 text-admin-muted transition-transform duration-150 motion-reduce:transition-none"
        :class="open ? 'rotate-180 text-admin-accent-strong' : ''"
        aria-hidden="true"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
      enter-from-class="-translate-y-1 opacity-0 motion-reduce:transform-none"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-1 opacity-0 motion-reduce:transform-none"
    >
      <div v-if="open" :id="listboxId" role="dialog" aria-label="Choose a website page" :style="popoverStyle" class="page-picker-list fixed z-50 overflow-y-auto rounded-lg border border-admin-border bg-admin-surface p-1.5 shadow-lg" @keydown.esc.prevent.stop="closePicker({ restoreFocus: true })">
        <input ref="searchRef" v-model="search" type="search" aria-label="Search website pages" placeholder="Search pages…" class="page-picker-focus mb-1 min-h-11 w-full rounded-md border border-admin-border bg-admin-surface px-3 text-base text-admin-text" @keydown.down.prevent="focusOptions" />
        <p class="px-2.5 py-2 text-xs font-semibold text-admin-muted">Built-in pages</p>
        <p v-if="!filteredOptions.length" class="px-2.5 py-2 text-xs text-admin-muted">No matching built-in pages.</p>
      <div
        :id="`${listboxId}-options`"
        ref="listboxRef"
        role="listbox"
        :tabindex="filteredOptions.length ? 0 : -1"
        aria-label="Preview page"
        :aria-activedescendant="activeOptionId"
        class="page-picker-focus outline-none"
        @keydown="handleListboxKeydown"
      >
        <button
          v-for="(option, index) in filteredOptions"
          :id="optionId(index)"
          :key="option.id"
          type="button"
          role="option"
          tabindex="-1"
          class="page-picker-focus flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
          :class="index === highlightedIndex
            ? 'bg-admin-accent-soft text-admin-accent-strong'
            : 'text-admin-text hover:bg-admin-soft'"
          :aria-selected="!selectedCustomPage && option.id === modelValue"
          :data-option-index="index"
          @click="selectOption(option.id)"
          @mouseenter="highlightedIndex = index"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            :class="!selectedCustomPage && option.id === modelValue ? 'bg-admin-surface text-admin-accent-strong' : 'bg-admin-soft text-admin-muted'"
          >
            <Icon :name="option.icon" class="h-4 w-4" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-xs font-semibold">{{ option.label }}</span>
            <span v-if="option.storefrontDisabled" class="block truncate text-xs text-admin-warning">Disabled on storefront</span>
          </span>
          <Icon v-if="!selectedCustomPage && option.id === modelValue" name="heroicons:check" class="h-4 w-4 shrink-0 text-admin-accent-strong" aria-hidden="true" />
        </button>
      </div>
      <div class="mt-2 border-t border-admin-border pt-2">
        <div class="flex items-center justify-between gap-2 px-2.5">
          <h3 class="text-xs font-semibold text-admin-muted">Custom pages</h3>
          <NuxtLink to="/admin/website-pages?create=1" class="page-picker-focus inline-flex min-h-11 items-center gap-1 rounded px-1 text-xs font-semibold text-admin-accent-strong" @click="closePicker({ restoreFocus: true })"><Icon name="heroicons:plus" class="h-4 w-4" aria-hidden="true" />Create page</NuxtLink>
        </div>
        <p v-if="customPagesLoading" class="px-2.5 py-3 text-xs text-admin-muted" role="status">Loading custom pages…</p>
        <div v-else-if="customPagesError" class="px-2.5 py-2">
          <p class="text-xs text-admin-danger" role="alert">{{ customPagesError }}</p>
          <button type="button" class="page-picker-focus mt-1 min-h-11 rounded px-2 text-xs font-semibold text-admin-text hover:bg-admin-soft" @click="$emit('retry')">Try again</button>
        </div>
        <p v-else-if="!customPages.length" class="px-2.5 py-3 text-xs text-admin-muted">No custom pages yet.</p>
        <nav v-else aria-label="Custom pages">
          <p v-if="!filteredCustomPages.length" class="px-2.5 py-3 text-xs text-admin-muted">No matching custom pages.</p>
          <NuxtLink v-for="page in filteredCustomPages" :key="page.uuid" :aria-current="selectedCustomPage?.uuid === page.uuid ? 'page' : undefined" :to="`/admin/website-editor?customPage=${encodeURIComponent(page.uuid)}`" class="page-picker-focus flex min-h-11 items-start gap-2.5 rounded-md px-2.5 py-2 text-admin-text hover:bg-admin-soft" @click="closePicker({ restoreFocus: true })">
            <Icon name="heroicons:document-text" class="mt-0.5 h-4 w-4 shrink-0 text-admin-muted" aria-hidden="true" />
            <span class="min-w-0 flex-1"><span class="block truncate text-xs font-semibold">{{ page.title }}</span><span class="block truncate text-xs text-admin-muted">{{ page.path }}</span><span class="block text-xs text-admin-muted">{{ page.is_published ? (page.has_unpublished_changes ? 'Live · Unpublished changes' : 'Live') : 'Private draft' }}</span></span>
          </NuxtLink>
        </nav>
        <NuxtLink to="/admin/website-pages" class="page-picker-focus flex min-h-11 items-center rounded-md px-2.5 text-xs font-semibold text-admin-text hover:bg-admin-soft" @click="closePicker({ restoreFocus: true })">Manage all pages</NuxtLink>
      </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useEditorPopoverPosition } from '~/composables/useEditorPopoverPosition'
import type { WebsitePageSummary } from '~/types/websitePage'
import type { WebsiteEditorPageId, WebsiteEditorPageOption } from '~/utils/websiteEditorPages'

type PagePickerOption = WebsiteEditorPageOption & { storefrontDisabled: boolean }

const props = withDefaults(defineProps<{
  modelValue: WebsiteEditorPageId
  options: PagePickerOption[]
  selectedCustomPage?: Pick<WebsitePageSummary, 'uuid' | 'title'> | null
  customPages?: WebsitePageSummary[]
  customPagesLoading?: boolean
  customPagesError?: string
}>(), { selectedCustomPage: null, customPages: () => [], customPagesLoading: false, customPagesError: '' })

const emit = defineEmits<{
  'update:modelValue': [value: WebsiteEditorPageId]
  retry: []
}>()

const instanceId = useId()
const listboxId = `website-editor-page-picker-${instanceId}`
const wrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const listboxRef = ref<HTMLElement | null>(null)
const open = ref(false)
const { popoverStyle, positionPopover } = useEditorPopoverPosition(triggerRef, () => open.value, () => 320)
const highlightedIndex = ref(0)
const search = ref('')
const searchRef = ref<HTMLInputElement | null>(null)
const matchesSearch = (label: string) => label.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())
const filteredOptions = computed(() => props.options.filter(option => matchesSearch(option.label)))
const filteredCustomPages = computed(() => props.customPages.filter(page => matchesSearch(`${page.title} ${page.path}`)))
function focusOptions() { if (filteredOptions.value.length) listboxRef.value?.focus() }

const selectedOption = computed(() =>
  props.selectedCustomPage
    ? { id: 'custom', label: props.selectedCustomPage.title, icon: 'heroicons:document-text', storefrontDisabled: false }
    : props.options.find(option => option.id === props.modelValue)
    ?? props.options[0]
    ?? { id: 'home' as const, label: 'Home page', icon: 'heroicons:home', path: '/', storefrontDisabled: false },
)

const activeOptionId = computed(() =>
  open.value && filteredOptions.value[highlightedIndex.value]
    ? optionId(highlightedIndex.value)
    : undefined,
)

function optionId(index: number) {
  return `${listboxId}-option-${index}`
}

async function openPicker(direction = 0) {
  if (open.value) return
  search.value = ''
  const selectedIndex = Math.max(filteredOptions.value.findIndex(option => option.id === props.modelValue), 0)
  highlightedIndex.value = Math.min(Math.max(selectedIndex + direction, 0), filteredOptions.value.length - 1)
  positionPopover()
  open.value = true
  await nextTick()
  searchRef.value?.focus()
  scrollToHighlighted()
}

function closePicker({ restoreFocus = false } = {}) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) nextTick(() => triggerRef.value?.focus())
}

function toggle() {
  if (open.value) closePicker()
  else openPicker()
}

function selectOption(pageId: WebsiteEditorPageId) {
  emit('update:modelValue', pageId)
  closePicker({ restoreFocus: true })
}

function moveHighlight(amount: number) {
  if (filteredOptions.value.length === 0) return
  highlightedIndex.value = (highlightedIndex.value + amount + filteredOptions.value.length) % filteredOptions.value.length
  scrollToHighlighted()
}

function handleListboxKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      moveHighlight(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveHighlight(-1)
      break
    case 'Home':
      event.preventDefault()
      highlightedIndex.value = 0
      scrollToHighlighted()
      break
    case 'End':
      event.preventDefault()
      highlightedIndex.value = Math.max(filteredOptions.value.length - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (filteredOptions.value[highlightedIndex.value]) selectOption(filteredOptions.value[highlightedIndex.value]!.id)
      break
    case 'Escape':
      event.preventDefault()
      closePicker({ restoreFocus: true })
      break
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    listboxRef.value
      ?.querySelector<HTMLElement>(`[data-option-index="${highlightedIndex.value}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  })
}

function handleFocusOut(event: FocusEvent) {
  if (event.relatedTarget && !wrapperRef.value?.contains(event.relatedTarget as Node)) closePicker()
}

function handleOutsidePointer(event: PointerEvent) {
  if (!wrapperRef.value?.contains(event.target as Node)) closePicker()
}

watch(() => filteredOptions.value.length, () => {
  highlightedIndex.value = Math.min(highlightedIndex.value, Math.max(filteredOptions.value.length - 1, 0))
})

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsidePointer)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsidePointer)
})
</script>

<style scoped>
.page-picker-focus:focus-visible,
.page-picker-list:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 2px;
}
.page-picker-list {
  scrollbar-color: var(--admin-border) transparent;
  scrollbar-width: thin;
}
</style>
