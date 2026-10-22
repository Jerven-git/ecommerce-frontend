import { ref, watch } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWebsiteEditorDraft } from '~/composables/useWebsiteEditorDraft'

describe('useWebsiteEditorDraft preload ownership', () => {
  const state = new Map<string, ReturnType<typeof ref>>()
  const auth = {
    user: { id: 7, store_id: 11, store: { id: 11 } },
  }
  let apiFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    state.clear()
    auth.user = { id: 7, store_id: 11, store: { id: 11 } }
    apiFetch = vi.fn(async (url: string, options?: { method?: string }) => ({
      data: {
        has_draft: options?.method === 'PUT',
        source: url,
      },
    }))

    vi.stubGlobal('watch', watch)
    vi.stubGlobal('useNuxtApp', () => ({ $apiFetch: apiFetch }))
    vi.stubGlobal('useAuthStore', () => auth)
    vi.stubGlobal('useState', (key: string, initialize: () => unknown) => {
      if (!state.has(key)) state.set(key, ref(initialize()))
      return state.get(key)
    })
  })

  it('reuses a fresh preload for the same authenticated user and store', async () => {
    const editor = useWebsiteEditorDraft()

    await editor.preloadDraft()
    const result = await editor.fetchDraft({ preferPreloaded: true })

    expect(result.data.source).toBe('/site-config/draft')
    expect(apiFetch).toHaveBeenCalledTimes(1)
  })

  it('does not reuse another tenant owner\'s preloaded draft', async () => {
    const editor = useWebsiteEditorDraft()
    await editor.preloadDraft()

    auth.user = { id: 8, store_id: 22, store: { id: 22 } }
    await editor.fetchDraft({ preferPreloaded: true })

    expect(apiFetch).toHaveBeenCalledTimes(2)
  })

  it('invalidates the preload after a draft mutation', async () => {
    const editor = useWebsiteEditorDraft()
    await editor.preloadDraft()

    await editor.saveDraft('2026-10-22T00:00:00Z', null, {} as never)
    await editor.fetchDraft({ preferPreloaded: true })

    expect(apiFetch.mock.calls.map(call => call[1]?.method ?? 'GET')).toEqual([
      'GET',
      'PUT',
      'GET',
    ])
  })
})
