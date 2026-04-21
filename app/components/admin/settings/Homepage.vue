<template>
  <section data-guide="settings-homepage" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">Home</h2>
        <p class="text-xs text-gray-400">Hero banner title, subtitle, and media</p>
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
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Hero Media</label>
        <AdminMediaUploader
          :url="modelValue.hero_image_url"
          :uploading="mediaUploading.hero"
          :video="isHeroVideo"
          accept="image/*,video/mp4,video/webm"
          label="Image or video"
          hint="JPG, PNG, GIF, MP4, WebM — max 10 MB · 1920×600 px recommended"
          input-id="heroMediaInput"
          preview-class="w-full h-44 object-cover"
          dropzone-class="h-40"
          overlay
          @select="(f: File) => emit('media-select', f, 'hero')"
          @remove="emit('media-remove', 'hero')"
        />
      </div>

      <!-- Header layout toggle -->
      <div class="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            :checked="modelValue.hero_full_bleed"
            @change="update('hero_full_bleed', ($event.target as HTMLInputElement).checked)"
            type="checkbox"
            class="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">Hero image flows under header</p>
            <p class="text-xs text-gray-500 mt-0.5">When on, the hero image extends behind a transparent header for a full-bleed look. When off, the header sits as its own band above the hero.</p>
          </div>
        </label>
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="modelValue.hero_full_bleed" class="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <svg class="w-4 h-4 shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-xs text-amber-800 leading-relaxed">
              Use a darker image, or increase the overlay opacity below, so the header navigation stays readable on top of the hero.
            </p>
          </div>
        </Transition>
      </div>

      <!-- Hero overlay controls -->
      <AdminSettingsOverlayControls
        heading="Hero Overlay"
        description="Darken or tint the hero image for better text readability."
        input-id-prefix="hero"
        :color="modelValue.hero_overlay_color"
        :opacity="modelValue.hero_overlay_opacity"
        show-preview
        :preview-image-url="modelValue.hero_image_url"
        :preview-media-mime="modelValue.hero_media_mime"
        :preview-object-position="focalPosition"
        :preview-title="modelValue.hero_title || 'Hero title preview'"
        :preview-subtitle="modelValue.hero_subtitle || 'Hero subtitle preview'"
        preview-empty-text="Upload a hero image to preview"
        @update:color="update('hero_overlay_color', $event)"
        @update:opacity="update('hero_overlay_opacity', $event)"
      />

      <!-- Focal point picker -->
      <div class="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-gray-800">Focal point</p>
            <p class="text-xs text-gray-500 mt-0.5">Click the image to choose the spot that must stay visible when the hero is cropped for mobile, desktop and ultra-wide screens.</p>
          </div>
          <button
            type="button"
            @click="resetFocal"
            class="text-xs text-primary-600 hover:underline shrink-0"
          >
            Reset to centre
          </button>
        </div>

        <!-- Clickable full image -->
        <div
          v-if="modelValue.hero_image_url && !isHeroVideo"
          @click="onFocalClick"
          class="relative w-full max-h-72 overflow-hidden rounded-lg border border-gray-200 cursor-crosshair select-none bg-gray-100"
        >
          <img
            :src="modelValue.hero_image_url"
            class="block w-full h-auto max-h-72 object-contain mx-auto"
            draggable="false"
            alt="Hero image focal point picker"
          />
          <!-- Crosshair pin -->
          <div
            class="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg bg-primary-500 ring-2 ring-primary-500/30 pointer-events-none transition-[left,top] duration-100"
            :style="{
              left: `${modelValue.hero_focal_x}%`,
              top: `${modelValue.hero_focal_y}%`,
              transform: 'translate(-50%, -50%)',
            }"
          />
        </div>
        <div
          v-else-if="isHeroVideo"
          class="rounded-lg border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500"
        >
          Focal point is only available for image heroes. Videos fall back to centre cropping.
        </div>
        <div
          v-else
          class="rounded-lg border border-dashed border-gray-300 p-6 text-center text-xs text-gray-400"
        >
          Upload a hero image above to choose its focal point.
        </div>

        <!-- Readout + mini crop previews -->
        <div v-if="modelValue.hero_image_url && !isHeroVideo">
          <p class="text-xs text-gray-500 mb-2">
            Focal point:
            <span class="font-mono text-gray-700">{{ modelValue.hero_focal_x }}% × {{ modelValue.hero_focal_y }}%</span>
          </p>
          <p class="text-xs font-medium text-gray-600 mb-2">How it crops on each screen</p>
          <div class="grid grid-cols-3 gap-3">
            <div v-for="crop in cropPreviews" :key="crop.label" class="space-y-1">
              <div
                class="relative w-full rounded-lg border border-gray-200 overflow-hidden bg-gray-200"
                :style="{ aspectRatio: crop.aspect }"
              >
                <img
                  :src="modelValue.hero_image_url"
                  alt=""
                  class="absolute inset-0 w-full h-full object-cover"
                  :style="{ objectPosition: focalPosition }"
                />
              </div>
              <p class="text-[10px] text-center text-gray-500">{{ crop.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'

export interface HomepageForm {
  hero_title: string
  hero_subtitle: string
  hero_overlay_color: string
  hero_overlay_opacity: number
  hero_full_bleed: boolean
  hero_focal_x: number
  hero_focal_y: number
  hero_image_url: string
  hero_media_mime: string
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

const isHeroVideo = computed(() => props.modelValue.hero_media_mime?.startsWith('video/'))

const cropPreviews = [
  { label: 'Mobile', aspect: '3 / 4' },
  { label: 'Desktop', aspect: '16 / 9' },
  { label: 'Ultra-wide', aspect: '21 / 7' },
]

const focalPosition = computed(
  () => `${props.modelValue.hero_focal_x}% ${props.modelValue.hero_focal_y}%`
)

function update<K extends keyof HomepageForm>(key: K, value: HomepageForm[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function resetFocal() {
  emit('update:modelValue', {
    ...props.modelValue,
    hero_focal_x: 50,
    hero_focal_y: 50,
  })
}

function onFocalClick(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
  emit('update:modelValue', {
    ...props.modelValue,
    hero_focal_x: Math.min(100, Math.max(0, x)),
    hero_focal_y: Math.min(100, Math.max(0, y)),
  })
}
</script>
