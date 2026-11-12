<template>
  <div class="space-y-2.5">
    <div>
      <p class="text-xs font-semibold text-admin-text">Our story image</p>
      <p class="mt-1 text-xs leading-5 text-admin-muted">This image belongs to the Our story section and its Image left, Image right, or Stacked layout. The About cover has a separate upload.</p>
    </div>
    <p v-if="uploadError" class="text-xs leading-5 text-admin-danger" role="alert">{{ uploadError }}</p>
    <AdminMediaUploader
      :url="modelValue.about_story_image_url || ''"
      :uploading="uploading"
      label="Our story image"
      hint="JPG, PNG or WebP · max 10 MB"
      input-id="editorAboutStoryImageInput"
      accept="image/*"
      overlay compact library replace-upload
      preview-class="h-40 w-full object-contain"
      @select="upload"
      @remove="remove"
      @browse="libraryOpen = true"
    />
    <AdminWebsiteEditorMediaLibrary
      v-if="libraryOpen"
      :open="libraryOpen"
      slot="about_story"
      :current-id="modelValue.about_story_media_id"
      @close="libraryOpen = false"
      @selected="apply"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWebsiteEditorDraft, type WebsiteEditorAssetUpload, type WebsiteEditorDraftPayload } from '~/composables/useWebsiteEditorDraft'

const props = defineProps<{ modelValue: WebsiteEditorDraftPayload }>()
const emit = defineEmits<{ 'update:modelValue': [value: WebsiteEditorDraftPayload] }>()
const { uploadDraftAsset } = useWebsiteEditorDraft()
const uploading = ref(false)
const uploadError = ref('')
const libraryOpen = ref(false)

function apply(asset: WebsiteEditorAssetUpload) {
  emit('update:modelValue', { ...props.modelValue, about_story_media_id: asset.id, about_story_image_url: asset.url })
  uploadError.value = ''
  libraryOpen.value = false
}
async function upload(file: File) {
  if (uploading.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    apply(await uploadDraftAsset('about_story', file))
  } catch (error: any) {
    uploadError.value = error?.data?.message || error?.message || 'The media could not be uploaded. Try again.'
  } finally {
    uploading.value = false
  }
}
function remove() {
  if (uploading.value) return
  uploadError.value = ''
  emit('update:modelValue', { ...props.modelValue, about_story_media_id: null, about_story_image_url: null })
}
</script>
