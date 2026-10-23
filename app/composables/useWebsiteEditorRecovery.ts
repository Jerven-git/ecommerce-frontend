import { ref, type Ref } from 'vue'
import type { WebsiteEditorDraftPayload, WebsiteEditorDraftState } from '~/composables/useWebsiteEditorDraft'
import { websiteEditorApiMessage } from '~/utils/websiteEditorError'

export interface WebsiteEditorRecoverySnapshot {
  payload: WebsiteEditorDraftPayload
  savedAt: string
}

interface WebsiteEditorRecoveryOptions {
  draft: Ref<WebsiteEditorDraftPayload | null>
  validationErrors: Ref<Record<string, string[]>>
  actionError: Ref<string>
  fetchDraft: ReturnType<typeof useWebsiteEditorDraft>['fetchDraft']
  applyDraftState: (state: WebsiteEditorDraftState) => void
  onDraftApplied: (draft: WebsiteEditorDraftPayload) => void
  recoveryOwner: () => string
}

export function useWebsiteEditorRecovery(options: WebsiteEditorRecoveryOptions) {
  const conflictOpen = ref(false)
  const conflictLoading = ref(false)
  const conflictNotice = ref('')
  const conflictLatestSummary = ref('')
  const conflictLatest = ref<WebsiteEditorDraftState | null>(null)
  const recoverySnapshot = ref<WebsiteEditorRecoverySnapshot | null>(null)

  function storageKey() {
    return `ssu:website-editor:recovery:${options.recoveryOwner() || 'unknown'}`
  }

  function persist(payload: WebsiteEditorDraftPayload) {
    const recovery = {
      payload: JSON.parse(JSON.stringify(payload)),
      savedAt: new Date().toISOString(),
    } as WebsiteEditorRecoverySnapshot
    recoverySnapshot.value = recovery
    if (!import.meta.client) return
    try {
      window.sessionStorage.setItem(storageKey(), JSON.stringify(recovery))
    } catch {
      // The in-memory copy remains available when browser storage is unavailable.
    }
  }

  function loadRecovery() {
    if (!import.meta.client) return
    try {
      const stored = window.sessionStorage.getItem(storageKey())
      if (stored) recoverySnapshot.value = JSON.parse(stored) as WebsiteEditorRecoverySnapshot
    } catch {
      recoverySnapshot.value = null
    }
  }

  function dismissRecovery() {
    recoverySnapshot.value = null
    conflictNotice.value = ''
    if (!import.meta.client) return
    try {
      window.sessionStorage.removeItem(storageKey())
    } catch {
      // Nothing else is required when browser storage is unavailable.
    }
  }

  function openSaveConflict() {
    if (options.draft.value) persist(options.draft.value)
    conflictLatest.value = null
    conflictLatestSummary.value = ''
    conflictNotice.value = 'Your edits were not overwritten.'
    conflictOpen.value = true
  }

  function closeConflict() {
    if (!conflictLoading.value) conflictOpen.value = false
  }

  async function reviewLatestConflict() {
    conflictLoading.value = true
    conflictNotice.value = ''
    try {
      const response = await options.fetchDraft({ force: true })
      conflictLatest.value = response.data
      conflictLatestSummary.value = response.data.draft_updated_at
        ? `Latest private draft saved ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(response.data.draft_updated_at))}.`
        : 'The latest server version is the currently published website.'
    } catch (error: any) {
      conflictNotice.value = websiteEditorApiMessage(error, 'The latest draft could not be reviewed. Try again.')
    } finally {
      conflictLoading.value = false
    }
  }

  async function copyRecoveryChanges() {
    if (!recoverySnapshot.value || !import.meta.client) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(recoverySnapshot.value.payload, null, 2))
      conflictNotice.value = 'Your changes were copied to the clipboard.'
    } catch {
      conflictNotice.value = 'The browser blocked clipboard access. Your recovery copy is still preserved.'
    }
  }

  function restoreRecoveryCopy() {
    if (!recoverySnapshot.value) return
    options.draft.value = JSON.parse(JSON.stringify(recoverySnapshot.value.payload)) as WebsiteEditorDraftPayload
    options.validationErrors.value = {}
    options.onDraftApplied(options.draft.value)
    conflictNotice.value = 'Your browser copy is restored for editing.'
  }

  async function reloadLatestConflict() {
    conflictLoading.value = true
    conflictNotice.value = ''
    try {
      const state = conflictLatest.value ?? (await options.fetchDraft({ force: true })).data
      options.applyDraftState(state)
      conflictOpen.value = false
      options.actionError.value = ''
    } catch (error: any) {
      conflictNotice.value = websiteEditorApiMessage(error, 'The latest draft could not be loaded. Try again.')
    } finally {
      conflictLoading.value = false
    }
  }

  return {
    conflictOpen,
    conflictLoading,
    conflictNotice,
    conflictLatestSummary,
    recoverySnapshot,
    loadRecovery,
    dismissRecovery,
    restoreRecoveryCopy,
    copyRecoveryChanges,
    reviewLatestConflict,
    reloadLatestConflict,
    closeConflict,
    openSaveConflict,
  }
}
