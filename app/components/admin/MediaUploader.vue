<template>
  <!-- Preview: inline style (logo/favicon) -->
  <div v-if="url && !overlay" class="group relative flex h-36 w-full min-w-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-5 pr-20">
    <img :src="url" :alt="label" :class="[previewClass || 'h-16 w-auto rounded-lg object-contain', 'max-h-full max-w-full']" />
    <button
      v-if="library"
      @click="$emit('browse')"
      type="button"
      class="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      :aria-label="`Replace ${label} from media library`"
      :title="`Replace ${label} from media library`"
    >
      <Icon name="heroicons:folder-open" class="h-3.5 w-3.5" aria-hidden="true" />
    </button>
    <button
      @click="$emit('remove')"
      type="button"
      class="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      :aria-label="`Remove ${label}`"
      :title="`Remove ${label}`"
    >
      <Icon name="heroicons:trash" class="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  </div>

  <!-- Preview: overlay style (hero/about/contact) -->
  <div v-else-if="url && overlay" class="relative rounded-xl overflow-hidden border border-gray-200">
    <video v-if="video" :src="url" :class="previewClass || 'w-full h-44 object-cover'" muted autoplay loop playsinline />
    <img v-else :src="url" :alt="label" :class="previewClass || 'w-full h-44 object-cover'" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    <button
      v-if="library"
      @click="$emit('browse')"
      type="button"
      class="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      :aria-label="`Replace ${label} from media library`"
      :title="`Replace ${label} from media library`"
    >
      <Icon name="heroicons:folder-open" class="h-3.5 w-3.5" aria-hidden="true" />
    </button>
    <button
      @click="$emit('remove')"
      type="button"
      class="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      :aria-label="`Remove ${label}`"
      :title="`Remove ${label}`"
    >
      <Icon name="heroicons:trash" class="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  </div>

  <!-- Drop zone -->
  <div v-else class="space-y-2">
    <label
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
      <Icon name="heroicons:photo" v-if="!uploading" class="w-7 h-7 text-gray-400 mb-2" aria-hidden="true" />

    <!-- Inline progress UI when an upload is in flight -->
    <template v-if="uploading">
      <p class="max-w-full break-words font-medium text-primary-600" :class="compact ? 'text-xs' : 'text-sm'">Uploading{{ progressPercent != null ? `… ${progressPercent}%` : '…' }}</p>
      <div v-if="progressPercent != null" class="mt-2 w-3/4 max-w-xs h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-primary-500 transition-[width] duration-100 ease-linear"
          :style="{ width: progressPercent + '%' }"
        />
      </div>
      <p v-if="progressBytesLabel" class="mt-1 tabular-nums text-gray-400" :class="compact ? 'text-xs' : 'text-[10px]'">{{ progressBytesLabel }}</p>
    </template>

    <p v-else class="max-w-full break-words text-gray-600" :class="compact ? 'text-xs leading-4' : 'text-sm leading-5'">
      Drop {{ label.toLowerCase() }} here or <span class="text-primary-600 font-medium">browse</span>
    </p>

    <p v-if="!uploading" class="mt-1 max-w-full break-words text-xs text-gray-500" :class="compact ? 'leading-4' : 'leading-5'">{{ hint }}</p>
      <input :id="inputId" ref="fileInput" type="file" class="sr-only" :accept="accept || 'image/*'" @change="onInputChange" />
    </label>
    <button
      v-if="library && !uploading"
      type="button"
      class="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      @click="$emit('browse')"
    >
      <Icon name="heroicons:folder-open" class="h-4 w-4 text-gray-500" aria-hidden="true" />
      Choose from media library
    </button>
  </div>
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
  compact?: boolean
  library?: boolean
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
  browse: []
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
