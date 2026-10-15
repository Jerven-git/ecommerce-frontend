<template>
  <div ref="wrapperRef" class="relative shrink-0">
    <button
      ref="triggerRef"
      type="button"
      class="page-picker-focus group flex min-h-11 w-48 items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-2 text-left transition-[border-color,box-shadow] hover:border-admin-accent/40 focus-visible:border-admin-accent sm:w-52"
      :aria-label="`Preview page: ${selectedOption.label}`"
      :aria-expanded="open"
      :aria-controls="listboxId"
      aria-haspopup="listbox"
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
      <div
        v-if="open"
        :id="listboxId"
        ref="listboxRef"
        role="listbox"
        tabindex="-1"
        aria-label="Preview page"
        :aria-activedescendant="activeOptionId"
        class="page-picker-list absolute right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(24rem,calc(100dvh-8rem))] w-64 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-admin-border bg-admin-surface p-1.5 shadow-lg outline-none"
        @keydown="handleListboxKeydown"
      >
        <button
          v-for="(option, index) in options"
          :id="optionId(index)"
          :key="option.id"
          type="button"
          role="option"
          tabindex="-1"
          class="page-picker-focus flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
          :class="index === highlightedIndex
            ? 'bg-admin-accent-soft text-admin-accent-strong'
            : 'text-admin-text hover:bg-admin-soft'"
          :aria-selected="option.id === modelValue"
          :data-option-index="index"
          @click="selectOption(option.id)"
          @mouseenter="highlightedIndex = index"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            :class="option.id === modelValue ? 'bg-admin-surface text-admin-accent-strong' : 'bg-admin-soft text-admin-muted'"
          >
            <Icon :name="option.icon" class="h-4 w-4" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-xs font-semibold">{{ option.label }}</span>
            <span v-if="option.storefrontDisabled" class="block truncate text-xs text-admin-warning">Disabled on storefront</span>
          </span>
          <Icon v-if="option.id === modelValue" name="heroicons:check" class="h-4 w-4 shrink-0 text-admin-accent-strong" aria-hidden="true" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { WebsiteEditorPageId, WebsiteEditorPageOption } from '~/utils/websiteEditorPages'

type PagePickerOption = WebsiteEditorPageOption & { storefrontDisabled: boolean }

const props = defineProps<{
  modelValue: WebsiteEditorPageId
  options: PagePickerOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: WebsiteEditorPageId]
}>()

const instanceId = useId()
const listboxId = `website-editor-page-picker-${instanceId}`
const wrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const listboxRef = ref<HTMLElement | null>(null)
const open = ref(false)
const highlightedIndex = ref(0)

const selectedOption = computed(() =>
  props.options.find(option => option.id === props.modelValue)
    ?? props.options[0]
    ?? { id: 'home' as const, label: 'Home page', icon: 'heroicons:home', path: '/', storefrontDisabled: false },
)

const activeOptionId = computed(() =>
  open.value && props.options[highlightedIndex.value]
    ? optionId(highlightedIndex.value)
    : undefined,
)

function optionId(index: number) {
  return `${listboxId}-option-${index}`
}

async function openPicker(direction = 0) {
  if (open.value || props.options.length === 0) return
  const selectedIndex = Math.max(props.options.findIndex(option => option.id === props.modelValue), 0)
  highlightedIndex.value = Math.min(Math.max(selectedIndex + direction, 0), props.options.length - 1)
  open.value = true
  await nextTick()
  listboxRef.value?.focus()
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
  if (props.options.length === 0) return
  highlightedIndex.value = (highlightedIndex.value + amount + props.options.length) % props.options.length
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
      highlightedIndex.value = Math.max(props.options.length - 1, 0)
      scrollToHighlighted()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (props.options[highlightedIndex.value]) selectOption(props.options[highlightedIndex.value]!.id)
      break
    case 'Escape':
      event.preventDefault()
      closePicker({ restoreFocus: true })
      break
    case 'Tab':
      closePicker()
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

function handleOutsidePointer(event: PointerEvent) {
  if (!wrapperRef.value?.contains(event.target as Node)) closePicker()
}

watch(() => props.options.length, () => {
  highlightedIndex.value = Math.min(highlightedIndex.value, Math.max(props.options.length - 1, 0))
})

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsidePointer))
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
