<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium">Settings</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Site Settings</h1>
      <p class="text-gray-500 text-sm mt-1">Manage your store's appearance and content</p>
    </div>

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
        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
        </svg>
        {{ tab.label }}
      </button>
    </nav>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading settings…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-800 mb-1">Failed to load settings</p>
      <p class="text-sm text-red-500 mb-6">{{ error }}</p>
      <button @click="loadSettings" class="btn-primary" :disabled="saving">Retry</button>
    </div>

    <!-- Tab Content -->
    <form v-else @submit.prevent="saveSettings" class="pb-24">
      <AdminSettingsTabsGeneralTab
        v-show="activeTab === 'general'"
        :form="form"
        :media-uploading="media.uploading"
        @media-select="onMediaSelect"
        @media-remove="onMediaRemove"
      />

      <AdminSettingsTabsAppearanceTab
        v-show="activeTab === 'appearance'"
        :form="form"
        :saved-theme="savedTheme"
      />

      <AdminSettingsTabsPagesTab
        v-show="activeTab === 'pages'"
        :form="form"
        :media-uploading="media.uploading"
        @media-select="onMediaSelect"
        @media-remove="onMediaRemove"
        @add-contact-entry="addContactEntry"
        @remove-contact-entry="removeContactEntry"
      />

      <AdminSettingsTabsPopupTab
        v-show="activeTab === 'popup'"
        :form="form"
      />
    </form>

    <AdminSettingsSaveFooter
      :saving="saving"
      @save="requestSave"
      @reset="loadSettings"
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
  </div>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'

definePageMeta({ middleware: "auth" })

interface ContactEntry {
  label: string
  email: string
  phone: string
}

interface SiteConfigResponse {
  data: Record<string, any>
}

const { $apiFetch } = useNuxtApp()
const route = useRoute()
const router = useRouter()

// --- Tabs ---
const tabs = [
  { id: 'general', label: 'General', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { id: 'pages', label: 'Pages', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'popup', label: 'Popup', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
] as const

type TabId = typeof tabs[number]['id']

// Redirect legacy ?tab=homepage to ?tab=pages&sub=homepage
const initialTab = (() => {
  const t = route.query.tab as string
  if (t === 'homepage') return 'pages'
  return (t as TabId) || 'general'
})()

const activeTab = ref<TabId>(initialTab)

// If redirecting from homepage tab, set sub query
if (route.query.tab === 'homepage') {
  router.replace({ query: { ...route.query, tab: 'pages', sub: 'homepage' } })
}

// Sync activeTab when route query changes (e.g. from admin guide navigation)
watch(() => route.query.tab, (tab) => {
  if (tab && tab !== activeTab.value) {
    activeTab.value = tab as TabId
  }
})

watch(activeTab, (tab) => {
  router.replace({ query: { ...route.query, tab } })
})

// --- Media upload composable ---
const media = useMediaUpload({
  collections: ['logo', 'favicon', 'cart_icon', 'hero', 'about', 'contact'],
  limits: {
    logo:      { maxMB: 2,  label: 'Logo' },
    favicon:   { maxMB: 2,  label: 'Site icon' },
    cart_icon: { maxMB: 2,  label: 'Cart icon' },
    hero:    { maxMB: 10, label: 'Hero media', accept: ['image/', 'video/'] },
    about:   { maxMB: 10, label: 'About image' },
    contact: { maxMB: 10, label: 'Contact image' },
  },
  apiFetch: $apiFetch,
})

// --- Page state ---
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const configId = ref<number | null>(null)

// Snapshot of the last-saved theme — used as the revert target when
// deselecting a theme preset, so deselection returns to the live site
// theme rather than a hardcoded default.
const savedTheme = ref({
  primary_color: "#6898ED",
  secondary_color: "#4B5979",
  accent_color: "#F3F4F6",
  heading_font: "Inter",
  body_font: "Inter",
  texture: "none",
})

const { showToast } = useAdminToast()

// --- Save confirmation modal ---
const saveConfirmOpen = ref(false)

const tabSuccessMessages: Record<TabId, string> = {
  general: 'General settings have been updated',
  appearance: 'Theme has been applied',
  pages: 'Page content has been saved',
  popup: 'Popup settings have been saved',
}

const tabConfirmMessages: Record<TabId, string> = {
  general: 'Apply your general settings changes to the site?',
  appearance: 'Apply the new theme to your site?',
  pages: 'Save these page content changes?',
  popup: 'Save these popup settings?',
}

const confirmMessage = computed(() => tabConfirmMessages[activeTab.value])

function requestSave() {
  if (saving.value) return
  saveConfirmOpen.value = true
}

async function confirmSave() {
  await saveSettings()
  saveConfirmOpen.value = false
}

const form = ref({
  site_name: "",
  theme: {
    primary_color: "#6898ED",
    secondary_color: "#4B5979",
    accent_color: "#F3F4F6",
    heading_font: "Inter",
    body_font: "Inter",
    texture: "none",
  },
  logo_url: "",
  favicon_url: "",
  cart_icon_url: "",
  hero_title: "",
  hero_subtitle: "",
  hero_overlay_color: "#000000",
  hero_overlay_opacity: 45,
  hero_full_bleed: false,
  hero_image_url: "",
  hero_media_mime: "",
  about_content: "",
  about_image_url: "",
  contact_image_url: "",
  contact_email: "",
  contact_phone: "",
  contact_entries: [{ label: '', email: '', phone: '' }] as ContactEntry[],
  favorites_enabled: false,
  show_stock_quantity: false,
  welcome_popup: {
    welcome_popup_enabled: false,
    welcome_popup_heading: '',
    welcome_popup_body: '',
    welcome_popup_discount_id: null as number | null,
  },
  homepage_steps: {
    label: 'Simple & Easy',
    heading: 'How It Works',
    subtitle: 'Start shopping in just three easy steps — no hassle, no confusion.',
    items: [
      { title: 'Browse Products', description: 'Explore our wide selection of quality items across all categories.' },
      { title: 'Add to Cart', description: 'Pick your favourites and add them to your cart with one click.' },
      { title: 'Fast Checkout', description: 'Secure payment and fast delivery straight to your doorstep.' },
    ],
  },
  homepage_features: {
    items: [
      { title: 'Quality Products', description: 'Carefully curated selection of premium items.' },
      { title: 'Best Prices', description: 'Competitive pricing on all our products.' },
      { title: 'Fast Delivery', description: 'Quick and reliable shipping to your doorstep.' },
    ],
  },
  homepage_stats: {
    items: [
      { value: '500+', label: 'Products' },
      { value: '1,200+', label: 'Happy Customers' },
      { value: '99%', label: 'Satisfaction Rate' },
      { value: '24/7', label: 'Support' },
    ],
  },
  homepage_newsletter: {
    label: 'Stay in the loop',
    heading: "Don't miss a deal.",
    subtitle: 'Get the latest products, exclusive offers, and updates delivered straight to your inbox.',
    disclaimer: 'No spam, ever. Unsubscribe anytime.',
  },
  about_highlights: {
    items: [
      { icon: 'heroicons:check-circle', title: 'Quality Assured', description: 'Every product is carefully selected and tested.' },
      { icon: 'heroicons:clock', title: 'Fast Shipping', description: 'Quick delivery straight to your doorstep.' },
      { icon: 'heroicons:face-smile', title: 'Happy Customers', description: 'Dedicated to your satisfaction, always.' },
    ],
  },
  shop_header: {
    label: 'Store',
    heading: 'Shop All Products',
    subtitle: 'Browse our full collection of quality items',
  },
  shop_promo: {
    badge: 'Members get more',
    heading: 'New arrivals every single week.',
    subtitle: 'Stay ahead of the trend. Fresh drops, exclusive deals, and hand-picked collections — updated weekly just for you.',
    button_text: 'Shop New Arrivals',
    perks: ['Free Shipping', 'Easy Returns', 'Secure Checkout'],
  },
  contact_page: {
    info_title: 'Get In Touch',
    info_subtitle: "We'd love to hear from you",
    info_description: "Have a question or need assistance? Fill out the form and we'll get back to you as soon as possible.",
    info_badge: 'Usually responds within 24 hours',
    promises: [
      { icon: 'heroicons:bolt', title: 'Fast Response', description: 'We reply to all inquiries within 24 hours, guaranteed.' },
      { icon: 'heroicons:users', title: 'Expert Help', description: 'Our trained support team is ready to resolve any issue.' },
      { icon: 'heroicons:lock-closed', title: '100% Private', description: 'Your details are always kept safe and never shared.' },
    ],
  },
})

// Map collection -> form field
const urlFields: Record<MediaCollection, keyof typeof form.value> = {
  logo: 'logo_url',
  favicon: 'favicon_url',
  cart_icon: 'cart_icon_url',
  hero: 'hero_image_url',
  about: 'about_image_url',
  contact: 'contact_image_url',
}

// --- Media event handlers ---
function onMediaSelect(file: File, collection: MediaCollection) {
  const url = media.queueFile(file, collection)
  if (url) {
    ;(form.value[urlFields[collection]] as string) = url
    if (collection === 'hero') form.value.hero_media_mime = file.type
  } else if (media.lastError.value) {
    showToast(media.lastError.value, 'error')
  }
}

function onMediaRemove(collection: MediaCollection) {
  media.markDeleted(collection)
  ;(form.value[urlFields[collection]] as string) = ''
  if (collection === 'hero') form.value.hero_media_mime = ''
}

// --- Contact entries ---
function addContactEntry() {
  form.value.contact_entries.push({ label: '', email: '', phone: '' })
}
function removeContactEntry(index: number) {
  if (form.value.contact_entries.length <= 1) return
  form.value.contact_entries.splice(index, 1)
}

// --- Load settings ---
async function loadSettings() {
  if (saving.value) return
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<SiteConfigResponse>("/site-config", { method: "GET" })

    if (response?.data) {
      configId.value = response.data.id
      media.reset()

      form.value = {
        site_name: response.data.site_name || "",
        theme: {
          primary_color: response.data.theme?.primary_color || "#6898ED",
          secondary_color: response.data.theme?.secondary_color || "#4B5979",
          accent_color: response.data.theme?.accent_color || "#F3F4F6",
          heading_font: response.data.theme?.heading_font || "Inter",
          body_font: response.data.theme?.body_font || "Inter",
          texture: response.data.theme?.texture || "none",
        },
        logo_url: response.data.logo_url || "",
        favicon_url: response.data.favicon_url || "",
        cart_icon_url: response.data.cart_icon_url || "",
        hero_title: response.data.hero_title || "",
        hero_subtitle: response.data.hero_subtitle || "",
        hero_overlay_color: response.data.hero_overlay_color || "#000000",
        hero_overlay_opacity: response.data.hero_overlay_opacity ?? 45,
        hero_full_bleed: response.data.hero_full_bleed ?? false,
        hero_image_url: response.data.hero_image_url || "",
        hero_media_mime: response.data.hero_media_mime || "",
        about_content: response.data.about_content || "",
        about_image_url: response.data.about_image_url || "",
        contact_image_url: response.data.contact_image_url || "",
        contact_email: response.data.contact_email || "",
        contact_phone: response.data.contact_phone || "",
        contact_entries: response.data.contact_entries?.length
          ? response.data.contact_entries
          : [{ label: '', email: '', phone: '' }],
        favorites_enabled: response.data.favorites_enabled ?? false,
        show_stock_quantity: response.data.show_stock_quantity ?? false,
        welcome_popup: {
          welcome_popup_enabled: response.data.welcome_popup_enabled ?? false,
          welcome_popup_heading: response.data.welcome_popup_heading || '',
          welcome_popup_body: response.data.welcome_popup_body || '',
          welcome_popup_discount_id: response.data.welcome_popup_discount_id ?? null,
        },
        homepage_steps: (() => {
          const stepIcons = ['heroicons:magnifying-glass', 'heroicons:shopping-cart', 'heroicons:shield-check']
          const hs = response.data.homepage_steps ?? {
            label: 'Simple & Easy', heading: 'How It Works',
            subtitle: 'Start shopping in just three easy steps — no hassle, no confusion.',
            items: [
              { icon: stepIcons[0], title: 'Browse Products', description: 'Explore our wide selection of quality items across all categories.' },
              { icon: stepIcons[1], title: 'Add to Cart', description: 'Pick your favourites and add them to your cart with one click.' },
              { icon: stepIcons[2], title: 'Fast Checkout', description: 'Secure payment and fast delivery straight to your doorstep.' },
            ],
          }
          hs.items = hs.items.map((item: any, i: number) => ({ icon: stepIcons[i] || 'heroicons:check-circle', ...item }))
          return hs
        })(),
        homepage_features: (() => {
          const featIcons = ['heroicons:cube', 'heroicons:currency-dollar', 'heroicons:bolt']
          const hf = response.data.homepage_features ?? {
            items: [
              { icon: featIcons[0], title: 'Quality Products', description: 'Carefully curated selection of premium items.' },
              { icon: featIcons[1], title: 'Best Prices', description: 'Competitive pricing on all our products.' },
              { icon: featIcons[2], title: 'Fast Delivery', description: 'Quick and reliable shipping to your doorstep.' },
            ],
          }
          hf.items = hf.items.map((item: any, i: number) => ({ icon: featIcons[i] || 'heroicons:check-circle', ...item }))
          return hf
        })(),
        homepage_stats: response.data.homepage_stats ?? {
          items: [
            { value: '500+', label: 'Products' },
            { value: '1,200+', label: 'Happy Customers' },
            { value: '99%', label: 'Satisfaction Rate' },
            { value: '24/7', label: 'Support' },
          ],
        },
        homepage_newsletter: response.data.homepage_newsletter ?? {
          label: 'Stay in the loop', heading: "Don't miss a deal.",
          subtitle: 'Get the latest products, exclusive offers, and updates delivered straight to your inbox.',
          disclaimer: 'No spam, ever. Unsubscribe anytime.',
        },
        about_highlights: (() => {
          const fallbackIcons = ['heroicons:check-circle', 'heroicons:clock', 'heroicons:face-smile', 'heroicons:star', 'heroicons:shield-check', 'heroicons:truck']
          const hl = response.data.about_highlights ?? {
            items: [
              { icon: 'heroicons:check-circle', title: 'Quality Assured', description: 'Every product is carefully selected and tested.' },
              { icon: 'heroicons:clock', title: 'Fast Shipping', description: 'Quick delivery straight to your doorstep.' },
              { icon: 'heroicons:face-smile', title: 'Happy Customers', description: 'Dedicated to your satisfaction, always.' },
            ],
          }
          hl.items = hl.items.map((item: any, i: number) => ({ icon: fallbackIcons[i] || 'heroicons:check-circle', ...item }))
          return hl
        })(),
        shop_header: response.data.shop_header ?? {
          label: 'Store', heading: 'Shop All Products',
          subtitle: 'Browse our full collection of quality items',
        },
        shop_promo: response.data.shop_promo ?? {
          badge: 'Members get more', heading: 'New arrivals every single week.',
          subtitle: 'Stay ahead of the trend. Fresh drops, exclusive deals, and hand-picked collections — updated weekly just for you.',
          button_text: 'Shop New Arrivals',
          perks: ['Free Shipping', 'Easy Returns', 'Secure Checkout'],
        },
        contact_page: (() => {
          const promiseIcons = ['heroicons:bolt', 'heroicons:users', 'heroicons:lock-closed']
          const cp = response.data.contact_page ?? {
            info_title: 'Get In Touch', info_subtitle: "We'd love to hear from you",
            info_description: "Have a question or need assistance? Fill out the form and we'll get back to you as soon as possible.",
            info_badge: 'Usually responds within 24 hours',
            promises: [
              { icon: promiseIcons[0], title: 'Fast Response', description: 'We reply to all inquiries within 24 hours, guaranteed.' },
              { icon: promiseIcons[1], title: 'Expert Help', description: 'Our trained support team is ready to resolve any issue.' },
              { icon: promiseIcons[2], title: '100% Private', description: 'Your details are always kept safe and never shared.' },
            ],
          }
          if (cp.promises) {
            cp.promises = cp.promises.map((item: any, i: number) => ({ icon: promiseIcons[i] || 'heroicons:check-circle', ...item }))
          }
          return cp
        })(),
      }

      savedTheme.value = { ...form.value.theme }
    }
  } catch (err: any) {
    console.error("Error loading settings:", err)
    error.value = err?.data?.message || "Failed to load settings"
  } finally {
    loading.value = false
  }
}

// --- Save settings ---
async function saveSettings() {
  saving.value = true

  try {
    // 1) Upload pending files
    const uploaded = await media.uploadAllPending()
    for (const [collection, serverUrl] of Object.entries(uploaded)) {
      ;(form.value[urlFields[collection as MediaCollection]] as string) = serverUrl
    }

    // 2) Execute pending deletions
    await media.deleteAllMarked()

    // 3) PATCH text fields
    await $apiFetch("/site-config", {
      method: "PATCH",
      body: {
        site_name: form.value.site_name,
        theme: form.value.theme,
        hero_title: form.value.hero_title,
        hero_subtitle: form.value.hero_subtitle,
        hero_overlay_color: form.value.hero_overlay_color,
        hero_overlay_opacity: form.value.hero_overlay_opacity,
        hero_full_bleed: form.value.hero_full_bleed,
        about_content: form.value.about_content,
        contact_email: form.value.contact_email,
        contact_phone: form.value.contact_phone,
        contact_entries: form.value.contact_entries,
        favorites_enabled: form.value.favorites_enabled,
        show_stock_quantity: form.value.show_stock_quantity,
        welcome_popup_enabled: form.value.welcome_popup.welcome_popup_enabled,
        welcome_popup_heading: form.value.welcome_popup.welcome_popup_heading,
        welcome_popup_body: form.value.welcome_popup.welcome_popup_body,
        welcome_popup_discount_id: form.value.welcome_popup.welcome_popup_discount_id,
        homepage_steps: form.value.homepage_steps,
        homepage_features: form.value.homepage_features,
        homepage_stats: form.value.homepage_stats,
        homepage_newsletter: form.value.homepage_newsletter,
        about_highlights: form.value.about_highlights,
        shop_header: form.value.shop_header,
        shop_promo: form.value.shop_promo,
        contact_page: form.value.contact_page,
      },
    })

    // Refresh shared siteConfig so the theme updates live
    const { fetchSiteConfig, broadcastConfigUpdate } = useSiteConfig()
    useState<boolean>('siteConfigFetched').value = false
    await fetchSiteConfig()

    // Notify other open tabs to re-fetch and apply the new theme
    broadcastConfigUpdate()

    showToast(tabSuccessMessages[activeTab.value], 'success')
    await loadSettings()
  } catch (err: any) {
    console.error("Save failed:", err?.data || err)
    showToast(err?.data?.message || 'Failed to save settings', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
onBeforeUnmount(() => media.cleanup())
</script>
