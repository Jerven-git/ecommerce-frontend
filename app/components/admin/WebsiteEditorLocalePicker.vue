<template>
  <div ref="root" class="relative shrink-0">
    <div class="flex items-center rounded-xl border border-admin-border bg-admin-surface p-1">
      <button
        ref="trigger"
        type="button"
        class="locale-focus flex min-h-9 items-center gap-2 rounded-lg px-2 text-left hover:bg-admin-soft"
        :aria-expanded="pickerOpen"
        aria-haspopup="listbox"
        :aria-controls="listboxId"
        :title="`Editing ${activeName}`"
        @click="togglePicker"
        @keydown.down.prevent="openPicker"
      >
        <Icon name="heroicons:language" class="h-4 w-4 shrink-0 text-admin-accent-strong" aria-hidden="true" />
        <span class="max-w-24 truncate text-xs font-semibold text-admin-text">{{ activeName }}</span>
        <Icon name="heroicons:chevron-down" class="h-3.5 w-3.5 text-admin-muted" :class="pickerOpen ? 'rotate-180' : ''" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="locale-focus flex min-h-9 min-w-9 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-soft hover:text-admin-text"
        aria-label="Manage storefront languages"
        title="Manage storefront languages"
        @click="toggleManager"
      >
        <Icon name="heroicons:cog-6-tooth" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <div
      v-if="pickerOpen"
      :id="listboxId"
      ref="listbox"
      role="listbox"
      tabindex="-1"
      aria-label="Content language"
      class="locale-menu absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-xl border border-admin-border bg-admin-surface p-1.5 shadow-lg outline-none"
      @keydown="handleListboxKeydown"
    >
      <button
        v-for="(locale, index) in supportedLocales"
        :id="optionId(index)"
        :key="locale"
        type="button"
        role="option"
        tabindex="-1"
        class="locale-focus flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left"
        :class="index === highlightedIndex ? 'bg-admin-accent-soft' : 'hover:bg-admin-soft'"
        :aria-selected="locale === modelValue"
        @mouseenter="highlightedIndex = index"
        @click="selectLocale(locale)"
      >
        <span class="flex h-7 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-soft text-[11px] font-bold uppercase text-admin-accent-strong">{{ shortCode(locale) }}</span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-xs font-semibold text-admin-text">{{ localeName(locale) }}</span>
          <span class="block truncate text-xs text-admin-muted">{{ locale === defaultLocale ? 'Default content' : progressLabel(locale) }}</span>
        </span>
        <Icon v-if="locale === modelValue" name="heroicons:check" class="h-4 w-4 text-admin-accent-strong" aria-hidden="true" />
      </button>
    </div>

    <section
      v-if="managerOpen"
      class="locale-menu absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-admin-border bg-admin-surface shadow-lg"
      aria-label="Manage storefront languages"
    >
      <div class="flex items-start justify-between gap-3 border-b border-admin-border px-3 py-3">
        <div>
          <h3 class="text-xs font-semibold text-admin-text">Storefront languages</h3>
          <p class="mt-0.5 text-xs leading-5 text-admin-muted">Choose up to 12. The default language keeps your original content.</p>
        </div>
        <button type="button" class="locale-focus flex min-h-9 min-w-9 items-center justify-center rounded-lg text-admin-muted hover:bg-admin-soft" aria-label="Close language settings" @click="managerOpen = false">
          <Icon name="heroicons:x-mark" class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div class="max-h-[min(26rem,60dvh)] overflow-y-auto p-2">
        <label
          v-for="option in localeOptions"
          :key="option.id"
          class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-admin-soft"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-admin-border text-admin-accent focus:ring-admin-accent"
            :checked="supportedLocales.includes(option.id)"
            :disabled="option.id === defaultLocale || (!supportedLocales.includes(option.id) && supportedLocales.length >= 12)"
            @change="toggleSupported(option.id)"
          >
          <span class="min-w-0 flex-1">
            <span class="block truncate text-xs font-semibold text-admin-text">{{ option.nativeLabel }}</span>
            <span class="block truncate text-xs text-admin-muted">{{ option.label }}</span>
          </span>
          <span v-if="option.id === defaultLocale" class="rounded-md bg-admin-accent-soft px-1.5 py-1 text-[10px] font-semibold text-admin-accent-strong">Default</span>
        </label>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'
import { WEBSITE_EDITOR_LOCALES, websiteEditorLocaleName, websiteEditorLocaleProgress } from '~/utils/websiteEditorLocalization'

const props = defineProps<{
  modelValue: string
  draft: WebsiteEditorDraftPayload
}>()

const emit = defineEmits<{
  'update:modelValue': [locale: string]
  'update:supportedLocales': [locales: string[]]
}>()

const instanceId = useId()
const listboxId = `website-editor-locale-picker-${instanceId}`
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const listbox = ref<HTMLElement | null>(null)
const pickerOpen = ref(false)
const managerOpen = ref(false)
const highlightedIndex = ref(0)
const localeOptions = WEBSITE_EDITOR_LOCALES
const defaultLocale = computed(() => props.draft.default_locale)
const supportedLocales = computed(() => props.draft.supported_locales)
const activeName = computed(() => websiteEditorLocaleName(props.modelValue))
const localeName = websiteEditorLocaleName

const shortCode = (locale: string) => locale.split('-')[0]
const progressLabel = (locale: string) => {
  const progress = websiteEditorLocaleProgress(props.draft, locale)
  return `${progress.percent}% translated`
}
const optionId = (index: number) => `${listboxId}-option-${index}`

async function openPicker() {
  managerOpen.value = false
  highlightedIndex.value = Math.max(supportedLocales.value.indexOf(props.modelValue), 0)
  pickerOpen.value = true
  await nextTick()
  listbox.value?.focus()
}
function togglePicker() {
  if (pickerOpen.value) pickerOpen.value = false
  else void openPicker()
}
function toggleManager() {
  pickerOpen.value = false
  managerOpen.value = !managerOpen.value
}
function selectLocale(locale: string) {
  emit('update:modelValue', locale)
  pickerOpen.value = false
  nextTick(() => trigger.value?.focus())
}
function moveHighlight(amount: number) {
  if (!supportedLocales.value.length) return
  highlightedIndex.value = (highlightedIndex.value + amount + supportedLocales.value.length) % supportedLocales.value.length
}
function handleListboxKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const locale = supportedLocales.value[highlightedIndex.value]
    if (locale) selectLocale(locale)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    pickerOpen.value = false
    nextTick(() => trigger.value?.focus())
  } else if (event.key === 'Tab') pickerOpen.value = false
}
function toggleSupported(locale: string) {
  if (locale === defaultLocale.value) return
  const exists = supportedLocales.value.includes(locale)
  const next = exists
    ? supportedLocales.value.filter(item => item !== locale)
    : [...supportedLocales.value, locale]
  emit('update:supportedLocales', next)
}
function handleOutsidePointer(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) {
    pickerOpen.value = false
    managerOpen.value = false
  }
}

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsidePointer))
</script>

<style scoped>
.locale-focus:focus-visible,
.locale-menu:focus-visible {
  outline: 2px solid var(--admin-accent);
  outline-offset: 2px;
}
.locale-menu { scrollbar-color: var(--admin-border) transparent; scrollbar-width: thin; }
</style>
