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

defineProps<{
  form: Record<string, any>
  mediaUploading: Record<string, boolean>
}>()

const emit = defineEmits<{
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()
</script>
