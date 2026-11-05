// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import * as Vue from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Publication from '~/components/admin/WebsiteEditorPagePublication.vue'

const fixture = vi.hoisted(() => ({ api: {} as Record<string, any> }))
vi.mock('~/composables/useWebsiteEditorDraft', async original => ({ ...(await original<any>()), useWebsiteEditorDraft: () => fixture.api }))
const workflow = { status: 'draft', requested_by_name: null, requested_at: null, reviewed_by_name: null, reviewed_at: null, note: null, scheduled_publish_at: null, scheduled_by_name: null, scheduled_release_note: null, timezone: 'UTC' }
const config = { site_name: 'Live store', default_locale: 'en', supported_locales: ['en'], localized_content: {}, header_cta: { enabled: false, label: '', link: '' }, footer_banner: { enabled: false }, footer: {}, modules_enabled: {} }
const state = () => ({ payload: { site_name: 'Saved website change' }, base_updated_at: '2026-11-04', has_draft: true, draft_version: 3, draft_updated_at: null, workflow })
const pages = [{ uuid: 'current', title: 'Current page', path: '/current', draft_version: 7, has_unpublished_changes: true }, { uuid: 'other', title: 'Other page', path: '/other', draft_version: 9, has_unpublished_changes: true }]
const list = vi.fn()
const review = Vue.defineComponent({ name: 'Review', props: ['open', 'changedAreas', 'selectedPageUuids', 'pageDrafts'], emits: ['publish', 'togglePage', 'schedule', 'update:scheduledFor'], template: '<div />' })
function render(disabled = false) { return mount(Publication, { props: { pageUuid: 'current', pageVersion: 7, disabled }, global: { stubs: { AdminWebsiteEditorPublishReview: review } } }) }
async function open(wrapper: ReturnType<typeof render>) { await (wrapper.vm as unknown as { open: () => Promise<void> }).open(); await flushPromises() }
beforeEach(() => {
  for (const name of ['ref', 'computed', 'watch'] as const) vi.stubGlobal(name, Vue[name])
  vi.stubGlobal('useSiteConfig', () => ({ siteConfig: Vue.ref(config), fetchSiteConfig: vi.fn(), invalidateSiteConfig: vi.fn(), broadcastConfigUpdate: vi.fn() }))
  vi.stubGlobal('useAuthStore', () => ({ user: { id: 1, store_id: 2 } }))
  vi.stubGlobal('useNuxtApp', () => ({ $apiFetch: list }))
  vi.stubGlobal('navigateTo', vi.fn())
  fixture.api = {
    fetchDraft: vi.fn().mockResolvedValue({ data: state() }), saveDraft: vi.fn().mockResolvedValue({ data: state() }),
    publishDraft: vi.fn().mockResolvedValue({ data: state() }), scheduleDraft: vi.fn().mockResolvedValue({ data: workflow }),
    requestDraftReview: vi.fn(), approveDraft: vi.fn(), requestDraftChanges: vi.fn(), cancelDraftSchedule: vi.fn(),
  }
  list.mockReset().mockResolvedValue({ data: pages, last_page: 1 })
  sessionStorage.clear()
})
describe('custom-page coordinated publication', () => {
  it('reviews website changes and selects only the current page by default', async () => {
    const wrapper = render(); await open(wrapper)
    const modal = wrapper.findComponent(review)
    expect(modal.props('open')).toBe(true)
    expect(modal.props('selectedPageUuids')).toEqual(['current'])
    expect(modal.props('changedAreas').length).toBeGreaterThan(0)
    expect(fixture.api.publishDraft).not.toHaveBeenCalled()
    modal.vm.$emit('publish'); await flushPromises()
    expect(fixture.api.publishDraft).toHaveBeenCalledWith('', [{ page_uuid: 'current', draft_version: 7 }])
    expect(wrapper.emitted('published')).toHaveLength(1)
    wrapper.unmount()
  })
  it('refuses stale page versions and unsaved page state before opening review', async () => {
    const wrapper = render(true); await open(wrapper)
    expect(fixture.api.fetchDraft).not.toHaveBeenCalled()
    await wrapper.setProps({ disabled: false, pageVersion: 6 }); await open(wrapper)
    expect(wrapper.findComponent(review).props('open')).toBe(false)
    expect(wrapper.text()).toContain('This page changed since you opened it')
    expect(fixture.api.publishDraft).not.toHaveBeenCalled()
    wrapper.unmount()
  })
  it('passes the selected version snapshots to scheduling', async () => {
    const wrapper = render(); await open(wrapper)
    const modal = wrapper.findComponent(review)
    modal.vm.$emit('togglePage', 'other'); modal.vm.$emit('update:scheduledFor', '2026-11-05T10:00'); await flushPromises()
    modal.vm.$emit('schedule'); await flushPromises()
    expect(fixture.api.scheduleDraft).toHaveBeenCalledWith(3, '2026-11-05T10:00', '', [{ page_uuid: 'current', draft_version: 7 }, { page_uuid: 'other', draft_version: 9 }])
    wrapper.unmount()
  })
  it('reports a concurrent publication conflict without claiming success', async () => {
    fixture.api.publishDraft.mockRejectedValue({ statusCode: 409 })
    const wrapper = render(); await open(wrapper)
    wrapper.findComponent(review).vm.$emit('publish'); await flushPromises()
    expect(wrapper.text()).toContain('A draft changed after this review')
    expect(wrapper.findComponent(review).props('open')).toBe(false)
    expect(wrapper.emitted('published')).toBeUndefined()
    wrapper.unmount()
  })
})
