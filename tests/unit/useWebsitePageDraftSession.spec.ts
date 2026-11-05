// @vitest-environment happy-dom
import { effectScope, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWebsitePageDraftSession } from '~/composables/useWebsitePageDraftSession'
import type { WebsitePageDetail } from '~/types/websitePage'

const detail = () => ({ uuid: 'page-a', title: 'Original', path: '/original', draft_version: 1, is_published: false, has_unpublished_changes: true, payload: { blocks: [], seo: { title: '', description: '', noindex: false, og_image_media_id: null }, localized_content: {} } }) as WebsitePageDetail
function setup(owner = 'user:store') {
  const page = ref(detail())
  const api = { update: vi.fn().mockResolvedValue({ data: { ...detail(), draft_version: 2 } }), saveDraft: vi.fn().mockResolvedValue({ data: { ...detail(), title: 'Saved', draft_version: 3 } }) }
  const scope = effectScope()
  const session = scope.run(() => useWebsitePageDraftSession({ page, api: api as any, recoveryOwner: () => owner }))!
  session.markLoaded()
  return { page, api, session, scope }
}
beforeEach(() => sessionStorage.clear())
describe('custom page save session', () => {
  it('uses the metadata write version for content and keeps edits made while saving', async () => {
    const { page, api, session, scope } = setup()
    let finish!: (value: any) => void
    api.saveDraft.mockReturnValueOnce(new Promise(resolve => { finish = resolve }))
    page.value.title = 'Saved'
    const saving = session.save()
    await nextTick()
    page.value.title = 'Newer edit'
    finish({ data: { ...detail(), title: 'Saved', draft_version: 3 } })
    await saving
    expect(api.saveDraft.mock.calls[0]?.[1]).toBe(2)
    expect(page.value.title).toBe('Newer edit')
    expect(page.value.draft_version).toBe(3)
    expect(session.dirty.value).toBe(true)
    scope.stop()
  })
  it('retains a successful metadata version when content fails, allowing a safe retry', async () => {
    const { page, api, session, scope } = setup()
    page.value.title = 'Saved'
    api.saveDraft.mockRejectedValueOnce({ statusCode: 422, data: { message: 'Invalid content' } })
    await session.save()
    expect(page.value.draft_version).toBe(2)
    expect(session.dirty.value).toBe(true)
    expect(session.saveError.value).toBe('Invalid content')
    await session.save()
    expect(api.update.mock.calls[1]?.[1].draft_version).toBe(2)
    expect(session.dirty.value).toBe(false)
    scope.stop()
  })
  it('keeps reverted metadata dirty after metadata succeeded but content failed', async () => {
    const { page, api, session, scope } = setup()
    page.value.title = 'Committed metadata'
    api.update.mockResolvedValueOnce({ data: { ...detail(), title: 'Committed metadata', draft_version: 2 } })
    api.saveDraft.mockRejectedValueOnce({ statusCode: 422 })
    await session.save()
    page.value.title = 'Original'
    expect(session.dirty.value).toBe(true)
    expect(page.value.draft_version).toBe(2)
    scope.stop()
  })

  it('blocks repeat saves after a version conflict and preserves browser recovery', async () => {
    const { page, api, session, scope } = setup()
    page.value.title = 'My changes'
    api.update.mockRejectedValue({ statusCode: 409 })
    await session.save(); await session.save()
    expect(api.update).toHaveBeenCalledTimes(1)
    expect(page.value.title).toBe('My changes')
    expect(session.conflict.value).toBe(true)
    expect(session.recovery.value?.title).toBe('My changes')
    scope.stop()
  })
  it('restores recovery against the latest version and isolates owners', async () => {
    const first = setup()
    first.page.value.title = 'Recovered text'
    await nextTick(); first.scope.stop()
    const other = setup('different:store')
    expect(other.session.recovery.value).toBeNull(); other.scope.stop()
    const latest = setup()
    latest.page.value.draft_version = 9
    latest.session.restoreRecovery()
    expect(latest.page.value.title).toBe('Recovered text')
    expect(latest.page.value.draft_version).toBe(9)
    expect(latest.session.dirty.value).toBe(true)
    latest.scope.stop()
  })
})
