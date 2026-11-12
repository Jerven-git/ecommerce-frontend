<template>
  <div class="space-y-2.5">
    <div>
      <p class="text-xs font-semibold text-admin-text">Hero media</p>
      <p class="mt-1 text-xs leading-5 text-admin-muted">Add an image or video for the hero. Split and media layouts display it beside your text.</p>
    </div>
    <p v-if="uploadError" class="text-xs leading-5 text-admin-danger" role="alert">{{ uploadError }}</p>
    <AdminMediaUploader
      :url="modelValue.hero_image_url || ''"
      :uploading="uploading"
      :video="modelValue.hero_media_mime?.startsWith('video/')"
      label="Hero media"
      hint="JPG, PNG, WebP, MP4 or WebM · max 10 MB"
      input-id="editorHeroMediaInput"
      accept="image/*,video/mp4,video/webm"
      overlay compact library replace-upload
      preview-class="h-40 w-full object-contain"
      @select="upload"
      @remove="remove"
      @browse="libraryOpen = true"
    />
    <AdminWebsiteEditorMediaLibrary
      v-if="libraryOpen"
      :open="libraryOpen"
      slot="hero"
      :current-id="modelValue.hero_media_id"
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
  emit('update:modelValue', { ...props.modelValue, hero_media_id: asset.id, hero_image_url: asset.url, hero_media_mime: asset.mime_type })
  uploadError.value = ''
  libraryOpen.value = false
}
async function upload(file: File) {
  if (uploading.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    apply(await uploadDraftAsset('hero', file))
  } catch (error: any) {
    uploadError.value = error?.data?.message || error?.message || 'The media could not be uploaded. Try again.'
  } finally {
    uploading.value = false
  }
}
function remove() {
  if (uploading.value) return
  uploadError.value = ''
  emit('update:modelValue', { ...props.modelValue, hero_media_id: null, hero_image_url: null, hero_media_mime: null })
}
</script>
