<template>
  <!-- Preview: inline style (logo/favicon) -->
  <div v-if="url && !overlay" class="inline-flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
    <img :src="url" :alt="label" :class="previewClass || 'h-16 w-auto rounded-lg object-contain'" />
    <button
      @click="$emit('remove')"
      type="button"
      class="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium mt-1 transition-colors"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Remove
    </button>
  </div>

  <!-- Preview: overlay style (hero/about/contact) -->
  <div v-else-if="url && overlay" class="relative rounded-xl overflow-hidden border border-gray-200">
    <img :src="url" :alt="label" :class="previewClass || 'w-full h-44 object-cover'" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    <button
      @click="$emit('remove')"
      type="button"
      class="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-red-500 hover:text-red-700 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition-colors"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Remove
    </button>
  </div>

  <!-- Drop zone -->
  <label
    v-else
    :for="inputId"
    class="flex flex-col items-center justify-center w-full rounded-xl cursor-pointer transition-all duration-200"
    :class="[
      dropzoneClass || 'h-36',
      isDragging
        ? 'bg-primary-50 border-2 border-primary-400 border-dashed'
        : 'bg-gray-50 border-2 border-gray-200 border-dashed hover:border-primary-300 hover:bg-primary-50/40'
    ]"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <svg class="w-7 h-7 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p class="text-sm text-gray-500">
      <span v-if="uploading" class="text-primary-600 font-medium">Uploading…</span>
      <template v-else>Drop {{ label.toLowerCase() }} here or <span class="text-primary-600 font-medium">browse</span></template>
    </p>
    <p class="text-xs text-gray-400 mt-1">{{ hint }}</p>
    <input :id="inputId" ref="fileInput" type="file" class="hidden" accept="image/*" @change="onInputChange" />
  </label>
</template>

<script setup lang="ts">
defineProps<{
  url: string
  uploading: boolean
  label: string
  hint: string
  inputId: string
  previewClass?: string
  overlay?: boolean
  dropzoneClass?: string
}>()

const emit = defineEmits<{
  select: [file: File]
  remove: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const dragCounter = ref(0)
const isDragging = computed(() => dragCounter.value > 0)

function onDragEnter() {
  dragCounter.value++
}

function onDragLeave() {
  dragCounter.value = Math.max(0, dragCounter.value - 1)
}

function onDrop(event: DragEvent) {
  dragCounter.value = 0
  const file = event.dataTransfer?.files?.[0]
  if (file) emit('select', file)
}

function onInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) emit('select', file)
  target.value = ''
}
</script>
