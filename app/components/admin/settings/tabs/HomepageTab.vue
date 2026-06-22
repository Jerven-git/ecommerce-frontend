<template>
  <div class="space-y-5">
    <AdminSettingsHomepage
      :model-value="{ hero_title: form.hero_title, hero_subtitle: form.hero_subtitle, hero_overlay_color: form.hero_overlay_color, hero_overlay_opacity: form.hero_overlay_opacity, hero_focal_x: form.hero_focal_x, hero_focal_y: form.hero_focal_y, hero_image_url: form.hero_image_url, hero_media_mime: form.hero_media_mime }"
      :media-uploading="mediaUploading"
      @update:model-value="Object.assign(form, $event)"
      @media-select="(f: File, c: MediaCollection) => emit('media-select', f, c)"
      @media-remove="(c: MediaCollection) => emit('media-remove', c)"
    />

    <AdminSettingsHomepageSections
      :steps="form.homepage_steps"
      :features="form.homepage_features"
      :stats="form.homepage_stats"
      :statement="form.homepage_statement"
      :newsletter="form.homepage_newsletter"
      :image-url="form.homepage_statement_image_url"
      :media-uploading="mediaUploading"
      @update:steps="form.homepage_steps = $event"
      @update:features="form.homepage_features = $event"
      @update:stats="form.homepage_stats = $event"
      @update:statement="form.homepage_statement = $event"
      @update:newsletter="form.homepage_newsletter = $event"
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
}>()
</script>
