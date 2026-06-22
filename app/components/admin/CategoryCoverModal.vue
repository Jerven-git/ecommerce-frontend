<template>
  <BaseModal
    :open="open"
    :title="`Category cover — ${category?.name ?? ''}`"
    size="md"
    body-class="p-0"
    @close="$emit('close')"
  >
    <form id="categoryCoverForm" class="p-5 space-y-4" @submit.prevent="save">
      <p class="text-xs text-gray-500">
        Used as the hero image on this category's page
        <span v-if="category?.slug" class="font-mono text-gray-700">/category/{{ category.slug }}</span>.
        Leave empty to show the plain header.
      </p>

      <!-- Cover image -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Cover image</label>
        <div class="relative">
          <img
            v-if="previewImageUrl"
            :src="previewImageUrl"
            alt="Cover preview"
            class="w-full aspect-[5/2] object-cover rounded-xl border border-gray-100"
          />
          <label
            v-else
            class="flex flex-col items-center justify-center w-full aspect-[5/2] border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary-300 hover:text-primary-500 cursor-pointer transition-colors"
          >
            <Icon name="heroicons:photo" class="w-7 h-7 mb-1" />
            <span class="text-xs font-medium">Upload image</span>
            <input type="file" accept="image/*" class="hidden" @change="onImageSelect" />
          </label>

          <div v-if="previewImageUrl" class="absolute top-2 right-2 flex gap-1">
            <label class="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[11px] font-medium text-gray-700 hover:bg-white cursor-pointer shadow-sm">
              Replace
              <input type="file" accept="image/*" class="hidden" @change="onImageSelect" />
            </label>
            <button
              type="button"
              class="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[11px] font-medium text-red-500 hover:bg-white shadow-sm"
              @click="clearImage"
            >
              Remove
            </button>
          </div>
        </div>
        <p class="text-[11px] text-gray-400 mt-1">Wide image works best. JPG, PNG, WebP — max 5 MB.</p>
      </div>

      <!-- Dark overlay -->
      <div v-if="previewImageUrl">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-xs font-semibold text-gray-700">Dark overlay</label>
          <span class="text-xs font-mono text-gray-500 tabular-nums">{{ overlayOpacity }}%</span>
        </div>
        <input v-model.number="overlayOpacity" type="range" min="0" max="100" step="5" class="w-full accent-primary-600" />
        <div class="flex items-center justify-between text-[11px] text-gray-400 mt-0.5">
          <span>Image only</span>
          <span>Darker (more readable text)</span>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="previewImageUrl">
        <label class="block text-xs font-semibold text-gray-700 mb-1">Preview</label>
        <div class="relative w-full aspect-[5/2] rounded-xl overflow-hidden flex items-center justify-center bg-gray-900">
          <img :src="previewImageUrl" alt="" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 bg-black" :style="{ opacity: overlayOpacity / 100 }" />
          <span class="relative text-white text-lg font-bold drop-shadow text-center px-4">{{ category?.name }}</span>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="categoryCoverForm"
          :disabled="saving"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <span v-if="saving" class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
          Save
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
interface CategoryLite {
  id: number
  name: string
  slug?: string | null
  image_url?: string | null
  overlay_opacity?: number | null
}

const props = defineProps<{ open: boolean; category: CategoryLite | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const { $apiFetch } = useNuxtApp()
const { showToast } = useAdminToast()

const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const existingImageUrl = ref<string | null>(null)
const imageCleared = ref(false)
const overlayOpacity = ref(45)
const saving = ref(false)

const previewImageUrl = computed(
  () => imagePreviewUrl.value || (imageCleared.value ? null : existingImageUrl.value),
)

watch(() => props.open, (open) => {
  if (open && props.category) {
    resetImageState()
    existingImageUrl.value = props.category.image_url || null
    overlayOpacity.value = props.category.overlay_opacity ?? 45
  }
})

function resetImageState() {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imageFile.value = null
  imagePreviewUrl.value = null
  existingImageUrl.value = null
  imageCleared.value = false
}

function onImageSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imagePreviewUrl.value = URL.createObjectURL(file)
  imageCleared.value = false
}

function clearImage() {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imagePreviewUrl.value = null
  imageFile.value = null
  imageCleared.value = true
}

async function save() {
  if (!props.category) return
  saving.value = true
  try {
    const id = props.category.id
    const hasFile = !!imageFile.value

    if (hasFile) {
      const fd = new FormData()
      fd.append('_method', 'PATCH')
      fd.append('overlay_opacity', String(overlayOpacity.value))
      fd.append('image', imageFile.value as File)
      await $apiFetch(`/categories/${id}`, { method: 'POST', body: fd })
    } else {
      await $apiFetch(`/categories/${id}`, { method: 'PATCH', body: { overlay_opacity: overlayOpacity.value } })
    }

    // Removed an existing cover without picking a new one.
    if (imageCleared.value && !hasFile && existingImageUrl.value) {
      await $apiFetch(`/categories/${id}/image`, { method: 'DELETE' })
    }

    showToast('Category cover saved', 'success')
    emit('saved')
    emit('close')
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to save cover', 'error')
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(() => {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
})
</script>
