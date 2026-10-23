import { nextTick, ref, type Ref } from 'vue'
import type { SiteConfig } from '~/composables/useSiteConfig'
import {
  normalizeWebsiteEditorDraft,
  type WebsiteEditorDraftPayload,
  type WebsiteEditorDraftState,
  type WebsiteEditorVersionSummary,
} from '~/composables/useWebsiteEditorDraft'
import { websiteEditorApiMessage } from '~/utils/websiteEditorError'

interface WebsiteEditorVersionHistoryOptions {
  siteConfig: Ref<SiteConfig | null>
  draftVersion: Readonly<Ref<number | null>>
  actionError: Ref<string>
  draftApi: ReturnType<typeof useWebsiteEditorDraft>
  applyDraftState: (state: WebsiteEditorDraftState) => void
  dismissRecovery: () => void
  openSaveConflict: () => void
  onPreviewSelected: (draft: WebsiteEditorDraftPayload) => void
  onPreviewExited: () => void
  onDeleteFocus: () => void
}

export function useWebsiteEditorVersionHistory(options: WebsiteEditorVersionHistoryOptions) {
  const { fetchVersions, fetchVersion, restoreVersion, deleteVersion } = options.draftApi
  const versionPreview = ref<WebsiteEditorDraftPayload | null>(null)
  const versions = ref<WebsiteEditorVersionSummary[]>([])
  const selectedVersionId = ref<number | null>(null)
  const publishedHash = ref('')
  const historyOpen = ref(false)
  const loadingVersions = ref(false)
  const restoringVersion = ref(false)
  const deleteVersionTargetId = ref<number | null>(null)
  const deletingVersion = ref(false)
  const historyError = ref('')

  async function loadVersions() {
    loadingVersions.value = true
    historyError.value = ''
    try {
      const response = await fetchVersions()
      versions.value = response.data
      publishedHash.value = response.published_hash
    } catch (error: any) {
      historyError.value = websiteEditorApiMessage(error, 'Published versions could not be loaded.')
    } finally {
      loadingVersions.value = false
    }
  }

  async function refreshIfOpen() {
    if (historyOpen.value) await loadVersions()
  }

  async function toggleHistory() {
    historyOpen.value = !historyOpen.value
    if (historyOpen.value && versions.value.length === 0) await loadVersions()
  }

  async function previewVersionFromHistory(versionId: number) {
    if (!options.siteConfig.value) return
    loadingVersions.value = true
    historyError.value = ''
    try {
      const response = await fetchVersion(versionId)
      versionPreview.value = normalizeWebsiteEditorDraft(options.siteConfig.value, response.data.payload)
      selectedVersionId.value = versionId
      publishedHash.value = response.published_hash
      options.onPreviewSelected(versionPreview.value)
    } catch (error: any) {
      historyError.value = websiteEditorApiMessage(error, 'This published version could not be previewed.')
    } finally {
      loadingVersions.value = false
    }
  }

  function exitVersionPreview() {
    selectedVersionId.value = null
    versionPreview.value = null
    options.onPreviewExited()
  }

  async function restoreSelectedVersion() {
    if (!selectedVersionId.value || !publishedHash.value) return
    restoringVersion.value = true
    historyError.value = ''
    options.actionError.value = ''
    try {
      const response = await restoreVersion(selectedVersionId.value, publishedHash.value, options.draftVersion.value)
      options.applyDraftState(response.data)
      selectedVersionId.value = null
      versionPreview.value = null
      options.dismissRecovery()
    } catch (error: any) {
      if ((error?.statusCode ?? error?.status) === 409) options.openSaveConflict()
      historyError.value = websiteEditorApiMessage(error, 'This website version could not be restored.')
    } finally {
      restoringVersion.value = false
    }
  }

  function requestVersionDeletion(versionId: number) {
    deleteVersionTargetId.value = versionId
  }

  function cancelVersionDeletion() {
    if (!deletingVersion.value) deleteVersionTargetId.value = null
  }

  async function confirmVersionDeletion() {
    const versionId = deleteVersionTargetId.value
    if (!versionId || deletingVersion.value) return

    deletingVersion.value = true
    historyError.value = ''
    try {
      await deleteVersion(versionId)
      versions.value = versions.value.filter(version => version.id !== versionId)
      if (selectedVersionId.value === versionId) exitVersionPreview()
      deleteVersionTargetId.value = null
      await nextTick()
      options.onDeleteFocus()
    } catch (error: any) {
      deleteVersionTargetId.value = null
      historyError.value = websiteEditorApiMessage(error, 'This published version could not be deleted.')
    } finally {
      deletingVersion.value = false
    }
  }

  return {
    versionPreview,
    versions,
    selectedVersionId,
    historyOpen,
    loadingVersions,
    restoringVersion,
    deleteVersionTargetId,
    deletingVersion,
    historyError,
    loadVersions,
    refreshIfOpen,
    toggleHistory,
    previewVersionFromHistory,
    exitVersionPreview,
    restoreSelectedVersion,
    requestVersionDeletion,
    cancelVersionDeletion,
    confirmVersionDeletion,
  }
}
