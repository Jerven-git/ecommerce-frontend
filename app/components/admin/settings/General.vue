<template>
  <section data-guide="settings-general" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">General</h2>
        <p class="text-xs text-gray-400">Store name, logo, and site icon</p>
      </div>
    </div>

    <div class="p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
        <input :value="modelValue.site_name" @input="emit('update:modelValue', { ...modelValue, site_name: ($event.target as HTMLInputElement).value })" type="text" class="input-field" placeholder="My Awesome Store" />
      </div>

      <div class="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
        <svg class="w-4 h-4 shrink-0 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xs text-blue-900/80 leading-relaxed">
          <span class="font-semibold">Tip:</span> For the cleanest look, upload <span class="font-semibold">transparent PNG</span> files — or use an image whose background matches your site's header/footer colour so no seams are visible.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
          <AdminMediaUploader
            :url="modelValue.logo_url"
            :uploading="mediaUploading.logo"
            label="Logo"
            hint="PNG, JPG, SVG — max 2 MB"
            input-id="logoInput"
            preview-class="h-16 w-auto rounded-lg object-contain"
            @select="(f: File) => emit('media-select', f, 'logo')"
            @remove="emit('media-remove', 'logo')"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Site Icon</label>
          <AdminMediaUploader
            :url="modelValue.favicon_url"
            :uploading="mediaUploading.favicon"
            label="Icon"
            hint="Square preferred — max 2 MB"
            input-id="faviconInput"
            preview-class="h-16 w-16 rounded-lg object-contain"
            @select="(f: File) => emit('media-select', f, 'favicon')"
            @remove="emit('media-remove', 'favicon')"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Cart Icon</label>
          <AdminMediaUploader
            :url="modelValue.cart_icon_url"
            :uploading="mediaUploading.cart_icon"
            label="Cart Icon"
            hint="PNG, SVG — max 2 MB · 24×24 px recommended"
            input-id="cartIconInput"
            preview-class="h-16 w-16 rounded-lg object-contain"
            @select="(f: File) => emit('media-select', f, 'cart_icon')"
            @remove="emit('media-remove', 'cart_icon')"
          />
        </div>
      </div>

      <!-- Header logo size -->
      <div class="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
        <div class="flex items-center justify-between mb-2">
          <label for="logoSizeRange" class="text-sm font-medium text-gray-700">Header logo size</label>
          <span class="text-xs font-mono text-gray-500 tabular-nums">{{ modelValue.logo_size }}px</span>
        </div>
        <input
          id="logoSizeRange"
          type="range"
          min="20"
          max="64"
          step="1"
          :value="modelValue.logo_size"
          @input="emit('update:modelValue', { ...modelValue, logo_size: Number(($event.target as HTMLInputElement).value) })"
          class="w-full accent-primary-600 cursor-pointer"
        />
        <p class="text-[11px] text-gray-400 mt-1">
          Height of the logo in the header bar — the width scales automatically so the logo keeps its proportions and stays crisp at any size.
        </p>
        <div v-if="modelValue.logo_url" class="mt-3 flex items-center gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span class="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Preview</span>
          <img
            :src="modelValue.logo_url"
            :style="{ height: modelValue.logo_size + 'px' }"
            class="w-auto max-w-full object-contain"
            alt="Header logo preview"
          />
        </div>
      </div>

      <!-- Header layout toggle -->
      <div class="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            :checked="modelValue.hero_full_bleed"
            @change="emit('update:modelValue', { ...modelValue, hero_full_bleed: ($event.target as HTMLInputElement).checked })"
            type="checkbox"
            class="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">Cover images flow under header</p>
            <p class="text-xs text-gray-500 mt-0.5">When on, the cover image extends behind a transparent header for a full-bleed look — on the homepage hero and the About, Contact, Blog, and Services banners. When off, the header sits as its own band above the cover.</p>
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
              Applies to the homepage hero and the About, Contact, Blog, and Services cover banners. Use darker images, or increase each page's overlay opacity, so the header navigation stays readable on top.
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'

interface Props {
  modelValue: {
    site_name: string
    logo_url: string
    favicon_url: string
    cart_icon_url: string
    logo_size: number
    hero_full_bleed: boolean
  }
  mediaUploading: Record<string, boolean>
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: Props['modelValue']]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()
</script>
