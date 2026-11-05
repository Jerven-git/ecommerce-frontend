import { reactive, nextTick } from 'vue'
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

  it('follows browser query changes without replacing draft workspace state', async () => {
    const route = reactive({ query: { page: 'home', section: 'hero', locale: 'en' } })
    const editor = useWebsiteEditorRoute({ route, router: { replace: vi.fn() } })
    route.query = { page: 'contact', section: 'contact-content', locale: 'fr' }
    await nextTick()
    expect(editor.activePage.value).toBe('contact')
    expect(editor.selectedSection.value).toBe('contact-content')
    expect(editor.activeLocale.value).toBe('fr')
  })

  it('validates post-load route languages and sections against the current document', async () => {
    const route = reactive<{ query: Record<string, string> }>({ query: { page: 'home', locale: 'fr' } })
    const document = { default_locale: 'fr', supported_locales: ['fr', 'de'], homepage_sections: [{ id: 'features' as const, visible: true }] }
    const editor = useWebsiteEditorRoute({ route, router: { replace: vi.fn() }, document: () => document })
    route.query = { page: 'contact', section: 'missing', locale: 'unsupported' }
    await nextTick()
    expect(editor.activeLocale.value).toBe('fr')
    expect(editor.selectedSection.value).toBe('contact-content')
    route.query = { page: 'home', section: 'removed' }
    await nextTick()
    expect(editor.activeLocale.value).toBe('fr')
    expect(editor.selectedSection.value).toBe('features')
    route.query = { page: 'home', section: 'features', locale: 'de' }
    await nextTick()
    expect(editor.activeLocale.value).toBe('de')
  })

  it('opens header shortcuts in the default content language even when English is also supported', () => {
    const editor = useWebsiteEditorRoute({ route: { query: { page: 'global', section: 'header', navigationPage: 'custom' } }, router: { replace: vi.fn() } })
    editor.ensureActiveLocale({ default_locale: 'fr', supported_locales: ['fr', 'en'] })
    expect(editor.activeLocale.value).toBe('fr')
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
