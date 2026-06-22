<template>
  <section data-guide="settings-story" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-gray-900">Our Story Page</h2>
          <p class="text-xs text-gray-400">A standalone page at /story — a hero plus two alternating image &amp; text sections.</p>
        </div>
      </div>
      <label class="inline-flex items-center gap-2 cursor-pointer shrink-0">
        <input
          type="checkbox"
          class="sr-only peer"
          :checked="modelValue.enabled"
          @change="update('enabled', ($event.target as HTMLInputElement).checked)"
        />
        <span class="relative w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-primary-500 transition-colors">
          <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
        </span>
        <span class="text-xs font-semibold text-gray-700">{{ modelValue.enabled ? 'On' : 'Off' }}</span>
      </label>
    </div>

    <div class="p-6 space-y-6">
      <!-- ═══════════ Hero ═══════════ -->
      <div class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Hero</p>
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Eyebrow</label>
          <input
            :value="modelValue.hero.eyebrow"
            @input="updateHero('eyebrow', ($event.target as HTMLInputElement).value)"
            type="text" maxlength="100"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="Our Story"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Heading</label>
          <input
            :value="modelValue.hero.heading"
            @input="updateHero('heading', ($event.target as HTMLInputElement).value)"
            type="text" maxlength="150"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="Our Story"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Subtitle</label>
          <input
            :value="modelValue.hero.subtitle"
            @input="updateHero('subtitle', ($event.target as HTMLInputElement).value)"
            type="text" maxlength="250"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="A short line introducing who you are"
          />
        </div>
      </div>

      <!-- ═══════════ Section 1 ═══════════ -->
      <AdminSettingsStoryPageSection
        title="Section 1"
        :model-value="modelValue.section_a"
        :image-url="imageUrlA"
        :uploading="mediaUploading.story_image_a ?? false"
        input-id="storyImageAInput"
        @update:model-value="update('section_a', $event)"
        @media-select="(f: File) => emit('media-select', f, 'story_image_a')"
        @media-remove="emit('media-remove', 'story_image_a')"
      />

      <!-- ═══════════ Section 2 ═══════════ -->
      <AdminSettingsStoryPageSection
        title="Section 2"
        :model-value="modelValue.section_b"
        :image-url="imageUrlB"
        :uploading="mediaUploading.story_image_b ?? false"
        input-id="storyImageBInput"
        @update:model-value="update('section_b', $event)"
        @media-select="(f: File) => emit('media-select', f, 'story_image_b')"
        @media-remove="emit('media-remove', 'story_image_b')"
      />

      <p class="text-[11px] text-gray-400">The /story page is shown only when this is enabled. Empty sections are skipped automatically.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaCollection } from '~/composables/useMediaUpload'
import type { StoryPage } from '~/composables/useSiteConfig'

const props = defineProps<{
  modelValue: StoryPage
  imageUrlA: string
  imageUrlB: string
  mediaUploading: Record<string, boolean>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: StoryPage]
  'media-select': [file: File, collection: MediaCollection]
  'media-remove': [collection: MediaCollection]
}>()

function update<K extends keyof StoryPage>(key: K, value: StoryPage[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function updateHero<K extends keyof StoryPage['hero']>(key: K, value: StoryPage['hero'][K]) {
  emit('update:modelValue', { ...props.modelValue, hero: { ...props.modelValue.hero, [key]: value } })
}
</script>
