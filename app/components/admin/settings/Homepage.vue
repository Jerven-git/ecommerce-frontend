<template>
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
          <input :value="modelValue.hero_title" @input="update('hero_title', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Welcome to our store" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Hero Subtitle</label>
          <input :value="modelValue.hero_subtitle" @input="update('hero_subtitle', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Discover something amazing" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Hero Image</label>
        <AdminMediaUploader
          :url="modelValue.hero_image_url"
          :uploading="mediaUploading.hero"
          label="Image"
          hint="JPG, PNG, GIF — max 5 MB · 1920×600 px recommended"
          input-id="heroImageInput"
          preview-class="w-full h-44 object-cover"
          dropzone-class="h-40"
          overlay
          @select="(f: File) => emit('media-select', f, 'hero')"
          @remove="emit('media-remove', 'hero')"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'

export interface HomepageForm {
  hero_title: string
  hero_subtitle: string
  hero_image_url: string
}

interface Props {
  modelValue: HomepageForm
  mediaUploading: Record<string, boolean>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: HomepageForm]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

function update(key: keyof HomepageForm, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
