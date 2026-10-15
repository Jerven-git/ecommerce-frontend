<template>
  <div>
    <!-- Page Header -->
    <AdminPageHeader title="Site Settings" subtitle="Manage storefront operations, theme, merchandising, and search settings">
      <template #breadcrumb>
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">Settings</span>
        </div>
      </template>
    </AdminPageHeader>

    <!-- Tab Navigation -->
    <nav class="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
        :class="activeTab === tab.id
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'"
        @click="activeTab = tab.id"
      >
        <Icon :name="tab.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
        {{ tab.label }}
      </button>
    </nav>

    <!-- Loading -->
    <AdminSpinner v-if="loading" label="Loading settings…" variant="form" />

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="heroicons:exclamation-circle" class="w-6 h-6 text-red-500" aria-hidden="true" />
      </div>
      <p class="font-semibold text-gray-800 mb-1">Failed to load settings</p>
      <p class="text-sm text-red-500 mb-6">{{ error }}</p>
      <button @click="loadSettings()" class="btn-primary" :disabled="saving">Retry</button>
    </div>

    <!-- Tab Content -->
    <!-- transform-gpu + isolate forces this subtree onto its own compositor layer,
         which fixes a Chromium stale-paint bug where toggling Showcase/WatchShop/
         BestSellers (which replace the whole form sub-object) leaves a white
         region covering content below. Firefox is unaffected. -->
    <form v-else @submit.prevent="requestSave" class="pb-24 transform-gpu isolate">
      <AdminSettingsTabsGeneralTab
        v-show="activeTab === 'general'"
        :form="form"
      />

      <AdminSettingsTabsAppearanceTab
        v-show="activeTab === 'appearance'"
        :form="form"
        :saved-theme="savedTheme"
        :media-uploading="media.uploading"
        :media-progress="media.uploadProgress"
        @media-select="onMediaSelect"
        @media-remove="onMediaRemove"
      />

      <AdminSettingsTabsPagesTab
        v-show="activeTab === 'pages'"
        :form="form"
        :media-uploading="media.uploading"
        :media-progress="media.uploadProgress"
        @media-select="onMediaSelect"
        @media-remove="onMediaRemove"
      />

      <AdminSettingsTabsPopupTab
        v-show="activeTab === 'popup'"
        :form="form"
      />

      <AdminSettingsTabsModulesTab
        v-show="activeTab === 'modules'"
        :form="form"
      />
    </form>

    <AdminSettingsSaveFooter
      :saving="saving"
      :dirty="isDirty"
      @save="requestSave"
      @discard="requestDiscard"
    />

    <AdminToast />

    <!-- Confirm save modal -->
    <ConfirmModal
      :open="saveConfirmOpen"
      title="Save changes?"
      :message="confirmMessage"
      confirm-text="Save Changes"
      loading-text="Saving…"
      :loading="saving"
      variant="success"
      @confirm="confirmSave"
      @cancel="saveConfirmOpen = false"
    />

    <!-- Confirm discard modal -->
    <ConfirmModal
      :open="discardConfirmOpen"
      title="Discard changes?"
      message="This reverts every unsaved change on this page back to the last saved version. This can't be undone."
      confirm-text="Discard changes"
      variant="danger"
      @confirm="confirmDiscard"
      @cancel="discardConfirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import type { MediaCollection } from '~/composables/useMediaUpload'
import {
  DEFAULT_MODULES_ENABLED,
  type HomepageBestSellers,
  type HomepageShowcase,
  type HomepageWatchShop,
  type LoaderLogoAnimation,
  type ModulesEnabled,
} from '~/composables/useSiteConfig'

definePageMeta({ middleware: 'auth' })

interface SiteConfigResponse {
  data: Record<string, any>
}

interface PageSeoForm {
  seo_title: string
  seo_description: string
  og_image_url: string
  noindex: boolean
  cover_alt_text: string
}

const pageSlugs = ['home', 'about', 'contact', 'shop', 'blog', 'services'] as const
const { $apiFetch } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const { showToast } = useAdminToast()

const tabs = [
  { id: 'general', label: 'General', icon: 'heroicons:building-office-2' },
  { id: 'appearance', label: 'Appearance', icon: 'heroicons:swatch' },
  { id: 'pages', label: 'Pages', icon: 'heroicons:document-text' },
  { id: 'popup', label: 'Popup', icon: 'heroicons:gift' },
  { id: 'modules', label: 'Modules', icon: 'heroicons:squares-2x2' },
] as const

type TabId = typeof tabs[number]['id']

const legacyHomepageTabs = ['homepage', 'showcase', 'watch_shop'] as const

function isTabId(value: unknown): value is TabId {
  return typeof value === 'string' && tabs.some(tab => tab.id === value)
}

function isLegacyHomepageTab(value: unknown): boolean {
  return typeof value === 'string' && legacyHomepageTabs.includes(value as typeof legacyHomepageTabs[number])
}

const requestedTab = route.query.tab
const activeTab = ref<TabId>(isLegacyHomepageTab(requestedTab) ? 'pages' : isTabId(requestedTab) ? requestedTab : 'general')

if (isLegacyHomepageTab(requestedTab)) {
  router.replace({ query: { ...route.query, tab: 'pages', sub: 'homepage' } })
} else if (requestedTab && !isTabId(requestedTab)) {
  router.replace({ query: { ...route.query, tab: 'general' } })
}

watch(() => route.query.tab, (tab) => {
  if (isTabId(tab) && tab !== activeTab.value) activeTab.value = tab
})

watch(activeTab, (tab) => {
  router.replace({ query: { ...route.query, tab } })
})

const media = useMediaUpload({
  collections: ['loader_logo', 'showcase_video'],
  limits: {
    loader_logo: { maxMB: 2, label: 'Loading logo' },
    showcase_video: { maxMB: 25, label: 'Showcase video', accept: ['video/'] },
  },
  apiFetch: $apiFetch,
})

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const saveConfirmOpen = ref(false)
const discardConfirmOpen = ref(false)

const savedTheme = ref({
  primary_color: '#6898ED',
  secondary_color: '#4B5979',
  accent_color: '#F3F4F6',
  heading_font: 'Inter',
  body_font: 'Inter',
  texture: 'none',
  badge_in_stock_color: '#16a34a',
})

function emptyPageSeo(): Record<typeof pageSlugs[number], PageSeoForm> {
  return Object.fromEntries(pageSlugs.map(slug => [slug, {
    seo_title: '',
    seo_description: '',
    og_image_url: '',
    noindex: false,
    cover_alt_text: '',
  }])) as Record<typeof pageSlugs[number], PageSeoForm>
}

function defaultShowcase(): HomepageShowcase {
  return {
    enabled: false,
    label: 'Featured',
    heading: 'Find your product',
    subtitle: '',
    video_url: null,
    video_poster_url: null,
    video_status: 'idle',
    tiles: Array.from({ length: 4 }, () => ({
      title: '',
      cta_label: 'SHOP NOW',
      category_id: null,
      featured_product_id: null,
    })),
  }
}

function createForm() {
  return {
    theme: { ...savedTheme.value },
    loader_logo_url: '',
    loader_animation: 'bounce' as LoaderLogoAnimation,
    favorites_enabled: false,
    show_stock_quantity: false,
    welcome_popup: {
      welcome_popup_enabled: false,
      welcome_popup_heading: '',
      welcome_popup_body: '',
      welcome_popup_discount_id: null as number | null,
    },
    showcase_video_url: '',
    homepage_showcase: defaultShowcase(),
    homepage_watch_shop: {
      enabled: false,
      label: '',
      heading: 'Watch and Shop',
      subtitle: '',
      cards: [],
    } as HomepageWatchShop,
    homepage_best_sellers: {
      enabled: false,
      label: '',
      heading: 'Best Sellers',
      subtitle: '',
      source: 'fallback',
      products: [],
      fallback_product_ids: [],
    } as HomepageBestSellers,
    modules_enabled: { ...DEFAULT_MODULES_ENABLED } as ModulesEnabled,
    default_seo_title: '',
    default_seo_description: '',
    default_og_image_url: '',
    canonical_base_url: '',
    currency_code: 'USD',
    pages_seo: emptyPageSeo(),
  }
}

const form = ref(createForm())
const savedSnapshot = ref('')

function settingsSnapshot(value: typeof form.value): string {
  const snapshot = JSON.parse(JSON.stringify(value))

  snapshot.homepage_showcase = {
    enabled: snapshot.homepage_showcase.enabled,
    label: snapshot.homepage_showcase.label,
    heading: snapshot.homepage_showcase.heading,
    subtitle: snapshot.homepage_showcase.subtitle,
    tiles: snapshot.homepage_showcase.tiles,
  }
  snapshot.homepage_watch_shop = {
    enabled: snapshot.homepage_watch_shop.enabled,
    label: snapshot.homepage_watch_shop.label,
    heading: snapshot.homepage_watch_shop.heading,
    subtitle: snapshot.homepage_watch_shop.subtitle,
    cards: snapshot.homepage_watch_shop.cards.map((card: any) => ({
      id: card.id,
      media_id: card.media_id,
      product_id: card.product?.id ?? null,
    })),
  }
  snapshot.homepage_best_sellers = {
    enabled: snapshot.homepage_best_sellers.enabled,
    label: snapshot.homepage_best_sellers.label,
    heading: snapshot.homepage_best_sellers.heading,
    subtitle: snapshot.homepage_best_sellers.subtitle,
    fallback_product_ids: snapshot.homepage_best_sellers.fallback_product_ids ?? [],
  }

  return JSON.stringify(snapshot)
}

const isDirty = computed(() => savedSnapshot.value !== '' && settingsSnapshot(form.value) !== savedSnapshot.value)

const tabConfirmMessages: Record<TabId, string> = {
  general: 'Apply your general settings changes to the site?',
  appearance: 'Apply the new appearance to your site?',
  pages: 'Save these merchandising and page SEO changes?',
  popup: 'Save this popup discount setting?',
  modules: 'Apply these module visibility changes? Disabled pages will redirect to the homepage.',
}

const confirmMessage = computed(() => tabConfirmMessages[activeTab.value])
const urlFields: Partial<Record<MediaCollection, 'loader_logo_url' | 'showcase_video_url'>> = {
  loader_logo: 'loader_logo_url',
  showcase_video: 'showcase_video_url',
}

function apiErrorMessage(err: any): string {
  const errors = err?.data?.errors
  if (errors && typeof errors === 'object') {
    for (const messages of Object.values(errors)) {
      if (Array.isArray(messages) && typeof messages[0] === 'string') return messages[0]
      if (typeof messages === 'string') return messages
    }
  }
  return err?.data?.message || err?.message || 'Failed to save settings'
}

function normalizeShowcase(raw: any): HomepageShowcase {
  const tiles = Array.isArray(raw?.tiles) ? raw.tiles.slice(0, 4) : []
  while (tiles.length < 4) tiles.push(defaultShowcase().tiles[tiles.length])

  return {
    enabled: !!raw?.enabled,
    label: raw?.label ?? 'Featured',
    heading: raw?.heading ?? 'Find your product',
    subtitle: raw?.subtitle ?? '',
    video_url: raw?.video_url ?? null,
    video_poster_url: raw?.video_poster_url ?? null,
    video_status: ['idle', 'processing', 'ready', 'failed'].includes(raw?.video_status) ? raw.video_status : 'idle',
    tiles,
  }
}

function normalizePagesSeo(raw: any): Record<typeof pageSlugs[number], PageSeoForm> {
  const normalized = emptyPageSeo()
  for (const slug of pageSlugs) {
    const page = raw?.[slug] ?? {}
    normalized[slug] = {
      seo_title: page.seo_title ?? '',
      seo_description: page.seo_description ?? '',
      og_image_url: page.og_image_url ?? '',
      noindex: !!page.noindex,
      cover_alt_text: page.cover_alt_text ?? '',
    }
  }
  return normalized
}

function requestSave() {
  if (saving.value) return

  const popup = form.value.welcome_popup
  if (activeTab.value === 'popup' && popup.welcome_popup_enabled && !popup.welcome_popup_discount_id) {
    showToast('Select a discount before saving this active welcome popup.', 'error')
    return
  }

  saveConfirmOpen.value = true
}

async function confirmSave() {
  await saveSettings()
  saveConfirmOpen.value = false
}

function requestDiscard() {
  if (!saving.value && isDirty.value) discardConfirmOpen.value = true
}

async function confirmDiscard() {
  discardConfirmOpen.value = false
  await loadSettings()
}

function onMediaSelect(file: File, collection: MediaCollection) {
  const field = urlFields[collection]
  if (!field) {
    showToast('This media belongs in Website Editor.', 'error')
    return
  }

  const url = media.queueFile(file, collection)
  if (url) form.value[field] = url
  else if (media.lastError.value) showToast(media.lastError.value, 'error')
}

function onMediaRemove(collection: MediaCollection) {
  const field = urlFields[collection]
  if (!field) return
  media.markDeleted(collection)
  form.value[field] = ''
}

async function loadSettings(allowWhileSaving = false) {
  if (saving.value && !allowWhileSaving) return
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<SiteConfigResponse>('/site-config', { method: 'GET' })
    if (!response?.data) throw new Error('Settings response did not include store configuration.')

    const data = response.data
    media.reset()
    form.value = {
      theme: {
        primary_color: data.theme?.primary_color || '#6898ED',
        secondary_color: data.theme?.secondary_color || '#4B5979',
        accent_color: data.theme?.accent_color || '#F3F4F6',
        heading_font: data.theme?.heading_font || 'Inter',
        body_font: data.theme?.body_font || 'Inter',
        texture: data.theme?.texture || 'none',
        badge_in_stock_color: data.badge_in_stock_color || '#16a34a',
      },
      loader_logo_url: data.loader_logo_url || '',
      loader_animation: ['bounce', 'rotate', 'slide'].includes(data.loader_animation)
        ? data.loader_animation as LoaderLogoAnimation
        : 'bounce',
      favorites_enabled: data.favorites_enabled ?? false,
      show_stock_quantity: data.show_stock_quantity ?? false,
      welcome_popup: {
        welcome_popup_enabled: data.welcome_popup_enabled ?? false,
        welcome_popup_heading: data.welcome_popup_heading || '',
        welcome_popup_body: data.welcome_popup_body || '',
        welcome_popup_discount_id: data.welcome_popup_discount_id ?? null,
      },
      showcase_video_url: data.homepage_showcase?.video_url || '',
      homepage_showcase: normalizeShowcase(data.homepage_showcase),
      homepage_watch_shop: {
        enabled: !!data.homepage_watch_shop?.enabled,
        label: data.homepage_watch_shop?.label ?? '',
        heading: data.homepage_watch_shop?.heading ?? 'Watch and Shop',
        subtitle: data.homepage_watch_shop?.subtitle ?? '',
        cards: Array.isArray(data.homepage_watch_shop?.cards) ? data.homepage_watch_shop.cards : [],
      },
      homepage_best_sellers: {
        enabled: !!data.homepage_best_sellers?.enabled,
        label: data.homepage_best_sellers?.label ?? '',
        heading: data.homepage_best_sellers?.heading ?? 'Best Sellers',
        subtitle: data.homepage_best_sellers?.subtitle ?? '',
        source: data.homepage_best_sellers?.source === 'auto' ? 'auto' : 'fallback',
        products: Array.isArray(data.homepage_best_sellers?.products) ? data.homepage_best_sellers.products : [],
        fallback_product_ids: Array.isArray(data.homepage_best_sellers?.fallback_product_ids)
          ? data.homepage_best_sellers.fallback_product_ids.map((id: unknown) => Number(id))
          : [],
      },
      modules_enabled: { ...DEFAULT_MODULES_ENABLED, ...(data.modules_enabled ?? {}) } as ModulesEnabled,
      default_seo_title: data.default_seo_title || '',
      default_seo_description: data.default_seo_description || '',
      default_og_image_url: data.default_og_image_url || '',
      canonical_base_url: data.canonical_base_url || '',
      currency_code: data.currency_code || 'USD',
      pages_seo: normalizePagesSeo(data.pages_seo),
    }

    savedTheme.value = { ...form.value.theme }
    await nextTick()
    savedSnapshot.value = settingsSnapshot(form.value)
  } catch (err: any) {
    console.error('Error loading settings:', err)
    error.value = err?.data?.message || err?.message || 'Failed to load settings'
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  let settingsSaved = false

  try {
    const uploaded = await media.uploadAllPending()
    for (const [collection, serverUrl] of Object.entries(uploaded)) {
      const field = urlFields[collection as MediaCollection]
      if (field) form.value[field] = serverUrl
    }

    await $apiFetch('/site-config', {
      method: 'PATCH',
      body: {
        theme: (({ badge_in_stock_color: _, ...theme }) => theme)(form.value.theme),
        badge_in_stock_color: form.value.theme.badge_in_stock_color,
        favorites_enabled: form.value.favorites_enabled,
        show_stock_quantity: form.value.show_stock_quantity,
        welcome_popup_discount_id: form.value.welcome_popup.welcome_popup_discount_id,
        homepage_showcase: {
          enabled: form.value.homepage_showcase.enabled,
          label: form.value.homepage_showcase.label,
          heading: form.value.homepage_showcase.heading,
          subtitle: form.value.homepage_showcase.subtitle,
          tiles: form.value.homepage_showcase.tiles,
        },
        homepage_watch_shop: {
          enabled: form.value.homepage_watch_shop.enabled,
          label: form.value.homepage_watch_shop.label,
          heading: form.value.homepage_watch_shop.heading,
          subtitle: form.value.homepage_watch_shop.subtitle,
          cards: form.value.homepage_watch_shop.cards.map(card => ({
            id: card.id,
            media_id: card.media_id,
            product_id: card.product?.id ?? null,
          })),
        },
        homepage_best_sellers: {
          enabled: form.value.homepage_best_sellers.enabled,
          label: form.value.homepage_best_sellers.label,
          heading: form.value.homepage_best_sellers.heading,
          subtitle: form.value.homepage_best_sellers.subtitle,
          fallback_product_ids: form.value.homepage_best_sellers.fallback_product_ids ?? [],
        },
        modules_enabled: form.value.modules_enabled,
        default_seo_title: form.value.default_seo_title || null,
        default_seo_description: form.value.default_seo_description || null,
        default_og_image_url: form.value.default_og_image_url || null,
        canonical_base_url: form.value.canonical_base_url || null,
        loader_animation: form.value.loader_animation,
        currency_code: form.value.currency_code || 'USD',
        pages_seo: Object.fromEntries(Object.entries(form.value.pages_seo).map(([slug, page]) => [slug, {
          seo_title: page.seo_title || null,
          seo_description: page.seo_description || null,
          og_image_url: page.og_image_url || null,
          noindex: !!page.noindex,
          cover_alt_text: page.cover_alt_text || null,
        }])),
      },
    })
    settingsSaved = true

    await media.deleteAllMarked()
    const { fetchSiteConfig, broadcastConfigUpdate } = useSiteConfig()
    await fetchSiteConfig(true)
    broadcastConfigUpdate()
    await loadSettings(true)
    showToast('All settings saved', 'success')
  } catch (err: any) {
    console.error('Save failed:', err?.data || err)
    showToast(
      settingsSaved
        ? 'Your settings were saved, but one or more media files could not be removed. Try saving again.'
        : apiErrorMessage(err),
      'error',
    )
  } finally {
    saving.value = false
  }
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (isDirty.value && !saving.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onBeforeRouteLeave(() => {
  if (isDirty.value && !saving.value) return window.confirm('You have unsaved changes. Leave without saving?')
  return true
})

onMounted(() => {
  loadSettings()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  media.cleanup()
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
