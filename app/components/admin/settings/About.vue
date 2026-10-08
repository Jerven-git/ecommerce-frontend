<template>
  <section data-guide="settings-about" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
        <Icon name="heroicons:information-circle" class="w-4 h-4 text-amber-600" aria-hidden="true" />
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">About Page</h2>
        <p class="text-xs text-gray-400">Click directly on text to edit &middot; Hover cards for options</p>
      </div>
    </div>

    <div class="p-4 space-y-6">
      <!-- About Image -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">About Cover Image</label>
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

      <!-- Hero overlay controls -->
      <AdminSettingsOverlayControls
        heading="About Image Overlay"
        description="Darken or tint the about image for better text readability."
        input-id-prefix="about"
        :color="modelValue.about_overlay_color"
        :opacity="modelValue.about_overlay_opacity"
        show-preview
        :preview-image-url="modelValue.about_image_url"
        preview-title="About Us"
        preview-subtitle="Learn more about our story and mission"
        preview-empty-text="Upload an about image to preview"
        @update:color="update('about_overlay_color', $event)"
        @update:opacity="update('about_overlay_opacity', $event)"
      />

      <!-- ═══════════ Our Story Display ═══════════ -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Our Story</span>
        </div>
        <div class="bg-white overflow-hidden">
          <!-- Card header (mimics the actual page card) -->
          <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" :style="{ backgroundColor: (themeColors.primary) + '18' }">
              <Icon name="heroicons:book-open" class="w-3.5 h-3.5" :style="{ color: themeColors.primary }" aria-hidden="true" />
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-900">Our Story</p>
              <p class="text-[10px] text-gray-400">Who we are and what we stand for</p>
            </div>
          </div>
          <!-- Editable content -->
          <div class="px-5 py-4">
            <textarea
              :value="modelValue.about_content"
              @input="emit('update:modelValue', { ...modelValue, about_content: ($event.target as HTMLTextAreaElement).value })"
              rows="5"
              class="edit-inline text-sm text-gray-600 leading-relaxed resize-none w-full"
              placeholder="Tell your customers about your brand..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- ═══════════ Highlights Display ═══════════ -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Highlights</span>
        </div>
        <div class="bg-gray-50/80 p-6">
          <!-- Highlights grid — matches public /about (3 cols on desktop) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="(item, i) in highlights.items"
              :key="i"
              class="group/card relative rounded-xl border border-gray-100 shadow-sm p-4 bg-white hover:border-primary-200 hover:shadow-md transition-all"
            >
              <!-- Delete button -->
              <button
                v-if="highlights.items.length > 1"
                type="button"
                class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                @click="removeHighlightItem(i)"
              >
                <Icon name="heroicons:x-mark" class="w-3 h-3" aria-hidden="true" />
              </button>

              <!-- Icon -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-secondary-50 text-secondary-600">
                <AdminIconPicker :model-value="item.icon || 'heroicons:check-circle'" @update:model-value="updateHighlightItem(i, 'icon', $event)" />
              </div>

              <input
                :value="item.title"
                @input="updateHighlightItem(i, 'title', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-sm font-semibold text-secondary-800 mb-1"
                placeholder="Title"
              />
              <input
                :value="item.description"
                @input="updateHighlightItem(i, 'description', ($event.target as HTMLInputElement).value)"
                type="text"
                class="edit-inline text-xs text-gray-500 leading-relaxed"
                placeholder="Description"
              />
            </div>

            <!-- Add highlight card -->
            <button
              v-if="highlights.items.length < 12"
              type="button"
              class="rounded-xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center text-gray-300 hover:text-primary-500 hover:border-primary-300 transition-all min-h-[100px]"
              @click="addHighlightItem"
            >
              <Icon name="heroicons:plus" class="w-6 h-6 mb-1" aria-hidden="true" />
              <span class="text-[10px] font-medium">Add Highlight</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'
import type { AboutHighlights } from '~/composables/useSiteConfig'
import { DEFAULT_THEME } from '~/composables/useSiteConfig'

export interface AboutForm {
  about_image_url: string
  about_content: string
  about_overlay_color: string
  about_overlay_opacity: number
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

const { siteConfig } = useSiteConfig()
const themeColors = computed(() => ({
  primary: siteConfig.value?.theme?.primary_color || DEFAULT_THEME.primary_color,
  secondary: siteConfig.value?.theme?.secondary_color || DEFAULT_THEME.secondary_color,
}))

function update<K extends keyof AboutForm>(key: K, value: AboutForm[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

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

<style scoped>
.edit-inline {
  display: block; width: 100%; background: transparent;
  border: 1px dashed transparent; border-radius: 0.375rem;
  padding: 0.25rem 0.5rem; outline: none; transition: all 0.15s ease;
}
.edit-inline:hover { border-color: rgb(165,180,252); background: rgb(238,242,255); }
.edit-inline:focus { border-color: rgb(99,102,241); border-style: solid; background: white; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
.edit-inline::placeholder { color: rgb(199,210,254); font-style: italic; }
</style>
