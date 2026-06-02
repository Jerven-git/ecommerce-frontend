<template>
  <section data-guide="settings-footer" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900">Footer</h2>
        <p class="text-xs text-gray-400">Tagline, copyright, and which columns to show</p>
      </div>
    </div>

    <div class="p-4 space-y-6">
      <!-- Logo -->
      <div class="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Footer logo</label>
        <AdminMediaUploader
          :url="footerLogoUrl"
          :uploading="mediaUploading?.footer_logo"
          label="Footer logo"
          hint="PNG, JPG, SVG — max 2 MB"
          input-id="footerLogoInput"
          preview-class="h-16 w-auto rounded-lg object-contain"
          @select="(f: File) => emit('media-select', f, 'footer_logo')"
          @remove="emit('media-remove', 'footer_logo')"
        />
        <p class="text-[11px] text-gray-400 mt-1.5">
          Optional. Leave empty to reuse the header logo. Upload a different version — e.g. a light logo for a dark footer.
        </p>
      </div>

      <!-- Logo size -->
      <div class="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
        <div class="flex items-center justify-between mb-2">
          <label for="footerLogoSizeRange" class="text-sm font-medium text-gray-700">Footer logo size</label>
          <span class="text-xs font-mono text-gray-500 tabular-nums">{{ logoSizePx }}px</span>
        </div>
        <input
          id="footerLogoSizeRange"
          type="range"
          min="48"
          max="200"
          step="2"
          :value="logoSizePx"
          @input="emit('update:footerLogoSize', Number(($event.target as HTMLInputElement).value))"
          class="w-full accent-primary-600 cursor-pointer"
        />
        <p class="text-[11px] text-gray-400 mt-1">
          Height of the logo in the footer — the width scales automatically so the logo keeps its proportions and stays crisp at any size.
        </p>
        <div v-if="previewLogoUrl" class="mt-3 flex items-center gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span class="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Preview</span>
          <img
            :src="previewLogoUrl"
            :style="{ height: logoSizePx + 'px' }"
            class="w-auto max-w-full object-contain"
            alt="Footer logo preview"
          />
        </div>
      </div>

      <!-- Text fields -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Footer Text</span>
        </div>
        <div class="bg-white p-5 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tagline</label>
            <input
              :value="footer.tagline"
              @input="updateField('tagline', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline text-sm text-gray-700"
              placeholder="Your trusted online shopping destination"
            />
            <p class="mt-1 text-[11px] text-gray-400">Shown under the logo in the footer.</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Copyright</label>
            <input
              :value="footer.copyright_text"
              @input="updateField('copyright_text', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline text-sm text-gray-700"
              placeholder="© {year} {site_name}. All rights reserved."
            />
            <p class="mt-1 text-[11px] text-gray-400">
              Use <code class="px-1 py-0.5 rounded bg-gray-100 text-gray-600">{year}</code>
              and <code class="px-1 py-0.5 rounded bg-gray-100 text-gray-600">{site_name}</code> as placeholders.
            </p>
          </div>
        </div>
      </div>

      <!-- Visibility toggles -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Sections</span>
        </div>
        <div class="bg-white divide-y divide-gray-100">
          <label
            v-for="t in toggles"
            :key="t.key"
            class="flex items-start justify-between gap-4 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ t.label }}</p>
              <p class="text-xs text-gray-400">{{ t.hint }}</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="footer[t.key]"
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200"
              :class="footer[t.key] ? 'bg-primary-500' : 'bg-gray-200'"
              @click.prevent="updateField(t.key, !footer[t.key])"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 mt-0.5"
                :class="footer[t.key] ? 'translate-x-4' : 'translate-x-0.5'"
              />
            </button>
          </label>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Footer } from '~/composables/useSiteConfig'
import type { MediaCollection } from '~/composables/useMediaUpload'

const props = defineProps<{
  footer: Footer
  footerLogoUrl?: string | null
  headerLogoUrl?: string | null
  footerLogoSize?: number | null
  mediaUploading?: Record<string, boolean>
}>()

const emit = defineEmits<{
  'update:footer': [value: Footer]
  'update:footerLogoSize': [value: number]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

const logoSizePx = computed(() => props.footerLogoSize ?? 128)
const previewLogoUrl = computed(() => props.footerLogoUrl || props.headerLogoUrl || null)

type ToggleKey = 'show_tagline' | 'show_quick_links' | 'show_contact_info' | 'show_social_links'

const toggles: Array<{ key: ToggleKey; label: string; hint: string }> = [
  { key: 'show_tagline', label: 'Tagline', hint: 'Show the short tagline under the logo.' },
  { key: 'show_quick_links', label: 'Quick Links column', hint: 'Show the column with navigation links.' },
  { key: 'show_contact_info', label: 'Contact Info column', hint: 'Show the column with email and phone.' },
  { key: 'show_social_links', label: 'Social media icons', hint: 'Show the row of social platform icons.' },
]

function updateField<K extends keyof Footer>(key: K, value: Footer[K]) {
  emit('update:footer', { ...props.footer, [key]: value })
}
</script>

<style scoped>
.edit-inline {
  display: block; width: 100%; background: transparent;
  border: 1px dashed transparent; border-radius: 0.375rem;
  padding: 0.5rem 0.625rem; outline: none; transition: all 0.15s ease;
}
.edit-inline:hover { border-color: rgb(165,180,252); background: rgb(238,242,255); }
.edit-inline:focus { border-color: rgb(99,102,241); border-style: solid; background: white; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
.edit-inline::placeholder { color: rgb(199,210,254); font-style: italic; }
</style>
