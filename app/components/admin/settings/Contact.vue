<template>
  <section data-guide="settings-contact" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">Contact</h2>
        <p class="text-xs text-gray-400">Click directly on text to edit &middot; Hover cards for options</p>
      </div>
    </div>

    <div class="p-4 space-y-6">
      <!-- Contact Image -->
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

      <!-- Contact image overlay controls -->
      <AdminSettingsOverlayControls
        heading="Contact Image Overlay"
        description="Darken or tint the contact image for better text readability."
        input-id-prefix="contact"
        :color="overlayColor"
        :opacity="overlayOpacity"
        show-preview
        :preview-image-url="imageUrl"
        preview-title="Contact Us"
        preview-subtitle="We'd love to hear from you"
        preview-empty-text="Upload a contact image to preview"
        @update:color="emit('update:overlay-color', $event)"
        @update:opacity="emit('update:overlay-opacity', $event)"
      />

      <!-- ═══════════ Info Card Display ═══════════ -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Contact Info Card</span>
        </div>
        <div class="bg-white overflow-hidden">
          <!-- Card header (mimics the actual page) -->
          <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <input
                :value="contactPage.info_title"
                @input="updateField('info_title', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-xs font-semibold text-gray-900"
                placeholder="Title (e.g. Get In Touch)"
              />
              <input
                :value="contactPage.info_subtitle"
                @input="updateField('info_subtitle', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-[10px] text-gray-400"
                placeholder="Subtitle"
              />
            </div>
          </div>

          <div class="px-5 py-4 space-y-4">
            <!-- Description -->
            <input
              :value="contactPage.info_description"
              @input="updateField('info_description', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline text-xs text-gray-500 leading-relaxed"
              placeholder="Description text..."
            />

            <!-- Badge -->
            <div class="flex items-center">
              <div class="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-[10px] font-semibold px-3 py-1.5 rounded-lg">
                <span class="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                <input
                  :value="contactPage.info_badge"
                  @input="updateField('info_badge', ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="bg-transparent border-none outline-none text-primary-700 text-[10px] font-semibold placeholder-primary-300 w-full"
                  placeholder="Badge text"
                />
              </div>
            </div>

            <!-- Contact Entries -->
            <div class="space-y-2 pt-1">
              <div
                v-for="(entry, i) in entries"
                :key="i"
                class="group/entry relative p-3 rounded-xl border border-gray-100 hover:border-primary-200 transition-all"
              >
                <!-- Remove entry button -->
                <button
                  v-if="entries.length > 1"
                  type="button"
                  class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/entry:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                  @click="emit('remove-entry', i)"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <!-- Label -->
                <input
                  v-model="entry.label"
                  type="text"
                  class="edit-inline text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
                  placeholder="Label (e.g. Sales, Support)"
                />

                <!-- Email row -->
                <div class="flex items-center gap-2 mb-1.5">
                  <div class="w-6 h-6 rounded-md bg-primary-50 flex items-center justify-center shrink-0">
                    <svg class="w-3 h-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    v-model="entry.email"
                    type="email"
                    class="edit-inline text-xs text-gray-700 flex-1"
                    placeholder="email@example.com"
                  />
                </div>

                <!-- Phone row -->
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                    <svg class="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    v-model="entry.phone"
                    type="tel"
                    class="edit-inline text-xs text-gray-700 flex-1"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <!-- Add contact entry -->
              <button
                type="button"
                class="w-full rounded-xl border-2 border-dashed border-gray-200 py-3 flex items-center justify-center gap-1.5 text-gray-300 hover:text-primary-500 hover:border-primary-300 transition-all"
                @click="emit('add-entry')"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                <span class="text-[10px] font-medium">Add Contact</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════ Support Promises Display ═══════════ -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Support Promises</span>
        </div>
        <div class="py-8 px-6 text-white text-center" :style="{ backgroundColor: themeColors.secondary }">
          <!-- Promises grid — matches public /contact (3 cols on desktop) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div
              v-for="(item, i) in contactPage.promises"
              :key="i"
              class="group/card relative flex flex-col items-center px-3"
            >
              <!-- Delete button -->
              <button
                v-if="contactPage.promises.length > 1"
                type="button"
                class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                @click="removePromiseItem(i)"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <!-- Icon -->
              <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <AdminIconPicker :model-value="item.icon || DEFAULT_ICON" @update:model-value="updatePromiseItem(i, 'icon', $event)" />
              </div>

              <input
                :value="item.title"
                @input="updatePromiseItem(i, 'title', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline-light text-xs font-semibold text-white mb-0.5 text-center"
                placeholder="Title"
              />
              <input
                :value="item.description"
                @input="updatePromiseItem(i, 'description', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline-light text-[10px] text-white/80 text-center leading-relaxed"
                placeholder="Description"
              />
            </div>

            <!-- Add promise -->
            <button
              v-if="contactPage.promises.length < 12"
              type="button"
              class="rounded-lg border-2 border-dashed border-white/20 py-6 flex flex-col items-center justify-center text-white/30 hover:text-white/70 hover:border-white/40 transition-all"
              @click="addPromiseItem"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              <span class="text-[8px] font-medium">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'
import type { ContactPage } from '~/composables/useSiteConfig'
import { DEFAULT_THEME } from '~/composables/useSiteConfig'
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
  overlayColor: string
  overlayOpacity: number
}>()

const emit = defineEmits<{
  'add-entry': []
  'remove-entry': [index: number]
  'update:contact-page': [value: ContactPage]
  'update:overlay-color': [value: string]
  'update:overlay-opacity': [value: number]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

const { siteConfig } = useSiteConfig()
const themeColors = computed(() => ({
  primary: siteConfig.value?.theme?.primary_color || DEFAULT_THEME.primary_color,
  secondary: siteConfig.value?.theme?.secondary_color || DEFAULT_THEME.secondary_color,
}))

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

<style scoped>
.edit-inline {
  display: block; width: 100%; background: transparent;
  border: 1px dashed transparent; border-radius: 0.375rem;
  padding: 0.25rem 0.5rem; outline: none; transition: all 0.15s ease;
}
.edit-inline:hover { border-color: rgb(165,180,252); background: rgb(238,242,255); }
.edit-inline:focus { border-color: rgb(99,102,241); border-style: solid; background: white; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
.edit-inline::placeholder { color: rgb(199,210,254); font-style: italic; }

.edit-inline-light {
  display: block; width: 100%; background: transparent;
  border: 1px dashed transparent; border-radius: 0.375rem;
  padding: 0.125rem 0.375rem; outline: none; transition: all 0.15s ease;
}
.edit-inline-light:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); }
.edit-inline-light:focus { border-color: rgba(255,255,255,0.5); border-style: solid; background: rgba(255,255,255,0.1); box-shadow: 0 0 0 2px rgba(255,255,255,0.12); }
.edit-inline-light::placeholder { color: rgba(255,255,255,0.3); font-style: italic; }
</style>
