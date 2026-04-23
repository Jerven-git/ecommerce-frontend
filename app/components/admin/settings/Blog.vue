<template>
  <section data-guide="settings-blog" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="text-sm font-semibold text-gray-900">Blog Page</h2>
        <p class="text-xs text-gray-400">Manage the landing hero, banner image, and call-to-action banner</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <NuxtLink
          to="/admin/posts"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
        >
          Manage posts
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
        <NuxtLink
          to="/admin/post-categories"
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Categories
        </NuxtLink>
      </div>
    </div>

    <div class="p-4 space-y-6">
      <!-- Cover image -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Blog Cover Image</label>
        <AdminMediaUploader
          :url="imageUrl"
          :uploading="mediaUploading.blog ?? false"
          label="Image"
          hint="JPG, PNG, GIF — max 10 MB · 1600×900 px recommended"
          input-id="blogImageInput"
          preview-class="w-full h-40 object-cover"
          dropzone-class="h-40"
          overlay
          @select="(f: File) => emit('media-select', f, 'blog')"
          @remove="emit('media-remove', 'blog')"
        />
      </div>

      <!-- Overlay controls -->
      <AdminSettingsOverlayControls
        heading="Blog Hero Overlay"
        description="Darken or tint the blog cover image for better text readability."
        input-id-prefix="blog"
        :color="overlayColor"
        :opacity="overlayOpacity"
        show-preview
        :preview-image-url="imageUrl"
        :preview-title="blogPage.header.heading || 'Blogs on product management'"
        :preview-subtitle="blogPage.header.subtitle || 'Insights, stories and updates'"
        preview-empty-text="Upload a blog cover image to preview"
        @update:color="emit('update:overlay-color', $event)"
        @update:opacity="emit('update:overlay-opacity', $event)"
      />

      <!-- Header card -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
          <span class="ml-2 text-[10px] text-gray-400 font-medium">Blog Header</span>
        </div>
        <div class="bg-white p-5 space-y-3">
          <input
            :value="blogPage.header.label"
            @input="updateHeader('label', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em]"
            placeholder="Eyebrow label (e.g. BLOGS)"
          />
          <input
            :value="blogPage.header.heading"
            @input="updateHeader('heading', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline text-lg font-bold text-gray-900 leading-tight"
            placeholder="Main heading (e.g. Blogs on product management)"
          />
          <textarea
            :value="blogPage.header.subtitle"
            @input="updateHeader('subtitle', ($event.target as HTMLTextAreaElement).value)"
            rows="2"
            class="edit-inline text-xs text-gray-500 leading-relaxed resize-none w-full"
            placeholder="Short description shown below the heading"
          ></textarea>
        </div>
      </div>

      <!-- CTA banner -->
      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
            <span class="ml-2 text-[10px] text-gray-400 font-medium">Inline CTA Banner (optional)</span>
          </div>
          <label class="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 cursor-pointer">
            <input type="checkbox" :checked="ctaEnabled" @change="toggleCta(($event.target as HTMLInputElement).checked)" class="rounded" />
            Enable
          </label>
        </div>

        <div v-if="ctaEnabled" class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-5 space-y-3">
          <input
            :value="blogPage.cta?.heading || ''"
            @input="updateCta('heading', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline-light text-base font-bold"
            placeholder="CTA heading"
          />
          <input
            :value="blogPage.cta?.subtitle || ''"
            @input="updateCta('subtitle', ($event.target as HTMLInputElement).value)"
            type="text"
            class="edit-inline-light text-xs"
            placeholder="CTA subtitle"
          />
          <div class="grid grid-cols-2 gap-2">
            <input
              :value="blogPage.cta?.button_label || ''"
              @input="updateCta('button_label', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light text-xs"
              placeholder="Button label"
            />
            <input
              :value="blogPage.cta?.button_link || ''"
              @input="updateCta('button_link', ($event.target as HTMLInputElement).value)"
              type="text"
              class="edit-inline-light text-xs font-mono"
              placeholder="/contact or https://..."
            />
          </div>
        </div>
        <div v-else class="bg-gray-50 p-5 text-center text-xs text-gray-400">
          Enable the CTA banner to show an action card between blog posts.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'
import type { BlogPage, BlogPageCta } from '~/composables/useSiteConfig'

const props = defineProps<{
  imageUrl: string
  blogPage: BlogPage
  mediaUploading: Record<string, boolean>
  overlayColor: string
  overlayOpacity: number
}>()

const emit = defineEmits<{
  'update:blog-page': [value: BlogPage]
  'update:overlay-color': [value: string]
  'update:overlay-opacity': [value: number]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

const ctaEnabled = computed(() => !!props.blogPage.cta)

function updateHeader(key: keyof BlogPage['header'], value: string) {
  emit('update:blog-page', {
    ...props.blogPage,
    header: { ...props.blogPage.header, [key]: value },
  })
}

function toggleCta(enabled: boolean) {
  emit('update:blog-page', {
    ...props.blogPage,
    cta: enabled ? (props.blogPage.cta || emptyCta()) : null,
  })
}

function updateCta(key: keyof BlogPageCta, value: string) {
  emit('update:blog-page', {
    ...props.blogPage,
    cta: { ...(props.blogPage.cta || emptyCta()), [key]: value },
  })
}

function emptyCta(): BlogPageCta {
  return { heading: '', subtitle: '', button_label: '', button_link: '' }
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
  display: block; width: 100%; background: rgba(255,255,255,0.12);
  color: white;
  border: 1px dashed rgba(255,255,255,0.25); border-radius: 0.375rem;
  padding: 0.375rem 0.625rem; outline: none; transition: all 0.15s ease;
}
.edit-inline-light:focus { border-color: rgba(255,255,255,0.6); border-style: solid; background: rgba(255,255,255,0.18); box-shadow: 0 0 0 2px rgba(255,255,255,0.18); }
.edit-inline-light::placeholder { color: rgba(255,255,255,0.55); }
</style>
