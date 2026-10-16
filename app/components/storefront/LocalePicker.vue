<template>
  <div v-if="supportedLocales.length > 1" ref="root" class="relative">
    <button
      ref="trigger"
      type="button"
      class="locale-focus inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-colors"
      :class="transparent ? 'text-white/85 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950'"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-controls="listboxId"
      :title="`Language: ${activeName}`"
      @click="toggle"
      @keydown.down.prevent="openPicker"
    >
      <Icon name="heroicons:language" class="h-[18px] w-[18px]" aria-hidden="true" />
      <span>{{ shortCode(activeLocale) }}</span>
      <Icon name="heroicons:chevron-down" class="h-3 w-3" :class="open ? 'rotate-180' : ''" aria-hidden="true" />
    </button>

    <div
      v-if="open"
      :id="listboxId"
      ref="listbox"
      role="listbox"
      tabindex="-1"
      aria-label="Storefront language"
      class="locale-menu absolute right-0 top-[calc(100%+0.35rem)] z-[70] min-w-56 rounded-xl bg-white p-1.5 text-gray-900 shadow-xl ring-1 ring-gray-900/10 outline-none"
      @keydown="handleKeydown"
    >
      <button
        v-for="(locale, index) in supportedLocales"
        :key="locale"
        type="button"
        role="option"
        tabindex="-1"
        class="locale-focus flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left"
        :class="index === highlightedIndex ? 'bg-primary-50' : 'hover:bg-gray-50'"
        :aria-selected="locale === activeLocale"
        @mouseenter="highlightedIndex = index"
        @click="selectLocale(locale)"
      >
        <span class="flex h-7 w-9 items-center justify-center rounded-lg bg-gray-100 text-[11px] font-bold uppercase text-gray-700">{{ shortCode(locale) }}</span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-xs font-semibold">{{ localeNativeName(locale) }}</span>
          <span class="block truncate text-[11px] text-gray-500">{{ localeName(locale) }}</span>
        </span>
        <Icon v-if="locale === activeLocale" name="heroicons:check" class="h-4 w-4 text-primary-600" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WEBSITE_EDITOR_LOCALES, websiteEditorLocaleName } from '~/utils/websiteEditorLocalization'

defineProps<{ transparent?: boolean }>()

const route = useRoute()
const router = useRouter()
const { siteConfig, fetchSiteConfig } = useSiteConfig()
const localeCookie = useCookie<string | null>('storefront_locale', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const listbox = ref<HTMLElement | null>(null)
const open = ref(false)
const highlightedIndex = ref(0)
const listboxId = `storefront-locale-${useId()}`
const supportedLocales = computed(() => siteConfig.value?.supported_locales ?? [])
const activeLocale = computed(() => siteConfig.value?.locale ?? siteConfig.value?.default_locale ?? 'en')
const activeName = computed(() => websiteEditorLocaleName(activeLocale.value))
const shortCode = (locale: string) => (locale.split('-')[0] ?? locale).toUpperCase()
const localeName = websiteEditorLocaleName
const localeNativeName = (locale: string) => WEBSITE_EDITOR_LOCALES.find(option => option.id === locale)?.nativeLabel ?? locale

async function openPicker() {
  highlightedIndex.value = Math.max(supportedLocales.value.indexOf(activeLocale.value), 0)
  open.value = true
  await nextTick()
  listbox.value?.focus()
}
function toggle() {
  if (open.value) open.value = false
  else void openPicker()
}
async function selectLocale(locale: string) {
  localeCookie.value = locale
  open.value = false
  await router.replace({ query: { ...route.query, locale } })
  await fetchSiteConfig(true)
  nextTick(() => trigger.value?.focus())
}
function move(amount: number) {
  if (!supportedLocales.value.length) return
  highlightedIndex.value = (highlightedIndex.value + amount + supportedLocales.value.length) % supportedLocales.value.length
}
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    move(event.key === 'ArrowDown' ? 1 : -1)
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const locale = supportedLocales.value[highlightedIndex.value]
    if (locale) void selectLocale(locale)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    open.value = false
    nextTick(() => trigger.value?.focus())
  } else if (event.key === 'Tab') open.value = false
}
function handleOutsidePointer(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsidePointer))
</script>

<style scoped>
.locale-focus:focus-visible,
.locale-menu:focus-visible {
  outline: 2px solid var(--color-primary-500, #22c55e);
  outline-offset: 2px;
}
</style>
