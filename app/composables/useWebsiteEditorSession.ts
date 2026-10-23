import { computed, ref, type Ref } from 'vue'
import type { SiteConfig } from '~/composables/useSiteConfig'
import { useWebsiteEditorRecovery } from '~/composables/useWebsiteEditorRecovery'
import {
  normalizeWebsiteEditorDraft,
  type WebsiteEditorDraftPayload,
  type WebsiteEditorDraftState,
  type WebsiteEditorWorkflow,
} from '~/composables/useWebsiteEditorDraft'
import { websiteEditorApiMessage } from '~/utils/websiteEditorError'

interface WebsiteEditorSessionOptions {
  siteConfig: Ref<SiteConfig | null>
  fetchSiteConfig: (force?: boolean) => Promise<unknown>
  broadcastConfigUpdate: () => void
  draftApi: ReturnType<typeof useWebsiteEditorDraft>
  recoveryOwner: () => string
  onDraftApplied: (draft: WebsiteEditorDraftPayload) => void
  onDraftLoaded: (draft: WebsiteEditorDraftPayload) => Promise<void> | void
  onValidationError: (errors: Record<string, string[]>) => void
  onPublished: () => Promise<void> | void
}

function initialWorkflow(): WebsiteEditorWorkflow {
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
    timezone: 'UTC',
  }
}

export function useWebsiteEditorSession(options: WebsiteEditorSessionOptions) {
  const {
    fetchDraft,
    saveDraft,
    discardDraft,
    publishDraft,
    requestDraftReview,
    approveDraft,
    requestDraftChanges,
    scheduleDraft,
    cancelDraftSchedule,
  } = options.draftApi

  const draft = ref<WebsiteEditorDraftPayload | null>(null)
  const baseUpdatedAt = ref('')
  const hasSavedDraft = ref(false)
  const draftUpdatedAt = ref<string | null>(null)
  const draftVersion = ref<number | null>(null)
  const savedSnapshot = ref('')
  const loadingDraft = ref(true)
  const saving = ref(false)
  const publishing = ref(false)
  const discarding = ref(false)
  const actionError = ref('')
  const validationErrors = ref<Record<string, string[]>>({})

  const publishReviewOpen = ref(false)
  const releaseNote = ref('')
  const reviewNote = ref('')
  const scheduledFor = ref('')
  const workflowLoading = ref(false)
  const workflowError = ref('')
  const workflow = ref<WebsiteEditorWorkflow>(initialWorkflow())
  const publishSuccess = ref<{ summary: string } | null>(null)

  const snapshot = (value: WebsiteEditorDraftPayload | null) => JSON.stringify(value)
  const isDirty = computed(() => Boolean(draft.value) && snapshot(draft.value) !== savedSnapshot.value)

  function applyDraftState(state: WebsiteEditorDraftState) {
    if (!options.siteConfig.value) throw new Error('The storefront configuration is unavailable.')
    draft.value = normalizeWebsiteEditorDraft(options.siteConfig.value, state.payload)
    baseUpdatedAt.value = state.base_updated_at
    hasSavedDraft.value = state.has_draft
    draftUpdatedAt.value = state.draft_updated_at
    draftVersion.value = state.draft_version
    workflow.value = state.workflow
    savedSnapshot.value = snapshot(draft.value)
    validationErrors.value = {}
    options.onDraftApplied(draft.value)
  }

  const recovery = useWebsiteEditorRecovery({
    draft,
    validationErrors,
    actionError,
    fetchDraft,
    applyDraftState,
    onDraftApplied: options.onDraftApplied,
    recoveryOwner: options.recoveryOwner,
  })

  function openPublishReview() {
    if (!hasSavedDraft.value || isDirty.value || publishing.value) return
    actionError.value = ''
    workflowError.value = ''
    reviewNote.value = ''
    if (workflow.value.scheduled_release_note && !releaseNote.value) releaseNote.value = workflow.value.scheduled_release_note
    publishReviewOpen.value = true
  }

  async function runWorkflowAction(action: () => Promise<{ data: WebsiteEditorWorkflow }>) {
    if (workflowLoading.value) return
    workflowLoading.value = true
    workflowError.value = ''
    try {
      const response = await action()
      workflow.value = response.data
      reviewNote.value = ''
    } catch (error: any) {
      if ((error?.statusCode ?? error?.status) === 409) {
        publishReviewOpen.value = false
        recovery.openSaveConflict()
        return
      }
      workflowError.value = websiteEditorApiMessage(error, 'The editorial workflow could not be updated. Try again.')
    } finally {
      workflowLoading.value = false
    }
  }

  const requestReview = () => draftVersion.value && runWorkflowAction(() => requestDraftReview(draftVersion.value!, reviewNote.value))
  const approveReview = () => draftVersion.value && runWorkflowAction(() => approveDraft(draftVersion.value!, reviewNote.value))
  const returnForChanges = () => draftVersion.value && runWorkflowAction(() => requestDraftChanges(draftVersion.value!, reviewNote.value))
  const schedulePublication = () => runWorkflowAction(async () => {
    if (!draftVersion.value) throw new Error('Save the draft before scheduling publication.')
    const response = await scheduleDraft(draftVersion.value, scheduledFor.value, releaseNote.value)
    scheduledFor.value = ''
    return response
  })
  const cancelScheduledPublication = () => draftVersion.value && runWorkflowAction(() => cancelDraftSchedule(draftVersion.value!))

  async function loadEditor(force = false) {
    loadingDraft.value = true
    actionError.value = ''
    try {
      await options.fetchSiteConfig(force)
      if (!options.siteConfig.value) throw new Error('The storefront configuration is unavailable.')
      const response = await fetchDraft({ preferPreloaded: !force, force })
      applyDraftState(response.data)
      await options.onDraftLoaded(draft.value!)
    } catch (error: any) {
      actionError.value = websiteEditorApiMessage(error, 'The website editor could not be loaded.')
    } finally {
      loadingDraft.value = false
    }
  }

  async function saveChanges() {
    if (!draft.value || !isDirty.value) return
    saving.value = true
    actionError.value = ''
    validationErrors.value = {}
    try {
      const response = await saveDraft(baseUpdatedAt.value, draftVersion.value, draft.value)
      hasSavedDraft.value = true
      draftUpdatedAt.value = response.data.draft_updated_at
      draftVersion.value = response.data.draft_version
      workflow.value = response.data.workflow
      savedSnapshot.value = snapshot(draft.value)
      recovery.dismissRecovery()
    } catch (error: any) {
      if ((error?.statusCode ?? error?.status) === 409) {
        recovery.openSaveConflict()
        return
      }
      validationErrors.value = error?.data?.errors ?? {}
      options.onValidationError(validationErrors.value)
      actionError.value = websiteEditorApiMessage(error, 'The draft could not be saved.')
    } finally {
      saving.value = false
    }
  }

  async function discardChanges() {
    discarding.value = true
    actionError.value = ''
    try {
      const response = await discardDraft()
      applyDraftState(response.data)
      hasSavedDraft.value = false
      draftUpdatedAt.value = null
      draftVersion.value = null
      recovery.dismissRecovery()
    } catch (error: any) {
      actionError.value = websiteEditorApiMessage(error, 'The draft could not be discarded.')
    } finally {
      discarding.value = false
    }
  }

  async function publishChanges(changedAreaCount: number) {
    if (!hasSavedDraft.value || isDirty.value) return
    publishing.value = true
    actionError.value = ''
    try {
      await publishDraft(releaseNote.value)
      await options.fetchSiteConfig(true)
      options.broadcastConfigUpdate()
      if (!options.siteConfig.value) throw new Error('The published website is unavailable.')
      const publishedState = await fetchDraft({ force: true })
      applyDraftState(publishedState.data)
      recovery.dismissRecovery()
      publishReviewOpen.value = false
      releaseNote.value = ''
      publishSuccess.value = {
        summary: changedAreaCount === 1
          ? '1 changed area is now live.'
          : `${changedAreaCount} changed areas are now live.`,
      }
      await options.onPublished()
    } catch (error: any) {
      if ((error?.statusCode ?? error?.status) === 409) {
        publishReviewOpen.value = false
        recovery.openSaveConflict()
        return
      }
      publishReviewOpen.value = false
      actionError.value = websiteEditorApiMessage(error, 'The website could not be published.')
    } finally {
      publishing.value = false
    }
  }

  return {
    draft,
    hasSavedDraft,
    draftUpdatedAt,
    draftVersion,
    loadingDraft,
    saving,
    publishing,
    discarding,
    actionError,
    validationErrors,
    isDirty,
    publishReviewOpen,
    releaseNote,
    reviewNote,
    scheduledFor,
    workflowLoading,
    workflowError,
    workflow,
    publishSuccess,
    ...recovery,
    applyDraftState,
    openPublishReview,
    requestReview,
    approveReview,
    returnForChanges,
    schedulePublication,
    cancelScheduledPublication,
    loadEditor,
    saveChanges,
    discardChanges,
    publishChanges,
  }
}
