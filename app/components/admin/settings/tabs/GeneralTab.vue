<template>
  <div class="space-y-5">
    <AdminSettingsGeneral
      :model-value="{ site_name: form.site_name, logo_url: form.logo_url, favicon_url: form.favicon_url, cart_icon_url: form.cart_icon_url }"
      :media-uploading="mediaUploading"
      @update:model-value="Object.assign(form, $event)"
      @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
      @media-remove="(c: MediaCollection) => emit('media-remove', c)"
    />

    <AdminSettingsFeatures
      :favorites-enabled="form.favorites_enabled"
      :show-stock-quantity="form.show_stock_quantity"
      @update:favorites-enabled="form.favorites_enabled = $event"
      @update:show-stock-quantity="form.show_stock_quantity = $event"
    />

    <AdminSeoFields
      v-model:seo-title="form.default_seo_title"
      v-model:seo-description="form.default_seo_description"
      v-model:og-image-url="form.default_og_image_url"
      title-placeholder="Defaults to site name"
      description-placeholder="Used on pages without their own description"
      hide-noindex
    />

    <!-- Social media links -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-900">Social media links</p>
          <p class="text-xs text-gray-400">Shown as icons in the site footer. Pick a platform, paste the full URL.</p>
        </div>
        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100"
          @click="addSocialLink"
        >
          <Icon name="heroicons:plus" class="w-4 h-4" />
          Add link
        </button>
      </div>

      <p v-if="!form.social_links?.length" class="text-xs text-gray-400 italic">No social links yet. Click "Add link" to add one.</p>

      <div v-else class="space-y-2">
        <div
          v-for="(link, idx) in form.social_links"
          :key="idx"
          class="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-2 items-start"
        >
          <select
            v-model="link.platform"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
          >
            <option value="" disabled>Platform…</option>
            <option v-for="opt in SOCIAL_PLATFORMS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <input
            v-model="link.url"
            type="url"
            placeholder="https://…"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
          <button
            type="button"
            class="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
            :aria-label="`Remove ${link.platform || 'social link'}`"
            @click="removeSocialLink(Number(idx))"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Canonical base URL + logo alt text -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div>
        <p class="text-sm font-semibold text-gray-900">Site URL &amp; logo accessibility</p>
        <p class="text-xs text-gray-400">Set once per environment. Used to emit canonical URLs and to label your logo.</p>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Canonical base URL</label>
        <input
          v-model="form.canonical_base_url"
          type="url"
          placeholder="https://shopsystemunited.com"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <p class="text-[11px] text-gray-400 mt-1">No trailing slash. Used for &lt;link rel="canonical"&gt; and og:url so duplicate URLs (utm params, staging) consolidate to one.</p>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Logo alt text</label>
        <input
          v-model="form.logo_alt_text"
          type="text"
          maxlength="255"
          :placeholder="`Defaults to site name${form.site_name ? ` — “${form.site_name}”` : ''}`"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'

const props = defineProps<{
  form: Record<string, any>
  mediaUploading: Record<string, boolean>
}>()

const emit = defineEmits<{
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'threads', label: 'Threads' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'discord', label: 'Discord' },
  { value: 'github', label: 'GitHub' },
  { value: 'website', label: 'Website / Other' },
]

function addSocialLink(): void {
  if (!Array.isArray(props.form.social_links)) {
    props.form.social_links = []
  }
  props.form.social_links.push({ platform: '', url: '', label: '' })
}

function removeSocialLink(idx: number): void {
  props.form.social_links.splice(idx, 1)
}
</script>
