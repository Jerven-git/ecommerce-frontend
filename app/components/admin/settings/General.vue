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
