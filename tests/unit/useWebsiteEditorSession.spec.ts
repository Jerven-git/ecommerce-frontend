// @vitest-environment happy-dom

import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SiteConfig } from '~/composables/useSiteConfig'
import type { WebsiteEditorDraftState, WebsiteEditorWorkflow } from '~/composables/useWebsiteEditorDraft'
import { useWebsiteEditorSession } from '~/composables/useWebsiteEditorSession'

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
    timezone: 'UTC',
  }
}

function draftState(overrides: Partial<WebsiteEditorDraftState> = {}): WebsiteEditorDraftState {
  return {
    payload: { site_name: 'Tenant Store' },
    base_updated_at: '2026-10-23T00:00:00Z',
    has_draft: true,
    draft_updated_at: '2026-10-23T00:00:00Z',
    draft_version: 3,
    workflow: workflow(),
    ...overrides,
  }
}

function siteConfig(): SiteConfig {
  return {
    site_name: 'Published Store',
    default_locale: 'en',
    supported_locales: ['en'],
    localized_content: {},
    header_cta: { enabled: false, label: '', link: '' },
    footer_banner: {
      enabled: false,
      heading: '',
      subtitle: '',
      button_label: '',
      button_link: '',
      background_color: '#111827',
      background_color_to: '',
      text_color: '#ffffff',
    },
    footer: {
      tagline: '',
      copyright_text: '',
      show_tagline: true,
      show_quick_links: true,
      show_contact_info: true,
      show_social_links: true,
    },
  } as SiteConfig
}

function draftApi(fetchDraft = vi.fn().mockResolvedValue({ data: draftState() })) {
  return {
    fetchDraft,
    preloadDraft: vi.fn(),
    saveDraft: vi.fn().mockResolvedValue({ data: draftState() }),
    discardDraft: vi.fn().mockResolvedValue({ data: draftState({ has_draft: false, draft_updated_at: null, draft_version: null }) }),
    publishDraft: vi.fn().mockResolvedValue({ data: draftState(), message: 'Published' }),
    requestDraftReview: vi.fn().mockResolvedValue({ data: workflow(), message: 'Requested' }),
    approveDraft: vi.fn().mockResolvedValue({ data: workflow(), message: 'Approved' }),
    requestDraftChanges: vi.fn().mockResolvedValue({ data: workflow(), message: 'Returned' }),
    scheduleDraft: vi.fn().mockResolvedValue({ data: workflow(), message: 'Scheduled' }),
    cancelDraftSchedule: vi.fn().mockResolvedValue({ data: workflow(), message: 'Cancelled' }),
    fetchVersions: vi.fn(),
    fetchVersion: vi.fn(),
    restoreVersion: vi.fn(),
    deleteVersion: vi.fn(),
    uploadDraftAsset: vi.fn(),
  } as unknown as ReturnType<typeof useWebsiteEditorDraft>
}

function createSession(api = draftApi()) {
  const config = ref<SiteConfig | null>(siteConfig())
  const broadcastConfigUpdate = vi.fn()
  const onDraftApplied = vi.fn()
  const onPublished = vi.fn()
  const onValidationError = vi.fn()
  const fetchSiteConfig = vi.fn().mockResolvedValue(undefined)
  const session = useWebsiteEditorSession({
    siteConfig: config,
    fetchSiteConfig,
    broadcastConfigUpdate,
    draftApi: api,
    recoveryOwner: () => '7:11',
    onDraftApplied,
    onDraftLoaded: vi.fn(),
    onValidationError,
    onPublished,
  })

  return { session, api, broadcastConfigUpdate, onDraftApplied, onPublished, onValidationError, fetchSiteConfig }
}

describe('useWebsiteEditorSession', () => {
  beforeEach(() => window.sessionStorage.clear())

  it('preserves the browser draft when a concurrent save conflicts', async () => {
    const api = draftApi()
    vi.mocked(api.saveDraft).mockRejectedValue({ statusCode: 409 })
    const { session } = createSession(api)
    await session.loadEditor()
    session.draft.value = { ...session.draft.value!, site_name: 'Unsaved browser edit' }

    await session.saveChanges()

    expect(session.conflictOpen.value).toBe(true)
    expect(session.recoverySnapshot.value?.payload.site_name).toBe('Unsaved browser edit')
    expect(window.sessionStorage.getItem('ssu:website-editor:recovery:7:11')).toContain('Unsaved browser edit')
  })

  it('delegates validation navigation without losing the API error message', async () => {
    const api = draftApi()
    vi.mocked(api.saveDraft).mockRejectedValue({
      data: {
        message: 'The draft contains invalid content.',
        errors: { 'payload.site_name': ['The site name is required.'] },
      },
    })
    const { session, onValidationError } = createSession(api)
    await session.loadEditor()
    session.draft.value = { ...session.draft.value!, site_name: '' }

    await session.saveChanges()

    expect(onValidationError).toHaveBeenCalledWith({ 'payload.site_name': ['The site name is required.'] })
    expect(session.actionError.value).toBe('The draft contains invalid content.')
  })

  it('refreshes published state and the open history callback after publishing', async () => {
    const fetchDraft = vi.fn()
      .mockResolvedValueOnce({ data: draftState() })
      .mockResolvedValueOnce({ data: draftState({ has_draft: false, draft_updated_at: null, draft_version: null }) })
    const api = draftApi(fetchDraft)
    const { session, broadcastConfigUpdate, fetchSiteConfig, onPublished } = createSession(api)
    await session.loadEditor()

    await session.publishChanges(2)

    expect(api.publishDraft).toHaveBeenCalledWith('')
    expect(fetchSiteConfig).toHaveBeenLastCalledWith(true)
    expect(broadcastConfigUpdate).toHaveBeenCalledOnce()
    expect(onPublished).toHaveBeenCalledOnce()
    expect(session.publishSuccess.value?.summary).toBe('2 changed areas are now live.')
  })
})
