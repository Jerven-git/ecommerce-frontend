<template>
  <!-- Preview: inline style (logo/favicon) -->
  <div v-if="url && !overlay" class="group relative flex h-36 w-full min-w-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-5 pr-12">
    <img :src="url" :alt="label" :class="[previewClass || 'h-16 w-auto rounded-lg object-contain', 'max-h-full max-w-full']" />
    <button
      @click="$emit('remove')"
      type="button"
      class="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      :aria-label="`Remove ${label}`"
      :title="`Remove ${label}`"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>

  <!-- Preview: overlay style (hero/about/contact) -->
  <div v-else-if="url && overlay" class="relative rounded-xl overflow-hidden border border-gray-200">
    <video v-if="video" :src="url" :class="previewClass || 'w-full h-44 object-cover'" muted autoplay loop playsinline />
    <img v-else :src="url" :alt="label" :class="previewClass || 'w-full h-44 object-cover'" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    <button
      @click="$emit('remove')"
      type="button"
      class="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      :aria-label="`Remove ${label}`"
      :title="`Remove ${label}`"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>

  <!-- Drop zone -->
  <label
    v-else
    :for="inputId"
    class="flex w-full min-w-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl px-4 text-center transition-all duration-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-500"
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
    <svg v-if="!uploading" class="w-7 h-7 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>

    <!-- Inline progress UI when an upload is in flight -->
    <template v-if="uploading">
      <p class="max-w-full break-words text-sm font-medium text-primary-600">Uploading{{ progressPercent != null ? `… ${progressPercent}%` : '…' }}</p>
      <div v-if="progressPercent != null" class="mt-2 w-3/4 max-w-xs h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-primary-500 transition-[width] duration-100 ease-linear"
          :style="{ width: progressPercent + '%' }"
        />
      </div>
      <p v-if="progressBytesLabel" class="text-[10px] text-gray-400 mt-1 tabular-nums">{{ progressBytesLabel }}</p>
    </template>

    <p v-else class="max-w-full break-words text-sm leading-5 text-gray-600">
      Drop {{ label.toLowerCase() }} here or <span class="text-primary-600 font-medium">browse</span>
    </p>

    <p v-if="!uploading" class="mt-1 max-w-full break-words text-xs leading-5 text-gray-500">{{ hint }}</p>
    <input :id="inputId" ref="fileInput" type="file" class="sr-only" :accept="accept || 'image/*'" @change="onInputChange" />
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string
  uploading: boolean | undefined
  label: string
  hint: string
  inputId: string
  previewClass?: string
  overlay?: boolean
  dropzoneClass?: string
  accept?: string
  video?: boolean
  /** Optional upload progress (0-100). When omitted the label just shows "Uploading…". */
  progress?: { loaded: number; total: number; percent: number }
}>()

const progressPercent = computed(() => {
  if (!props.progress || props.progress.total <= 0) return null
  return props.progress.percent
})

const progressBytesLabel = computed(() => {
  if (!props.progress || props.progress.total <= 0) return ''
  const fmt = (b: number) => (b / 1024 / 1024 >= 1 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`)
  return `${fmt(props.progress.loaded)} / ${fmt(props.progress.total)}`
})

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
