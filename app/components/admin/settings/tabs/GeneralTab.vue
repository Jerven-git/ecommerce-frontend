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
