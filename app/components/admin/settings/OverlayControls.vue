<template>
  <div class="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-4">
    <div>
      <p class="text-sm font-medium text-gray-800">{{ heading }}</p>
      <p class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Color presets + custom -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-2">Overlay colour</label>
        <div class="flex items-center gap-2">
          <button
            v-for="preset in colorPresets"
            :key="preset.value"
            type="button"
            :title="preset.label"
            :aria-label="preset.label"
            @click="$emit('update:color', preset.value)"
            class="w-8 h-8 rounded-lg border-2 shadow-sm transition-all"
            :class="color.toLowerCase() === preset.value.toLowerCase()
              ? 'border-primary-500 ring-2 ring-primary-200 scale-105'
              : 'border-white ring-1 ring-gray-200 hover:scale-105'"
            :style="{ backgroundColor: preset.value }"
          />
          <div class="flex items-center gap-1.5 ml-1">
            <div class="relative shrink-0">
              <input
                :id="`${inputIdPrefix}OverlayColor`"
                :value="color"
                @input="$emit('update:color', ($event.target as HTMLInputElement).value)"
                type="color"
                class="sr-only"
              />
              <label
                :for="`${inputIdPrefix}OverlayColor`"
                class="block w-8 h-8 rounded-lg cursor-pointer border-2 border-white shadow ring-1 ring-gray-200 hover:scale-105 transition-transform"
                :style="{ backgroundColor: color }"
                title="Custom colour"
                aria-label="Pick custom colour"
              />
            </div>
            <input
              :value="color"
              @input="$emit('update:color', ($event.target as HTMLInputElement).value)"
              type="text"
              class="input-field font-mono text-xs w-24"
              placeholder="#000000"
              maxlength="7"
            />
          </div>
        </div>
      </div>

      <!-- Opacity slider -->
      <div>
        <label class="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
          <span>Opacity</span>
          <span class="font-mono text-gray-500">{{ opacity }}%</span>
        </label>
        <input
          :value="opacity"
          @input="$emit('update:opacity', Number(($event.target as HTMLInputElement).value))"
          type="range"
          min="0"
          max="100"
          step="1"
          class="w-full accent-primary-600"
          aria-label="Overlay opacity"
        />
      </div>
    </div>

    <!-- Optional live preview -->
    <div v-if="showPreview">
      <p class="text-xs font-medium text-gray-600 mb-2">Preview</p>
      <div class="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-200">
        <img
          v-if="previewImageUrl && !isVideo"
          :src="previewImageUrl"
          alt=""
          class="absolute inset-0 w-full h-full object-cover"
          :style="{ objectPosition: previewObjectPosition }"
        />
        <video
          v-else-if="previewImageUrl && isVideo"
          :src="previewImageUrl"
          class="absolute inset-0 w-full h-full object-cover"
          muted
          autoplay
          loop
          playsinline
        />
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center text-xs text-gray-400"
        >
          {{ previewEmptyText }}
        </div>
        <div
          class="absolute inset-0 transition-opacity"
          :style="{ backgroundColor: color, opacity: opacity / 100 }"
        />
        <div v-if="previewTitle || previewSubtitle" class="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <p v-if="previewTitle" class="text-white text-xl font-bold drop-shadow">{{ previewTitle }}</p>
            <p v-if="previewSubtitle" class="text-white/90 text-xs mt-1 drop-shadow">{{ previewSubtitle }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  color: string
  opacity: number
  heading?: string
  description?: string
  inputIdPrefix?: string
  showPreview?: boolean
  previewImageUrl?: string
  previewMediaMime?: string
  previewObjectPosition?: string
  previewTitle?: string
  previewSubtitle?: string
  previewEmptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  heading: 'Image Overlay',
  description: 'Darken or tint the image for better text readability.',
  inputIdPrefix: 'overlay',
  showPreview: false,
  previewImageUrl: '',
  previewMediaMime: '',
  previewObjectPosition: '50% 50%',
  previewTitle: '',
  previewSubtitle: '',
  previewEmptyText: 'Upload an image to preview',
})

defineEmits<{
  'update:color': [value: string]
  'update:opacity': [value: number]
}>()

const colorPresets = [
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#FFFFFF' },
]

const isVideo = computed(() => props.previewMediaMime?.startsWith('video/'))
</script>
