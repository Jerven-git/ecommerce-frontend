<template>
  <section data-guide="settings-loading-screen" class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div class="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 0114.93-4M20 12a8 8 0 01-14.93 4M19 4v4h-4M5 20v-4h4" />
        </svg>
      </div>
      <div class="min-w-0">
        <h2 class="text-sm font-semibold text-gray-900">Loading screen</h2>
        <p class="text-xs leading-5 text-gray-500">Brand the brief pause between storefront pages</p>
      </div>
    </div>

    <div class="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
      <div class="min-w-0 space-y-6">
        <div>
          <div class="mb-2">
            <h3 class="text-sm font-medium text-gray-800">Loading logo</h3>
            <p class="mt-1 text-xs leading-5 text-gray-500">Optional. Without a logo, the theme-colored square animation remains the default.</p>
          </div>

          <AdminMediaUploader
            :url="logoUrl"
            :uploading="uploading"
            :progress="progress"
            label="Loading logo"
            hint="PNG, JPG, WebP, SVG, GIF — max 2 MB"
            input-id="loaderLogoInput"
            preview-class="max-h-16 max-w-full object-contain"
            @select="emit('media-select', $event)"
            @remove="emit('media-remove')"
          />
        </div>

        <fieldset :disabled="!logoUrl">
          <legend class="text-sm font-medium text-gray-800">Logo animation</legend>
          <p class="mt-1 text-xs leading-5 text-gray-500">Choose how the uploaded logo moves while the next page loads.</p>

          <div class="mt-3 grid gap-2 sm:grid-cols-3">
            <button
              v-for="option in animationOptions"
              :key="option.value"
              type="button"
              class="flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-45"
              :class="animation === option.value
                ? 'border-primary-500 bg-primary-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50'"
              :aria-pressed="animation === option.value"
              @click="emit('update:animation', option.value)"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm" aria-hidden="true">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="option.icon" />
                </svg>
              </span>
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-gray-900">{{ option.label }}</span>
                <span class="mt-0.5 block text-xs leading-4 text-gray-500">{{ option.description }}</span>
              </span>
            </button>
          </div>
        </fieldset>
      </div>

      <div class="min-w-0">
        <p class="mb-2 text-sm font-medium text-gray-800">Live preview</p>
        <div class="flex min-h-64 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-6 ring-1 ring-inset ring-gray-200">
          <div class="flex flex-col items-center text-center">
            <StorefrontLoaderMark :logo-url="logoUrl" :animation="animation" aria-hidden="true" />
            <p class="mt-4 text-sm font-medium text-gray-700">Loading page</p>
            <div class="mt-3 h-0.5 w-24 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
              <span class="preview-progress block h-full w-1/2 origin-left rounded-full bg-primary-600" />
            </div>
          </div>
        </div>
        <p class="mt-2 text-xs leading-5 text-gray-500">The preview uses the storefront theme and respects visitors' reduced-motion preference.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LoaderLogoAnimation } from '~/composables/useSiteConfig'
import type { UploadProgressState } from '~/composables/useMediaUpload'

defineProps<{
  logoUrl: string
  animation: LoaderLogoAnimation
  uploading?: boolean
  progress?: UploadProgressState
}>()

const emit = defineEmits<{
  'update:animation': [value: LoaderLogoAnimation]
  'media-select': [file: File]
  'media-remove': []
}>()

const animationOptions: Array<{
  value: LoaderLogoAnimation
  label: string
  description: string
  icon: string
}> = [
  { value: 'bounce', label: 'Bounce', description: 'A calm vertical lift', icon: 'M12 19V5m0 0L7 10m5-5l5 5' },
  { value: 'rotate', label: 'Rotate', description: 'A continuous turn', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { value: 'slide', label: 'Slide', description: 'A smooth side motion', icon: 'M5 12h14m0 0l-4-4m4 4l-4 4' },
]
</script>

<style scoped>
.preview-progress {
  animation: preview-progress 900ms cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes preview-progress {
  0% { opacity: 0; transform: translateX(-110%) scaleX(0.55); }
  35% { opacity: 1; }
  100% { opacity: 0; transform: translateX(210%) scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .preview-progress { animation: none; opacity: 0.7; transform: none; }
}
</style>
