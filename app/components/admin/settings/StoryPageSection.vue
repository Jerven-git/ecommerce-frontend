<template>
  <div class="rounded-xl border border-gray-200 overflow-hidden">
    <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
      <span class="w-1.5 h-1.5 rounded-full bg-red-300"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-green-300"></span>
      <span class="ml-2 text-[10px] text-gray-400 font-medium">{{ title }}</span>
    </div>

    <div class="p-4 space-y-4">
      <!-- Image -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Image</label>
        <AdminMediaUploader
          overlay
          :url="imageUrl"
          :uploading="uploading"
          label="Image"
          hint="JPG, PNG — max 10 MB · portrait works best"
          :input-id="inputId"
          preview-class="w-full h-48 object-cover"
          dropzone-class="h-48"
          @select="(f: File) => emit('media-select', f)"
          @remove="emit('media-remove')"
        />
      </div>

      <!-- Image position -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Image position</label>
        <select
          :value="modelValue.image_position"
          @change="update('image_position', ($event.target as HTMLSelectElement).value as 'left' | 'right')"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
        >
          <option value="left">Image on the left</option>
          <option value="right">Image on the right</option>
        </select>
      </div>

      <!-- Heading -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Heading</label>
        <input
          :value="modelValue.heading"
          @input="update('heading', ($event.target as HTMLInputElement).value)"
          type="text" maxlength="150"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
          placeholder="Section heading"
        />
      </div>

      <!-- Body -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Body</label>
        <textarea
          :value="modelValue.body"
          @input="update('body', ($event.target as HTMLTextAreaElement).value)"
          rows="4" maxlength="2000"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none leading-relaxed"
          placeholder="Tell this part of your story…"
        ></textarea>
      </div>

      <!-- CTA -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Button label</label>
          <input
            :value="modelValue.cta_label"
            @input="update('cta_label', ($event.target as HTMLInputElement).value)"
            type="text" maxlength="50"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="e.g. Shop now"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Button link</label>
          <input
            :value="modelValue.cta_link"
            @input="update('cta_link', ($event.target as HTMLInputElement).value)"
            type="text" maxlength="500"
            class="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="/shop"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StoryPageSection } from '~/composables/useSiteConfig'

const props = defineProps<{
  title: string
  modelValue: StoryPageSection
  imageUrl: string
  uploading: boolean
  inputId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: StoryPageSection]
  'media-select': [file: File]
  'media-remove': []
}>()

function update<K extends keyof StoryPageSection>(key: K, value: StoryPageSection[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
