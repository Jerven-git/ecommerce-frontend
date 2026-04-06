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

      <hr class="border-gray-100" />

      <!-- Info Card Text -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 mb-3">Info Card</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Title</label>
            <input :value="contactPage.info_title" @input="updateField('info_title', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Get In Touch" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
            <input :value="contactPage.info_subtitle" @input="updateField('info_subtitle', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="We'd love to hear from you" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <input :value="contactPage.info_description" @input="updateField('info_description', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Have a question or need assistance?..." />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Badge</label>
            <input :value="contactPage.info_badge" @input="updateField('info_badge', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Usually responds within 24 hours" />
          </div>
        </div>
      </div>

      <hr class="border-gray-100" />

      <!-- Support Promises -->
      <div>
        <h3 class="text-sm font-semibold text-gray-800 mb-3">Support Promises</h3>
        <div class="space-y-2">
          <div v-for="(item, i) in contactPage.promises" :key="i" class="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <AdminIconPicker :model-value="item.icon || DEFAULT_ICON" @update:model-value="updatePromiseItem(i, 'icon', $event)" class="mt-0.5" />
            <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input :value="item.title" @input="updatePromiseItem(i, 'title', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Title" />
              <input :value="item.description" @input="updatePromiseItem(i, 'description', ($event.target as HTMLInputElement).value)" type="text" class="input-field" placeholder="Description" />
            </div>
            <button v-if="contactPage.promises.length > 1" type="button" class="mt-2 text-gray-300 hover:text-red-500 transition-colors" @click="removePromiseItem(i)">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <button v-if="contactPage.promises.length < 6" type="button" class="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors" @click="addPromiseItem">+ Add promise</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'
import type { ContactPage } from '~/composables/useSiteConfig'
import { DEFAULT_ICON } from '~/composables/useHighlightIcons'

export interface ContactEntry {
  label: string
  email: string
  phone: string
}

const props = defineProps<{
  imageUrl: string
  entries: ContactEntry[]
  contactPage: ContactPage
  mediaUploading: Record<string, boolean>
}>()

const emit = defineEmits<{
  'add-entry': []
  'remove-entry': [index: number]
  'update:contact-page': [value: ContactPage]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

function updateField(key: keyof ContactPage, value: string) {
  emit('update:contact-page', { ...props.contactPage, [key]: value })
}

function updatePromiseItem(index: number, key: 'icon' | 'title' | 'description', value: string) {
  const promises = props.contactPage.promises.map((item, i) => i === index ? { ...item, [key]: value } : item)
  emit('update:contact-page', { ...props.contactPage, promises })
}

function removePromiseItem(index: number) {
  emit('update:contact-page', { ...props.contactPage, promises: props.contactPage.promises.filter((_, i) => i !== index) })
}

function addPromiseItem() {
  emit('update:contact-page', { ...props.contactPage, promises: [...props.contactPage.promises, { icon: DEFAULT_ICON, title: '', description: '' }] })
}
</script>
