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
      <div class="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
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

      <!-- General Settings -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">General</h2>
            <p class="text-xs text-gray-400">Store name, logo, and site icon</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
            <input v-model="form.site_name" type="text" class="input-field" placeholder="My Awesome Store" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
              <AdminMediaUploader
                :url="form.logo_url"
                :uploading="media.uploading.logo"
                label="Logo"
                hint="PNG, JPG, SVG — max 2 MB"
                input-id="logoInput"
                preview-class="h-16 w-auto rounded-lg object-contain"
                @select="(f) => onMediaSelect(f, 'logo')"
                @remove="onMediaRemove('logo')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Site Icon</label>
              <AdminMediaUploader
                :url="form.favicon_url"
                :uploading="media.uploading.favicon"
                label="Icon"
                hint="Square preferred — max 2 MB"
                input-id="faviconInput"
                preview-class="h-16 w-16 rounded-lg object-contain"
                @select="(f) => onMediaSelect(f, 'favicon')"
                @remove="onMediaRemove('favicon')"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Theme -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Theme</h2>
            <p class="text-xs text-gray-400">Colors, fonts, and presets</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <!-- Theme Presets -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Theme Presets</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in themePresets"
                :key="preset.name"
                type="button"
                class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all hover:shadow-sm"
                :class="isActivePreset(preset) ? 'border-gray-400 bg-gray-50 ring-1 ring-gray-300' : 'border-gray-200 hover:border-gray-300'"
                @click="applyPreset(preset)"
              >
                <span class="flex gap-0.5">
                  <span class="w-4 h-4 rounded-full border border-white shadow-sm" :style="{ backgroundColor: preset.primary }"></span>
                  <span class="w-4 h-4 rounded-full border border-white shadow-sm" :style="{ backgroundColor: preset.secondary }"></span>
                </span>
                {{ preset.name }}
              </button>
            </div>
          </div>

          <!-- Color Pickers -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Primary Color</label>
              <div class="flex items-center gap-2">
                <div class="relative shrink-0">
                  <input v-model="form.primary_color" type="color" class="sr-only" id="primaryColorPicker" />
                  <label
                    for="primaryColorPicker"
                    class="block w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow ring-1 ring-gray-200 hover:scale-105 transition-transform"
                    :style="{ backgroundColor: form.primary_color }"
                  />
                </div>
                <input v-model="form.primary_color" type="text" class="input-field font-mono text-sm" placeholder="#6898ED" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Secondary Color</label>
              <div class="flex items-center gap-2">
                <div class="relative shrink-0">
                  <input v-model="form.secondary_color" type="color" class="sr-only" id="secondaryColorPicker" />
                  <label
                    for="secondaryColorPicker"
                    class="block w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow ring-1 ring-gray-200 hover:scale-105 transition-transform"
                    :style="{ backgroundColor: form.secondary_color }"
                  />
                </div>
                <input v-model="form.secondary_color" type="text" class="input-field font-mono text-sm" placeholder="#4B5979" />
              </div>
            </div>
          </div>

          <!-- Preview bar -->
          <div class="rounded-xl overflow-hidden border border-gray-100 h-14 flex">
            <div
              class="flex-1 flex items-center justify-center text-white text-sm font-semibold"
              :style="{ backgroundColor: form.primary_color }"
            >
              Primary
            </div>
            <div
              class="flex-1 flex items-center justify-center text-white text-sm font-semibold"
              :style="{ backgroundColor: form.secondary_color }"
            >
              Secondary
            </div>
          </div>

          <!-- Fonts -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Heading Font</label>
              <select v-model="form.heading_font" class="input-field text-sm">
                <option v-for="font in availableFonts" :key="font" :value="font">{{ font }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Body Font</label>
              <select v-model="form.body_font" class="input-field text-sm">
                <option v-for="font in availableFonts" :key="font" :value="font">{{ font }}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Homepage Content -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Homepage</h2>
            <p class="text-xs text-gray-400">Hero banner title, subtitle, and image</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Hero Title</label>
              <input v-model="form.hero_title" type="text" class="input-field" placeholder="Welcome to our store" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Hero Subtitle</label>
              <input v-model="form.hero_subtitle" type="text" class="input-field" placeholder="Discover something amazing" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Hero Image</label>
            <AdminMediaUploader
              :url="form.hero_image_url"
              :uploading="media.uploading.hero"
              label="Image"
              hint="JPG, PNG, GIF — max 5 MB · 1920×600 px recommended"
              input-id="heroImageInput"
              preview-class="w-full h-44 object-cover"
              dropzone-class="h-40"
              overlay
              @select="(f) => onMediaSelect(f, 'hero')"
              @remove="onMediaRemove('hero')"
            />
          </div>
        </div>
      </section>

      <!-- About Page -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">About Page</h2>
            <p class="text-xs text-gray-400">Image and body content</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">About Image</label>
            <AdminMediaUploader
              :url="form.about_image_url"
              :uploading="media.uploading.about"
              label="Image"
              hint="JPG, PNG, GIF — max 5 MB · 800×600 px recommended"
              input-id="aboutImageInput"
              preview-class="w-full h-40 object-cover"
              dropzone-class="h-40"
              overlay
              @select="(f) => onMediaSelect(f, 'about')"
              @remove="onMediaRemove('about')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">About Content</label>
            <textarea
              v-model="form.about_content"
              rows="6"
              class="input-field resize-none leading-relaxed"
              placeholder="Tell your customers about your brand…"
            ></textarea>
          </div>
        </div>
      </section>

      <!-- Contact Information -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-sm font-semibold text-gray-900">Contact</h2>
            <p class="text-xs text-gray-400">Contact page image and contact entries</p>
          </div>
          <button
            type="button"
            @click="addContactEntry"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Contact
          </button>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Contact Image</label>
            <AdminMediaUploader
              :url="form.contact_image_url"
              :uploading="media.uploading.contact"
              label="Image"
              hint="JPG, PNG, GIF — max 5 MB · 800×600 px recommended"
              input-id="contactImageInput"
              preview-class="w-full h-40 object-cover"
              dropzone-class="h-40"
              overlay
              @select="(f) => onMediaSelect(f, 'contact')"
              @remove="onMediaRemove('contact')"
            />
          </div>

          <!-- Repeatable Contact Entries -->
          <div class="space-y-3">
            <AdminContactEntryCard
              v-for="(entry, i) in form.contact_entries"
              :key="i"
              :entry="entry"
              :show-remove="form.contact_entries.length > 1"
              @remove="removeContactEntry(i)"
            />
          </div>
        </div>
      </section>
    </form>

    <!-- Sticky Save Footer -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Feedback messages -->
        <div class="flex items-center min-w-0">
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="success" class="flex items-center gap-2 text-green-700 text-sm font-medium">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Saved successfully
            </div>
          </Transition>
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-if="saveError" class="flex items-center gap-2 text-red-600 text-sm font-medium min-w-0">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="truncate">{{ saveError }}</span>
            </div>
          </Transition>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-3 shrink-0">
          <button
            @click="loadSettings"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="saving"
          >
            Reset
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="saving"
            @click="saveSettings"
          >
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'
import { AVAILABLE_FONTS } from '~/composables/useTheme'

definePageMeta({ middleware: "auth" })

interface ContactEntry {
  label: string
  email: string
  phone: string
}

interface SiteConfigResponse {
  data: Record<string, any>
}

// --- Theme presets ---
interface ThemePreset {
  name: string
  primary: string
  secondary: string
}

const themePresets: ThemePreset[] = [
  { name: 'Ocean Blue', primary: '#6898ED', secondary: '#4B5979' },
  { name: 'Forest Green', primary: '#4CAF50', secondary: '#2E7D32' },
  { name: 'Warm Sunset', primary: '#FF7043', secondary: '#BF360C' },
  { name: 'Soft Lavender', primary: '#9575CD', secondary: '#4527A0' },
  { name: 'Minimal Mono', primary: '#424242', secondary: '#212121' },
]

const availableFonts = AVAILABLE_FONTS

function applyPreset(preset: ThemePreset) {
  form.value.primary_color = preset.primary
  form.value.secondary_color = preset.secondary
}

function isActivePreset(preset: ThemePreset): boolean {
  return form.value.primary_color.toLowerCase() === preset.primary.toLowerCase()
    && form.value.secondary_color.toLowerCase() === preset.secondary.toLowerCase()
}

const { $apiFetch } = useNuxtApp()

// --- Media upload composable ---
const media = useMediaUpload({
  collections: ['logo', 'favicon', 'hero', 'about', 'contact'],
  limits: {
    logo:    { maxMB: 2,  label: 'Logo' },
    favicon: { maxMB: 2,  label: 'Site icon' },
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
  primary_color: "#6898ED",
  secondary_color: "#4B5979",
  heading_font: "Inter",
  body_font: "Inter",
  logo_url: "",
  favicon_url: "",
  hero_title: "",
  hero_subtitle: "",
  hero_image_url: "",
  about_content: "",
  about_image_url: "",
  contact_image_url: "",
  contact_email: "",
  contact_phone: "",
  contact_entries: [{ label: '', email: '', phone: '' }] as ContactEntry[],
})

// Map collection -> form field
const urlFields: Record<MediaCollection, keyof typeof form.value> = {
  logo: 'logo_url',
  favicon: 'favicon_url',
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
        primary_color: response.data.primary_color || "#6898ED",
        secondary_color: response.data.secondary_color || "#4B5979",
        heading_font: response.data.heading_font || "Inter",
        body_font: response.data.body_font || "Inter",
        logo_url: response.data.logo_url || "",
        favicon_url: response.data.favicon_url || "",
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
        primary_color: form.value.primary_color,
        secondary_color: form.value.secondary_color,
        heading_font: form.value.heading_font,
        body_font: form.value.body_font,
        hero_title: form.value.hero_title,
        hero_subtitle: form.value.hero_subtitle,
        about_content: form.value.about_content,
        contact_email: form.value.contact_email,
        contact_phone: form.value.contact_phone,
        contact_entries: form.value.contact_entries,
      },
    })

    // Refresh shared siteConfig so the theme updates live
    const { fetchSiteConfig } = useSiteConfig()
    useState<boolean>('siteConfigFetched').value = false
    await fetchSiteConfig()

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
