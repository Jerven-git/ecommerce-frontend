<template>
  <div class="space-y-6">
    <AdminSettingsTheme
      v-model="form.theme"
      :saved-theme="savedTheme"
      :saved-hero="savedHero"
      :saved-covers="savedCovers"
      @preset-applied="$emit('preset-applied', $event)"
    />

    <AdminSettingsLoadingScreen
      :logo-url="form.loader_logo_url"
      :animation="form.loader_animation"
      :uploading="mediaUploading.loader_logo"
      :progress="mediaProgress.loader_logo"
      @update:animation="form.loader_animation = $event"
      @media-select="$emit('media-select', $event, 'loader_logo')"
      @media-remove="$emit('media-remove', 'loader_logo')"
    />
  </div>
</template>

<script setup lang="ts">
import type { ThemeForm } from '~/components/admin/settings/Theme.vue'
import type { MediaCollection, UploadProgressState } from '~/composables/useMediaUpload'

interface PresetCovers {
  about: string
  blog: string
  services: string
  contact: string
}

defineProps<{
  form: Record<string, any>
  savedTheme: ThemeForm
  savedHero: { image: string, mime: string }
  savedCovers: PresetCovers
  mediaUploading: Record<MediaCollection, boolean>
  mediaProgress: Record<MediaCollection, UploadProgressState>
}>()

defineEmits<{
  'preset-applied': [value: { heroImage: string, heroMediaMime: string, covers: PresetCovers }]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()
</script>
