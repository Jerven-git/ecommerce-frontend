<template>
  <div class="space-y-5">
    <AdminSettingsAbout
      :model-value="{ about_image_url: form.about_image_url, about_content: form.about_content }"
      :highlights="form.about_highlights"
      :media-uploading="mediaUploading"
      @update:model-value="Object.assign(form, $event)"
      @update:highlights="form.about_highlights = $event"
      @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
      @media-remove="(c: MediaCollection) => emit('media-remove', c)"
    />

    <AdminSettingsShop
      :header="form.shop_header"
      :promo="form.shop_promo"
      @update:header="form.shop_header = $event"
      @update:promo="form.shop_promo = $event"
    />

    <AdminSettingsContact
      :image-url="form.contact_image_url"
      :entries="form.contact_entries"
      :contact-page="form.contact_page"
      :media-uploading="mediaUploading"
      @add-entry="emit('add-contact-entry')"
      @remove-entry="(i: number) => emit('remove-contact-entry', i)"
      @update:contact-page="form.contact_page = $event"
      @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
      @media-remove="(c: MediaCollection) => emit('media-remove', c)"
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
  'add-contact-entry': []
  'remove-contact-entry': [index: number]
}>()
</script>
