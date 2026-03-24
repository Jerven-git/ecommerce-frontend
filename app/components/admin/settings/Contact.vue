<template>
  <section data-guide="settings-contact" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
        @click="emit('add-entry')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
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
          :url="imageUrl"
          :uploading="mediaUploading.contact ?? false"
          label="Image"
          hint="JPG, PNG, GIF — max 5 MB · 800×600 px recommended"
          input-id="contactImageInput"
          preview-class="w-full h-40 object-cover"
          dropzone-class="h-40"
          overlay
          @select="(f: File) => emit('media-select', f, 'contact')"
          @remove="emit('media-remove', 'contact')"
        />
      </div>

      <div class="space-y-3">
        <AdminContactEntryCard
          v-for="(entry, i) in entries"
          :key="i"
          :entry="entry"
          :show-remove="entries.length > 1"
          @remove="emit('remove-entry', i)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'

export interface ContactEntry {
  label: string
  email: string
  phone: string
}

defineProps<{
  imageUrl: string
  entries: ContactEntry[]
  mediaUploading: Record<string, boolean>
}>()

const emit = defineEmits<{
  'add-entry': []
  'remove-entry': [index: number]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()
</script>
