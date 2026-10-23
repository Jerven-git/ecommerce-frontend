import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { WebsiteEditorWorkflow } from '~/composables/useWebsiteEditorDraft'
import { useWebsiteEditorFeedback } from '~/composables/useWebsiteEditorFeedback'

function workflow(): WebsiteEditorWorkflow {
  return {
    status: 'draft',
    requested_by_name: null,
    requested_at: null,
    reviewed_by_name: null,
    reviewed_at: null,
    note: null,
    scheduled_publish_at: null,
    scheduled_by_name: null,
    scheduled_release_note: null,
    timezone: 'Asia/Singapore',
  }
}

function createFeedback() {
  const loadingDraft = ref(false)
  const selectedVersionId = ref<number | null>(null)
  const isDirty = ref(false)
  const hasSavedDraft = ref(false)
  const editorWorkflow = ref(workflow())
  const discarding = ref(false)
  const publishing = ref(false)
  const restoringVersion = ref(false)
  const discardChanges = vi.fn().mockResolvedValue(undefined)
  const restoreSelectedVersion = vi.fn().mockResolvedValue(undefined)
  const feedback = useWebsiteEditorFeedback({
    draftUpdatedAt: ref(null),
    loadingDraft,
    selectedVersionId,
    isDirty,
    hasSavedDraft,
    workflow: editorWorkflow,
    discarding,
    publishing,
    restoringVersion,
    discardChanges,
    restoreSelectedVersion,
  })

  return {
    discardChanges,
    editorWorkflow,
    feedback,
    hasSavedDraft,
    isDirty,
    loadingDraft,
    restoreSelectedVersion,
    selectedVersionId,
  }
}

describe('useWebsiteEditorFeedback', () => {
  it('derives the editor status from loading, local edits, history, and workflow state', () => {
    const state = createFeedback()

    expect(state.feedback.editorStateTitle.value).toBe('Published website loaded')

    state.loadingDraft.value = true
    expect(state.feedback.editorStateTitle.value).toBe('Preparing private preview')

    state.loadingDraft.value = false
    state.isDirty.value = true
    expect(state.feedback.editorStateTitle.value).toBe('Unsaved preview changes')

    state.isDirty.value = false
    state.selectedVersionId.value = 17
    expect(state.feedback.editorStateTitle.value).toBe('Historical website preview')

    state.selectedVersionId.value = null
    state.hasSavedDraft.value = true
    state.editorWorkflow.value = { ...state.editorWorkflow.value, status: 'approved' }
    expect(state.feedback.editorStateTitle.value).toBe('Draft approved')
  })

  it('delegates restore and discard confirmation without touching the live website directly', async () => {
    const { discardChanges, feedback, restoreSelectedVersion } = createFeedback()

    feedback.requestConfirmation('restore')
    expect(feedback.confirmationContent.value.variant).toBe('warning')
    await feedback.confirmPendingAction()
    expect(restoreSelectedVersion).toHaveBeenCalledOnce()
    expect(feedback.pendingConfirmation.value).toBeNull()

    feedback.requestConfirmation('discard')
    expect(feedback.confirmationContent.value.variant).toBe('danger')
    await feedback.confirmPendingAction()
    expect(discardChanges).toHaveBeenCalledOnce()
    expect(feedback.pendingConfirmation.value).toBeNull()
  })
})
