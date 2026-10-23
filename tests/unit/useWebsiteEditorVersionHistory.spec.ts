import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { SiteConfig } from '~/composables/useSiteConfig'
import type { WebsiteEditorDraftState } from '~/composables/useWebsiteEditorDraft'
import { useWebsiteEditorVersionHistory } from '~/composables/useWebsiteEditorVersionHistory'

function api() {
  return {
    fetchVersions: vi.fn().mockResolvedValue({
      data: [{ id: 4, created_at: '2026-10-23T00:00:00Z', publisher_name: 'Editor', release_note: null, changed_areas: [] }],
      published_hash: 'published-hash',
    }),
    fetchVersion: vi.fn().mockResolvedValue({
      data: { id: 4, created_at: '2026-10-23T00:00:00Z', publisher_name: 'Editor', release_note: null, changed_areas: [], payload: { site_name: 'Older Store' } },
      published_hash: 'published-hash',
    }),
    restoreVersion: vi.fn().mockResolvedValue({ data: {} as WebsiteEditorDraftState, message: 'Restored' }),
    deleteVersion: vi.fn().mockResolvedValue({ message: 'Deleted' }),
  } as unknown as ReturnType<typeof useWebsiteEditorDraft>
}

function config(): SiteConfig {
  return {
    site_name: 'Live Store',
    default_locale: 'en',
    supported_locales: ['en'],
    localized_content: {},
    header_cta: { enabled: false, label: '', link: '' },
    footer_banner: { enabled: false, heading: '', subtitle: '', button_label: '', button_link: '', background_color: '#111827', background_color_to: '', text_color: '#ffffff' },
    footer: { tagline: '', copyright_text: '', show_tagline: true, show_quick_links: true, show_contact_info: true, show_social_links: true },
  } as SiteConfig
}

describe('useWebsiteEditorVersionHistory', () => {
  it('previews and deletes an archived version without applying it to the draft', async () => {
    const draftApi = api()
    const applyDraftState = vi.fn()
    const onPreviewSelected = vi.fn()
    const onPreviewExited = vi.fn()
    const history = useWebsiteEditorVersionHistory({
      siteConfig: ref(config()),
      draftVersion: ref(8),
      actionError: ref(''),
      draftApi,
      applyDraftState,
      dismissRecovery: vi.fn(),
      openSaveConflict: vi.fn(),
      onPreviewSelected,
      onPreviewExited,
      onDeleteFocus: vi.fn(),
    })

    await history.toggleHistory()
    await history.previewVersionFromHistory(4)
    history.requestVersionDeletion(4)
    await history.confirmVersionDeletion()

    expect(onPreviewSelected).toHaveBeenCalledWith(expect.objectContaining({ site_name: 'Older Store' }))
    expect(onPreviewExited).toHaveBeenCalledOnce()
    expect(applyDraftState).not.toHaveBeenCalled()
    expect(history.versions.value).toEqual([])
  })

  it('opens conflict recovery when restoring against stale published state', async () => {
    const draftApi = api()
    vi.mocked(draftApi.restoreVersion).mockRejectedValue({ statusCode: 409 })
    const openSaveConflict = vi.fn()
    const history = useWebsiteEditorVersionHistory({
      siteConfig: ref(config()),
      draftVersion: ref(8),
      actionError: ref(''),
      draftApi,
      applyDraftState: vi.fn(),
      dismissRecovery: vi.fn(),
      openSaveConflict,
      onPreviewSelected: vi.fn(),
      onPreviewExited: vi.fn(),
      onDeleteFocus: vi.fn(),
    })

    await history.previewVersionFromHistory(4)
    await history.restoreSelectedVersion()

    expect(openSaveConflict).toHaveBeenCalledOnce()
    expect(history.historyError.value).toBe('This website version could not be restored.')
  })
})
