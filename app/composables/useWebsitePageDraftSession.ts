import { computed, ref, watch, type Ref } from 'vue'
import type { WebsitePageDetail } from '~/types/websitePage'
import type { useWebsitePages } from '~/composables/useWebsitePages'

type PageContent = Pick<WebsitePageDetail, 'title' | 'path' | 'payload'>
export function websitePageSnapshot(page: PageContent | null) {
  return page ? JSON.stringify({ title: page.title, path: page.path, payload: page.payload }) : ''
}
export function useWebsitePageDraftSession(options: {
  page: Ref<WebsitePageDetail | null>
  api: Pick<ReturnType<typeof useWebsitePages>, 'update' | 'saveDraft'>
  recoveryOwner: () => string
}) {
  const { page, api } = options
  const savedSnapshot = ref('')
  const saving = ref(false)
  const saveError = ref('')
  const saveMessage = ref('')
  const conflict = ref(false)
  const recovery = ref<PageContent | null>(null)
  const dirty = computed(() => Boolean(page.value) && websitePageSnapshot(page.value) !== savedSnapshot.value)
  const owner = options.recoveryOwner()
  const storageKey = () => `ssu:website-page:recovery:${owner}:${page.value?.uuid ?? ''}`
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
  function preserve() {
    if (!page.value || !dirty.value) return
    recovery.value = clone({ title: page.value.title, path: page.value.path, payload: page.value.payload })
    try { if (owner) window.sessionStorage.setItem(storageKey(), JSON.stringify(recovery.value)) } catch { /* In-memory recovery remains available. */ }
  }
  function dismissRecovery() {
    recovery.value = null
    try { if (owner) window.sessionStorage.removeItem(storageKey()) } catch { /* Storage may be unavailable. */ }
  }
  function markLoaded() {
    savedSnapshot.value = websitePageSnapshot(page.value)
    conflict.value = false
    recovery.value = null
    try {
      const stored = JSON.parse((owner ? window.sessionStorage.getItem(storageKey()) : null) || 'null')
      if (stored && typeof stored.title === 'string' && typeof stored.path === 'string' && Array.isArray(stored.payload?.blocks) && stored.payload?.seo && typeof stored.payload?.localized_content === 'object') { if (websitePageSnapshot(stored) !== savedSnapshot.value) recovery.value = stored }
    } catch { /* Ignore malformed or unavailable browser storage. */ }
  }
  function restoreRecovery() {
    if (!page.value || !recovery.value || saving.value) return
    Object.assign(page.value, clone(recovery.value))
    saveMessage.value = 'Browser copy restored. Review it before saving.'
  }
  async function copyChanges() {
    if (!page.value) return
    try { await navigator.clipboard.writeText(websitePageSnapshot(page.value)); saveMessage.value = 'Page changes copied.' }
    catch { saveError.value = 'Clipboard access was blocked. Your edits remain in this editor and its browser recovery copy.' }
  }
  async function save() {
    if (!page.value || !dirty.value || saving.value || conflict.value) return
    const submitted = clone(page.value)
    const submittedSnapshot = websitePageSnapshot(submitted)
    saving.value = true; saveError.value = ''; saveMessage.value = ''
    try {
      const metadata = await api.update(submitted.uuid, { title: submitted.title.trim(), path: submitted.path, draft_version: submitted.draft_version })
      // Metadata and content are separate versioned writes. Keep this successful
      // version even if content validation/network failure requires a retry.
      page.value.draft_version = metadata.data.draft_version
      const previous = JSON.parse(savedSnapshot.value) as PageContent
      savedSnapshot.value = websitePageSnapshot({ title: metadata.data.title, path: metadata.data.path, payload: previous.payload })
      const response = await api.saveDraft(submitted.uuid, metadata.data.draft_version, submitted.payload)
      const saved = clone(response.data)
      const editedWhileSaving = websitePageSnapshot(page.value) !== submittedSnapshot
      page.value = editedWhileSaving ? { ...saved, title: page.value.title, path: page.value.path, payload: page.value.payload } : saved
      savedSnapshot.value = websitePageSnapshot(saved)
      if (dirty.value) preserve()
      else dismissRecovery()
      saveMessage.value = dirty.value ? 'Draft saved. Your newer edits still need saving.' : 'Private page draft saved.'
    } catch (error: any) {
      conflict.value = (error?.statusCode ?? error?.status) === 409
      saveError.value = conflict.value ? 'This page changed in another editor. Your edits are preserved. Copy them or reload the latest page before saving again.' : Object.values(error?.data?.errors ?? {}).flat()[0] as string || error?.data?.message || 'The page draft could not be saved. Your edits are preserved; try again.'
      preserve()
    } finally { saving.value = false }
  }
  watch(() => websitePageSnapshot(page.value), () => { if (dirty.value) preserve() })
  return { savedSnapshot, dirty, saving, saveError, saveMessage, conflict, recovery, markLoaded, restoreRecovery, dismissRecovery, copyChanges, save }
}
