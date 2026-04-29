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
        :saved-hero="savedHero"
        @preset-applied="onPresetApplied"
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

      <AdminSettingsShowcase
        v-show="activeTab === 'showcase'"
        :model-value="form.homepage_showcase"
        :video-preview-url="form.showcase_video_url"
        :media-uploading="media.uploading"
        @update:model-value="form.homepage_showcase = $event"
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
import { THEME_PRESETS, type ThemePreset } from '~/composables/useTheme'
import { DEFAULT_MODULES_ENABLED, type ModulesEnabled } from '~/composables/useSiteConfig'

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
  { id: 'showcase', label: 'Showcase', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id: 'popup', label: 'Popup', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
  { id: 'modules', label: 'Modules', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
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
  collections: ['logo', 'favicon', 'cart_icon', 'hero', 'about', 'contact', 'blog', 'services', 'showcase_video'],
  limits: {
    logo:      { maxMB: 2,  label: 'Logo' },
    favicon:   { maxMB: 2,  label: 'Site icon' },
    cart_icon: { maxMB: 2,  label: 'Cart icon' },
    hero:    { maxMB: 10, label: 'Hero media', accept: ['image/', 'video/'] },
    about:   { maxMB: 10, label: 'About image' },
    contact: { maxMB: 10, label: 'Contact image' },
    blog:    { maxMB: 10, label: 'Blog image' },
    services:{ maxMB: 10, label: 'Services image' },
    showcase_video: { maxMB: 100, label: 'Showcase video', accept: ['video/'] },
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
  badge_in_stock_color: "#16a34a",
})

// Snapshot of the last-saved hero media — used as the revert target when
// deselecting a preset, mirroring how savedTheme reverts the colours.
const savedHero = ref({ image: '', mime: '' })

const { showToast } = useAdminToast()

// --- Save confirmation modal ---
const saveConfirmOpen = ref(false)

const tabSuccessMessages: Record<TabId, string> = {
  general: 'General settings have been updated',
  appearance: 'Theme has been applied',
  pages: 'Page content has been saved',
  showcase: 'Showcase has been saved',
  popup: 'Popup settings have been saved',
  modules: 'Module visibility has been updated',
}

const tabConfirmMessages: Record<TabId, string> = {
  general: 'Apply your general settings changes to the site?',
  appearance: 'Apply the new theme to your site?',
  pages: 'Save these page content changes?',
  showcase: 'Save these showcase changes?',
  popup: 'Save these popup settings?',
  modules: 'Apply these module visibility changes? Disabled pages will redirect to the homepage.',
}

const confirmMessage = computed(() => tabConfirmMessages[activeTab.value])

function requestSave() {
  if (saving.value) return

  const popup = form.value.welcome_popup
  if (popup.welcome_popup_enabled && !popup.welcome_popup_discount_id) {
    if (activeTab.value !== 'popup') activeTab.value = 'popup'
    showToast('Select a discount before enabling the welcome popup', 'error')
    return
  }

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
    badge_in_stock_color: "#16a34a",
  },
  logo_url: "",
  favicon_url: "",
  cart_icon_url: "",
  hero_title: "",
  hero_subtitle: "",
  hero_overlay_color: "#000000",
  hero_overlay_opacity: 45,
  hero_full_bleed: false,
  hero_focal_x: 50,
  hero_focal_y: 50,
  hero_image_url: "",
  hero_media_mime: "",
  about_content: "",
  about_image_url: "",
  about_overlay_color: "#000000",
  about_overlay_opacity: 45,
  contact_image_url: "",
  contact_overlay_color: "#000000",
  contact_overlay_opacity: 45,
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
  showcase_video_url: "",
  homepage_showcase: {
    enabled: false,
    label: 'Featured',
    heading: 'Find your product',
    subtitle: '',
    video_url: null,
    video_poster_url: null,
    video_status: 'idle',
    tiles: [
      { title: '', cta_label: 'SHOP NOW', category_id: null, featured_product_id: null },
      { title: '', cta_label: 'SHOP NOW', category_id: null, featured_product_id: null },
      { title: '', cta_label: 'SHOP NOW', category_id: null, featured_product_id: null },
      { title: '', cta_label: 'SHOP NOW', category_id: null, featured_product_id: null },
    ],
  } as import('~/composables/useSiteConfig').HomepageShowcase,
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
  blog_image_url: "",
  blog_overlay_color: "#000000",
  blog_overlay_opacity: 45,
  blog_page: {
    header: {
      label: 'BLOGS',
      heading: 'Blogs on product management & user feedback',
      subtitle: 'Insights, stories and updates from our team.',
    },
    cta: null as null | { heading: string; subtitle: string; button_label: string; button_link: string },
  },
  services_image_url: "",
  services_overlay_color: "#000000",
  services_overlay_opacity: 45,
  services_page: {
    header: {
      label: 'OUR SERVICES',
      heading: 'Services built around you',
      subtitle: 'Expert help across every stage — from setup to scale.',
      primary_cta: null as null | { label: string; link: string },
      secondary_cta: null as null | { label: string; link: string },
    },
    summary: null as null | { items: Array<{ title: string; description: string }> },
    stats: null as null | { items: Array<{ value: string; label: string }> },
    cta: null as null | { heading: string; subtitle: string; button_label: string; button_link: string },
  },
  modules_enabled: { ...DEFAULT_MODULES_ENABLED } as ModulesEnabled,
})

// Map collection -> form field
const urlFields: Record<MediaCollection, keyof typeof form.value> = {
  logo: 'logo_url',
  favicon: 'favicon_url',
  cart_icon: 'cart_icon_url',
  hero: 'hero_image_url',
  about: 'about_image_url',
  contact: 'contact_image_url',
  blog: 'blog_image_url',
  services: 'services_image_url',
  showcase_video: 'showcase_video_url',
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

function findActiveThemePreset(): ThemePreset | undefined {
  const t = form.value.theme
  return THEME_PRESETS.find(p =>
    p.primary.toLowerCase() === t.primary_color.toLowerCase()
    && p.secondary.toLowerCase() === t.secondary_color.toLowerCase()
    && p.accent.toLowerCase() === t.accent_color.toLowerCase()
    && p.headingFont === t.heading_font
    && p.bodyFont === t.body_font
    && p.texture === t.texture
  )
}

function onMediaRemove(collection: MediaCollection) {
  // Capture what was there before we clear — lets us tell a user upload
  // apart from a preset URL so we can restore the preset hero only when
  // it makes sense (see the hero branch below).
  const previousUrl = form.value[urlFields[collection]] as string

  media.markDeleted(collection)
  ;(form.value[urlFields[collection]] as string) = ''
  if (collection === 'hero') {
    form.value.hero_media_mime = ''
    // Only restore a preset's hero when the user is removing their own
    // upload (not when they're removing the preset image itself).
    const wasPresetHero = !!previousUrl && previousUrl.startsWith('/images/')
    if (!wasPresetHero) {
      const active = findActiveThemePreset()
      if (active) {
        form.value.hero_image_url = active.heroImage
        form.value.hero_media_mime = active.heroMediaMime
      }
    }
  }
}

function onPresetApplied({ heroImage, heroMediaMime }: { heroImage: string, heroMediaMime: string }) {
  // Protect a user-uploaded hero: if the current hero is a real upload
  // (not a preset URL) or a pending in-session upload, leave it alone.
  // Presets then apply colours/fonts only.
  const hasPendingUpload = !!media.pending.hero
  const current = form.value.hero_image_url
  const isPresetOrEmpty = !current || current.startsWith('/images/')

  if (hasPendingUpload || !isPresetOrEmpty) return

  // Current hero is empty or a preset URL — safe to swap. markDeleted clears
  // any stale preview and queues deletion of a server-side preset Media (if any).
  media.markDeleted('hero')
  form.value.hero_image_url = heroImage
  form.value.hero_media_mime = heroMediaMime
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
          badge_in_stock_color: response.data.badge_in_stock_color || "#16a34a",
        },
        logo_url: response.data.logo_url || "",
        favicon_url: response.data.favicon_url || "",
        cart_icon_url: response.data.cart_icon_url || "",
        hero_title: response.data.hero_title || "",
        hero_subtitle: response.data.hero_subtitle || "",
        hero_overlay_color: response.data.hero_overlay_color || "#000000",
        hero_overlay_opacity: response.data.hero_overlay_opacity ?? 45,
        hero_full_bleed: response.data.hero_full_bleed ?? false,
        hero_focal_x: response.data.hero_focal_x ?? 50,
        hero_focal_y: response.data.hero_focal_y ?? 50,
        hero_image_url: response.data.hero_image_url || "",
        hero_media_mime: response.data.hero_media_mime || "",
        about_content: response.data.about_content || "",
        about_image_url: response.data.about_image_url || "",
        about_overlay_color: response.data.about_overlay_color || "#000000",
        about_overlay_opacity: response.data.about_overlay_opacity ?? 45,
        contact_image_url: response.data.contact_image_url || "",
        contact_overlay_color: response.data.contact_overlay_color || "#000000",
        contact_overlay_opacity: response.data.contact_overlay_opacity ?? 45,
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
        showcase_video_url: response.data.homepage_showcase?.video_url || "",
        homepage_showcase: (() => {
          const shape = response.data.homepage_showcase
          // Server always returns 4 tiles, but be defensive in case of an older record.
          const tiles = Array.isArray(shape?.tiles) ? shape.tiles.slice(0, 4) : []
          while (tiles.length < 4) {
            tiles.push({ title: '', cta_label: 'SHOP NOW', category_id: null, featured_product_id: null })
          }
          return {
            enabled: !!shape?.enabled,
            label: shape?.label ?? 'Featured',
            heading: shape?.heading ?? 'Find your product',
            subtitle: shape?.subtitle ?? '',
            video_url: shape?.video_url ?? null,
            video_poster_url: shape?.video_poster_url ?? null,
            video_status: shape?.video_status ?? 'idle',
            tiles,
          }
        })(),
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
        blog_image_url: response.data.blog_image_url || "",
        blog_overlay_color: response.data.blog_overlay_color || "#000000",
        blog_overlay_opacity: response.data.blog_overlay_opacity ?? 45,
        blog_page: response.data.blog_page ?? {
          header: {
            label: 'BLOGS',
            heading: 'Blogs on product management & user feedback',
            subtitle: 'Insights, stories and updates from our team.',
          },
          cta: null,
        },
        services_image_url: response.data.services_image_url || "",
        services_overlay_color: response.data.services_overlay_color || "#000000",
        services_overlay_opacity: response.data.services_overlay_opacity ?? 45,
        services_page: (() => {
          const sp = response.data.services_page ?? {
            header: {
              label: 'OUR SERVICES',
              heading: 'Services built around you',
              subtitle: 'Expert help across every stage — from setup to scale.',
              primary_cta: null,
              secondary_cta: null,
            },
            summary: null,
            stats: null,
            cta: null,
          }
          // Ensure required shape keys exist on older records
          sp.header = sp.header ?? { label: '', heading: '', subtitle: '', primary_cta: null, secondary_cta: null }
          sp.header.primary_cta = sp.header.primary_cta ?? null
          sp.header.secondary_cta = sp.header.secondary_cta ?? null
          sp.summary = sp.summary ?? null
          sp.stats = sp.stats ?? null
          sp.cta = sp.cta ?? null
          // Strip any leftover groups from older records — content lives in services/service_categories tables now.
          delete (sp as any).groups
          return sp
        })(),
        modules_enabled: {
          ...DEFAULT_MODULES_ENABLED,
          ...(response.data.modules_enabled ?? {}),
        } as ModulesEnabled,
      }

      savedTheme.value = { ...form.value.theme }
      savedHero.value = { image: form.value.hero_image_url, mime: form.value.hero_media_mime }
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
        theme: (({ badge_in_stock_color: _, ...t }) => t)(form.value.theme),
        badge_in_stock_color: form.value.theme.badge_in_stock_color,
        hero_title: form.value.hero_title,
        hero_subtitle: form.value.hero_subtitle,
        hero_overlay_color: form.value.hero_overlay_color,
        hero_overlay_opacity: form.value.hero_overlay_opacity,
        hero_full_bleed: form.value.hero_full_bleed,
        hero_focal_x: form.value.hero_focal_x,
        hero_focal_y: form.value.hero_focal_y,
        hero_image_url: form.value.hero_image_url,
        hero_media_mime: form.value.hero_media_mime,
        about_content: form.value.about_content,
        about_overlay_color: form.value.about_overlay_color,
        about_overlay_opacity: form.value.about_overlay_opacity,
        contact_overlay_color: form.value.contact_overlay_color,
        contact_overlay_opacity: form.value.contact_overlay_opacity,
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
        // Strip server-owned fields (video_url/poster come from media,
        // video_status is owned by OptimizeShowcaseVideoJob).
        homepage_showcase: {
          enabled: form.value.homepage_showcase.enabled,
          label: form.value.homepage_showcase.label,
          heading: form.value.homepage_showcase.heading,
          subtitle: form.value.homepage_showcase.subtitle,
          tiles: form.value.homepage_showcase.tiles,
        },
        about_highlights: form.value.about_highlights,
        shop_header: form.value.shop_header,
        shop_promo: form.value.shop_promo,
        contact_page: form.value.contact_page,
        blog_page: form.value.blog_page,
        blog_overlay_color: form.value.blog_overlay_color,
        blog_overlay_opacity: form.value.blog_overlay_opacity,
        services_page: form.value.services_page,
        services_overlay_color: form.value.services_overlay_color,
        services_overlay_opacity: form.value.services_overlay_opacity,
        modules_enabled: form.value.modules_enabled,
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
