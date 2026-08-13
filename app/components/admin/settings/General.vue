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
        <p class="text-xs text-gray-500">Store identity and shared interface icons</p>
      </div>
    </div>

    <div class="space-y-7 p-5 sm:p-6">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end">
        <div class="min-w-0">
          <label for="general-store-name" class="mb-1.5 block text-sm font-medium text-gray-700">Store Name</label>
          <input
            id="general-store-name"
            :value="modelValue.site_name"
            type="text"
            class="input-field"
            placeholder="My Awesome Store"
            @input="emit('update:modelValue', { ...modelValue, site_name: ($event.target as HTMLInputElement).value })"
          />
          <p class="mt-1.5 text-xs leading-5 text-gray-500">Used throughout the storefront and browser metadata.</p>
        </div>

        <div class="flex min-w-0 items-start gap-3 rounded-xl bg-blue-50 px-4 py-3 text-blue-900">
          <Icon name="heroicons:information-circle" class="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
          <p class="min-w-0 text-xs leading-5">
            <span class="font-semibold">Image tip:</span> Use transparent PNG files, or match the image background to your header and footer colour to avoid visible seams.
          </p>
        </div>
      </div>

      <div class="space-y-4 border-t border-gray-100 pt-6">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Brand images</h3>
          <p class="mt-1 text-xs leading-5 text-gray-500">Upload each asset for the place it appears. Existing images remain unchanged until removed or replaced.</p>
        </div>

        <div class="grid min-w-0 gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div class="min-w-0 space-y-2.5 sm:col-span-2 xl:col-span-1">
            <div>
              <p class="text-sm font-medium text-gray-800">Logo</p>
              <p class="mt-0.5 text-xs leading-5 text-gray-500">Primary brand mark used in the storefront header and footer.</p>
            </div>
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

          <div class="min-w-0 space-y-2.5">
            <div>
              <p class="text-sm font-medium text-gray-800">Site Icon</p>
              <p class="mt-0.5 text-xs leading-5 text-gray-500">Square icon used in browser tabs and bookmarks.</p>
            </div>
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

          <div class="min-w-0 space-y-2.5">
            <div>
              <p class="text-sm font-medium text-gray-800">Cart Icon</p>
              <p class="mt-0.5 text-xs leading-5 text-gray-500">Optional custom icon for the storefront cart action.</p>
            </div>
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
      </div>

      <div class="space-y-4 border-t border-gray-100 pt-6">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Header presentation</h3>
          <p class="mt-1 text-xs leading-5 text-gray-500">Control how your brand and cover imagery appear in the storefront header.</p>
        </div>

        <div class="grid min-w-0 gap-4 lg:grid-cols-2">
          <div class="min-w-0 rounded-xl bg-gray-50 p-4">
            <div class="mb-3 flex min-w-0 items-center justify-between gap-3">
              <label for="logoSizeRange" class="min-w-0 text-sm font-medium text-gray-800">Header logo size</label>
              <span class="shrink-0 rounded-md bg-white px-2 py-1 text-xs font-semibold tabular-nums text-gray-600">{{ modelValue.logo_size }}px</span>
            </div>
            <input
              id="logoSizeRange"
              type="range"
              min="20"
              max="64"
              step="1"
              :value="modelValue.logo_size"
              class="w-full cursor-pointer accent-primary-600"
              @input="emit('update:modelValue', { ...modelValue, logo_size: Number(($event.target as HTMLInputElement).value) })"
            />
            <p class="mt-2 text-xs leading-5 text-gray-500">The width scales automatically to preserve the logo proportions.</p>
            <div v-if="modelValue.logo_url" class="mt-3 flex h-20 min-w-0 items-center justify-center overflow-hidden rounded-lg bg-white p-3">
              <img
                :src="modelValue.logo_url"
                :style="{ height: modelValue.logo_size + 'px' }"
                class="max-h-full max-w-full object-contain"
                alt="Header logo preview"
              />
            </div>
          </div>

          <div class="min-w-0 rounded-xl bg-gray-50 p-4">
            <label class="flex min-w-0 cursor-pointer items-start gap-3">
              <input
                :checked="modelValue.hero_full_bleed"
                type="checkbox"
                class="peer sr-only"
                @change="emit('update:modelValue', { ...modelValue, hero_full_bleed: ($event.target as HTMLInputElement).checked })"
              />
              <span class="relative mt-0.5 h-6 w-10 shrink-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-primary-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500">
                <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </span>
              <span class="min-w-0">
                <span class="block text-sm font-medium text-gray-800">Cover images flow under header</span>
                <span class="mt-1 block text-xs leading-5 text-gray-500">Extends homepage and page-cover imagery behind a transparent header.</span>
              </span>
            </label>
            <p v-if="modelValue.hero_full_bleed" class="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
              Use darker images or increase each page overlay so navigation remains readable.
            </p>
          </div>
        </div>
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
