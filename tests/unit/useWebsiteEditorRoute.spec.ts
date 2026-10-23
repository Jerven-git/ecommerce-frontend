import { describe, expect, it, vi } from 'vitest'
import { resolveWebsiteEditorRoute, useWebsiteEditorRoute } from '~/composables/useWebsiteEditorRoute'

describe('website editor route state', () => {
  it('falls back to a valid home selection for unsupported query values', () => {
    expect(resolveWebsiteEditorRoute({ page: 'missing', section: undefined, locale: undefined })).toEqual({
      page: 'home',
      section: 'hero',
      locale: 'en',
    })
  })

  it('preserves unrelated query parameters while synchronizing editor state', () => {
    const replace = vi.fn()
    const route = { query: { page: 'home', section: 'hero', locale: 'en', source: 'settings' } }
    const editorRoute = useWebsiteEditorRoute({ route, router: { replace } })

    editorRoute.selectPage('contact', 'contact-content')

    expect(replace).toHaveBeenCalledWith({
      query: {
        page: 'contact',
        section: 'contact-content',
        locale: 'en',
        source: 'settings',
      },
    })
  })

  it('returns to the draft default when a requested locale is unavailable', () => {
    const editorRoute = useWebsiteEditorRoute({
      route: { query: { page: 'home', section: 'hero', locale: 'fr' } },
      router: { replace: vi.fn() },
    })

    editorRoute.ensureActiveLocale({ default_locale: 'en', supported_locales: ['en', 'de'] })

    expect(editorRoute.activeLocale.value).toBe('en')
  })
})
