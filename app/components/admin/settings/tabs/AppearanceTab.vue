<template>
  <div class="space-y-6">
    <AdminSettingsTheme
      v-model="form.theme"
      :saved-theme="savedTheme"
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

defineProps<{
  form: Record<string, any>
  savedTheme: ThemeForm
  mediaUploading: Record<MediaCollection, boolean>
  mediaProgress: Record<MediaCollection, UploadProgressState>
}>()

defineEmits<{
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()
</script>
