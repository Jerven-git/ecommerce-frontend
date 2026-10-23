import { computed, ref, type Ref } from 'vue'
import type { WebsiteEditorWorkflow } from '~/composables/useWebsiteEditorDraft'

type WebsiteEditorConfirmationKind = 'discard' | 'restore'

interface WebsiteEditorFeedbackOptions {
  draftUpdatedAt: Readonly<Ref<string | null>>
  loadingDraft: Readonly<Ref<boolean>>
  selectedVersionId: Readonly<Ref<number | null>>
  isDirty: Readonly<Ref<boolean>>
  hasSavedDraft: Readonly<Ref<boolean>>
  workflow: Readonly<Ref<WebsiteEditorWorkflow>>
  discarding: Readonly<Ref<boolean>>
  publishing: Readonly<Ref<boolean>>
  restoringVersion: Readonly<Ref<boolean>>
  discardChanges: () => Promise<unknown>
  restoreSelectedVersion: () => Promise<unknown>
}

export function useWebsiteEditorFeedback(options: WebsiteEditorFeedbackOptions) {
  const pendingConfirmation = ref<WebsiteEditorConfirmationKind | null>(null)
  const confirmationLoading = computed(() => options.discarding.value
    || options.publishing.value
    || options.restoringVersion.value)
  const confirmationContent = computed(() => {
    if (pendingConfirmation.value === 'restore') return {
      title: 'Restore version to draft?',
      message: 'This replaces the current private draft. The live website stays unchanged until you explicitly publish.',
      confirmText: 'Restore to draft',
      loadingText: 'Restoring…',
      variant: 'warning' as const,
    }
    return {
      title: 'Discard private changes?',
      message: 'This removes the saved draft and any unsaved edits, then reloads the published website.',
      confirmText: 'Discard changes',
      loadingText: 'Discarding…',
      variant: 'danger' as const,
    }
  })
  const draftSavedAt = computed(() => options.draftUpdatedAt.value
    ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(options.draftUpdatedAt.value))
    : '')
  const editorStateTitle = computed(() => options.loadingDraft.value
    ? 'Preparing private preview'
    : options.selectedVersionId.value
      ? 'Historical website preview'
      : options.isDirty.value
        ? 'Unsaved preview changes'
        : options.hasSavedDraft.value
          ? options.workflow.value.scheduled_publish_at
            ? 'Publication scheduled'
            : options.workflow.value.status === 'pending'
              ? 'Review requested'
              : options.workflow.value.status === 'approved'
                ? 'Draft approved'
                : options.workflow.value.status === 'changes_requested'
                  ? 'Changes requested'
                  : 'Private draft saved'
          : 'Published website loaded')
  const editorStateDescription = computed(() => {
    if (options.loadingDraft.value) return 'Loading the latest tenant configuration and private draft.'
    if (options.selectedVersionId.value) return 'This is an earlier published version. Restore it to the private draft before publishing.'
    if (options.isDirty.value) return 'The preview includes changes that are only in this browser. Save the draft before publishing.'
    if (options.hasSavedDraft.value && options.workflow.value.scheduled_publish_at) return `This approved draft will publish automatically in ${options.workflow.value.timezone}.`
    if (options.hasSavedDraft.value && options.workflow.value.status === 'pending') return 'The saved draft is awaiting review. You can still publish it immediately if needed.'
    if (options.hasSavedDraft.value && options.workflow.value.status === 'approved') return 'The saved draft is approved and can be scheduled or published now.'
    if (options.hasSavedDraft.value && options.workflow.value.status === 'changes_requested') return 'Review feedback is available in the publication panel.'
    if (options.hasSavedDraft.value) return 'This draft is private. Publish it when the preview is ready for customers.'
    return 'Start editing a section. Nothing changes publicly until you save and publish.'
  })

  function requestConfirmation(kind: WebsiteEditorConfirmationKind) {
    pendingConfirmation.value = kind
  }

  function cancelPendingAction() {
    if (!confirmationLoading.value) pendingConfirmation.value = null
  }

  async function confirmPendingAction() {
    const action = pendingConfirmation.value
    if (!action || confirmationLoading.value) return
    if (action === 'discard') await options.discardChanges()
    else await options.restoreSelectedVersion()
    if (!confirmationLoading.value) pendingConfirmation.value = null
  }

  return {
    pendingConfirmation,
    confirmationLoading,
    confirmationContent,
    draftSavedAt,
    editorStateTitle,
    editorStateDescription,
    requestConfirmation,
    cancelPendingAction,
    confirmPendingAction,
  }
}
