<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium">Settings</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Site Settings</h1>
      <p class="text-gray-500 text-sm mt-1">Manage your store's appearance and content</p>
    </div>

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

    <!-- Form -->
    <form v-else @submit.prevent="saveSettings" class="space-y-5 pb-24">
      <AdminSettingsGeneral
        :model-value="{ site_name: form.site_name, logo_url: form.logo_url, favicon_url: form.favicon_url, cart_icon_url: form.cart_icon_url }"
        :media-uploading="media.uploading"
        @update:model-value="Object.assign(form, $event)"
        @media-select="onMediaSelect"
        @media-remove="onMediaRemove"
      />

      <AdminSettingsTheme
        v-model="form.theme"
      />

      <AdminSettingsHomepage
        :model-value="{ hero_title: form.hero_title, hero_subtitle: form.hero_subtitle, hero_image_url: form.hero_image_url }"
        :media-uploading="media.uploading"
        @update:model-value="Object.assign(form, $event)"
        @media-select="onMediaSelect"
        @media-remove="onMediaRemove"
      />

      <AdminSettingsAbout
        :model-value="{ about_image_url: form.about_image_url, about_content: form.about_content }"
        :media-uploading="media.uploading"
        @update:model-value="Object.assign(form, $event)"
        @media-select="onMediaSelect"
        @media-remove="onMediaRemove"
      />

      <AdminSettingsFeatures
        :favorites-enabled="form.favorites_enabled"
        :show-stock-quantity="form.show_stock_quantity"
        @update:favorites-enabled="form.favorites_enabled = $event"
        @update:show-stock-quantity="form.show_stock_quantity = $event"
      />

      <AdminSettingsContact
        :image-url="form.contact_image_url"
        :entries="form.contact_entries"
        :media-uploading="media.uploading"
        @add-entry="addContactEntry"
        @remove-entry="removeContactEntry"
        @media-select="onMediaSelect"
        @media-remove="onMediaRemove"
      />
    </form>

    <AdminSettingsSaveFooter
      :saving="saving"
      :success="success"
      :error="saveError"
      @save="saveSettings"
      @reset="loadSettings"
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

// --- Media upload composable ---
const media = useMediaUpload({
  collections: ['logo', 'favicon', 'cart_icon', 'hero', 'about', 'contact'],
  limits: {
    logo:      { maxMB: 2,  label: 'Logo' },
    favicon:   { maxMB: 2,  label: 'Site icon' },
    cart_icon: { maxMB: 2,  label: 'Cart icon' },
    hero:    { maxMB: 10, label: 'Hero image' },
    about:   { maxMB: 10, label: 'About image' },
    contact: { maxMB: 10, label: 'Contact image' },
  },
  apiFetch: $apiFetch,
})

// --- Page state ---
const loading = ref(true)
const saving = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const saveError = ref<string | null>(null)
const configId = ref<number | null>(null)

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
  hero_image_url: "",
  about_content: "",
  about_image_url: "",
  contact_image_url: "",
  contact_email: "",
  contact_phone: "",
  contact_entries: [{ label: '', email: '', phone: '' }] as ContactEntry[],
  favorites_enabled: false,
  show_stock_quantity: false,
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
    saveError.value = null
  } else {
    saveError.value = media.lastError.value
  }
}

function onMediaRemove(collection: MediaCollection) {
  media.markDeleted(collection)
  ;(form.value[urlFields[collection]] as string) = ''
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
        hero_image_url: response.data.hero_image_url || "",
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
      }
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
  success.value = false
  saveError.value = null

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
        about_content: form.value.about_content,
        contact_email: form.value.contact_email,
        contact_phone: form.value.contact_phone,
        contact_entries: form.value.contact_entries,
        favorites_enabled: form.value.favorites_enabled,
        show_stock_quantity: form.value.show_stock_quantity,
      },
    })

    // Refresh shared siteConfig so the theme updates live
    const { fetchSiteConfig, broadcastConfigUpdate } = useSiteConfig()
    useState<boolean>('siteConfigFetched').value = false
    await fetchSiteConfig()

    // Notify other open tabs to re-fetch and apply the new theme
    broadcastConfigUpdate()

    success.value = true
    setTimeout(() => (success.value = false), 3000)
    await loadSettings()
  } catch (err: any) {
    console.error("Save failed:", err?.data || err)
    saveError.value = err?.data?.message || "Failed to save settings"
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
onBeforeUnmount(() => media.cleanup())
</script>
