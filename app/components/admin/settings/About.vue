<template>
  <section data-guide="settings-about" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
          :url="modelValue.about_image_url"
          :uploading="mediaUploading.about ?? false"
          label="Image"
          hint="JPG, PNG, GIF — max 5 MB · 800×600 px recommended"
          input-id="aboutImageInput"
          preview-class="w-full h-40 object-cover"
          dropzone-class="h-40"
          overlay
          @select="(f: File) => emit('media-select', f, 'about')"
          @remove="emit('media-remove', 'about')"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">About Content</label>
        <textarea
          :value="modelValue.about_content"
          @input="emit('update:modelValue', { ...modelValue, about_content: ($event.target as HTMLTextAreaElement).value })"
          rows="6"
          class="input-field resize-none leading-relaxed"
          placeholder="Tell your customers about your brand…"
        ></textarea>
      </div>

      <hr class="border-gray-100" />

      <!-- Highlights -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">Highlights</label>
        <div class="space-y-2">
          <div v-for="(item, i) in highlights.items" :key="i" class="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <AdminIconPicker :model-value="item.icon || 'check'" @update:model-value="updateHighlightItem(i, 'icon', $event)" class="mt-0.5" />
            <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input :value="item.title" @input="updateHighlightItem(i, 'title', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Title" />
              <input :value="item.description" @input="updateHighlightItem(i, 'description', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Description" />
            </div>
            <button v-if="highlights.items.length > 1" type="button" class="mt-2 text-gray-300 hover:text-red-500 transition-colors" @click="removeHighlightItem(i)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <button v-if="highlights.items.length < 6" type="button" class="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors" @click="addHighlightItem">+ Add highlight</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'

import type { AboutHighlights } from '~/composables/useSiteConfig'

export interface AboutForm {
  about_image_url: string
  about_content: string
}

const props = defineProps<{
  modelValue: AboutForm
  mediaUploading: Record<string, boolean>
  highlights: AboutHighlights
}>()

const emit = defineEmits<{
  'update:modelValue': [value: AboutForm]
  'update:highlights': [value: AboutHighlights]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

function updateHighlightItem(index: number, key: 'icon' | 'title' | 'description', value: string) {
  const items = props.highlights.items.map((item, i) => i === index ? { ...item, [key]: value } : item)
  emit('update:highlights', { items })
}

function removeHighlightItem(index: number) {
  emit('update:highlights', { items: props.highlights.items.filter((_, i) => i !== index) })
}

function addHighlightItem() {
  emit('update:highlights', { items: [...props.highlights.items, { icon: 'heroicons:check-circle', title: '', description: '' }] })
}
</script>
