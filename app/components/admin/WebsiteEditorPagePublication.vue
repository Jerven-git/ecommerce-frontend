<template>
  <div v-if="preparing" class="border-b border-admin-border bg-admin-soft px-4 py-2 text-xs text-admin-muted" role="status">Preparing publication review…</div>
  <div v-if="actionError || conflictOpen" class="border-b border-admin-danger/20 bg-admin-danger-soft px-4 py-3 text-sm text-admin-danger" role="alert">
    <p>{{ conflictOpen ? 'A draft changed after this review was prepared. Your page edits are safe. Refresh the review before publishing.' : actionError }}</p>
    <button type="button" class="min-h-11 rounded px-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-admin-accent" :disabled="busy || disabled" @click="open">Refresh publication review</button>
    <button type="button" class="min-h-11 rounded px-2 font-semibold" :disabled="busy" @click="$emit('reloadPage')">Reload page</button>
  </div>
  <p v-if="publishSuccess" class="border-b border-admin-success/20 bg-admin-success-soft px-4 py-3 text-sm text-admin-success" role="status">Website published. {{ publishSuccess.summary }}</p>
  <AdminWebsiteEditorPublishReview
    :open="publishReviewOpen" :changed-areas="publishChangedAreas" :warnings="publishWarnings"
    :release-note="releaseNote" :loading="publishing" :workflow="workflow" :workflow-loading="workflowLoading"
    :workflow-error="workflowError" :review-note="reviewNote" :scheduled-for="scheduledFor"
    :page-drafts="pageDrafts" :selected-page-uuids="selectedPageUuids"
    @close="publishReviewOpen = false" @publish="publish" @navigate="reviewBuiltin"
    @update:release-note="releaseNote = $event" @update:review-note="reviewNote = $event"
    @update:scheduled-for="scheduledFor = $event" @request-review="requestReview" @approve="approveReview"
    @request-changes="returnForChanges" @schedule="schedule" @cancel-schedule="cancelScheduledPublication"
    @toggle-page="togglePage"
  />
</template>
<script setup lang="ts">
import { useWebsiteEditorSession } from '~/composables/useWebsiteEditorSession'
import { useWebsiteEditorContentModel } from '~/composables/useWebsiteEditorContentModel'
import { useWebsiteEditorPageDirectory } from '~/composables/useWebsiteEditorPageDirectory'
import { useWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'
import type { WebsitePageSummary } from '~/types/websitePage'
import type { WebsiteEditorPageId } from '~/utils/websiteEditorPages'

const props = defineProps<{ pageUuid: string; pageVersion: number; disabled: boolean }>()
const emit = defineEmits<{ busy: [value: boolean]; published: []; reloadPage: [] }>()
const { siteConfig, fetchSiteConfig, invalidateSiteConfig, broadcastConfigUpdate } = useSiteConfig()
const auth = useAuthStore()
const directory = useWebsiteEditorPageDirectory()
const preparing = ref(false)
const pageDrafts = ref<WebsitePageSummary[]>([])
const selectedPageUuids = ref<string[]>([])
const {
  draft, loadingDraft, saving, publishing, actionError, conflictOpen, closeConflict,
  publishReviewOpen, publishSuccess, releaseNote, workflow, workflowLoading, workflowError,
  reviewNote, scheduledFor, loadEditor, openPublishReview, publishChanges, schedulePublication,
  requestReview, approveReview, returnForChanges, cancelScheduledPublication,
} = useWebsiteEditorSession({
  siteConfig, fetchSiteConfig, invalidateSiteConfig, broadcastConfigUpdate,
  draftApi: useWebsiteEditorDraft(),
  // Review has no editable SiteConfig form. Keep its conflict snapshots separate
  // from the built-in editor's unsaved browser recovery copy.
  recoveryOwner: () => `${auth.user?.id ?? ''}:${auth.user?.store_id ?? auth.user?.store?.id ?? ''}:publication`,
  onDraftApplied: () => {}, onDraftLoaded: () => {}, onValidationError: () => {},
  onPublished: () => { emit('published') },
})
const { publishChangedAreas, publishWarnings } = useWebsiteEditorContentModel({
  siteConfig, draft, versionPreview: ref(null), activeLocale: computed(() => draft.value?.default_locale || 'en'),
  activePage: ref<WebsiteEditorPageId>('home'), navigationPages: directory.pages,
})
const busy = computed(() => preparing.value || saving.value || publishing.value || workflowLoading.value)
watch(busy, value => emit('busy', value), { immediate: true })
const selectedPageDrafts = computed(() => pageDrafts.value.filter(page => selectedPageUuids.value.includes(page.uuid)).map(page => ({ page_uuid: page.uuid, draft_version: page.draft_version })))
async function open() {
  if (props.disabled || busy.value) return
  preparing.value = true
  publishSuccess.value = null
  closeConflict()
  try {
    await loadEditor(true)
    if (actionError.value || loadingDraft.value || !draft.value) return
    const pages = await directory.load()
    if (props.disabled) return
    const current = pages.find(page => page.uuid === props.pageUuid)
    if (!current || current.draft_version !== props.pageVersion) {
      actionError.value = 'This page changed since you opened it. Reload the page before reviewing publication.'
      return
    }
    pageDrafts.value = pages.filter(page => page.has_unpublished_changes)
    selectedPageUuids.value = current.has_unpublished_changes ? [current.uuid] : []
    await openPublishReview(selectedPageDrafts.value.length)
    if (!publishReviewOpen.value && !actionError.value && !conflictOpen.value) actionError.value = 'There are no saved changes to publish.'
  } catch (error: any) {
    actionError.value = error?.data?.message || 'Publication review could not be loaded. Your page is unchanged.'
  } finally { preparing.value = false }
}
function togglePage(uuid: string) {
  if (busy.value) return
  selectedPageUuids.value = selectedPageUuids.value.includes(uuid) ? selectedPageUuids.value.filter(id => id !== uuid) : [...selectedPageUuids.value, uuid]
}
function publish() {
  if (props.disabled || busy.value) return
  return publishChanges(publishChangedAreas.value.length, selectedPageDrafts.value)
}
function schedule() {
  if (props.disabled || busy.value) return
  return schedulePublication(selectedPageDrafts.value)
}
function reviewBuiltin(page: WebsiteEditorPageId, section: string) {
  if (busy.value) return
  return navigateTo({ path: '/admin/website-editor', query: { page, section } })
}
defineExpose({ open })
</script>
