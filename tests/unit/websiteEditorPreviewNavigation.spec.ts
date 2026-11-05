import { describe, expect, it } from 'vitest'
import { resolvePreviewNavigation } from '~/utils/websiteEditorPreviewNavigation'
import type { WebsitePageSummary } from '~/types/websitePage'

const origin = 'https://admin.example.test'
const pages = [{ uuid: 'tenant-page', path: '/renamed', published_path: '/information' }] as WebsitePageSummary[]

describe('preview navigation destinations', () => {
  it('resolves built-in pages including Home rather than Global sections', () => {
    expect(resolvePreviewNavigation('/', origin, pages)).toEqual({ kind: 'builtin', page: 'home' })
    expect(resolvePreviewNavigation('/contact/?from=header', origin, pages)).toEqual({ kind: 'builtin', page: 'contact' })
  })
  it('resolves only known custom pages, including their current published paths', () => {
    for (const href of ['/information', '/renamed']) {
      expect(resolvePreviewNavigation(href, origin, pages)).toEqual({ kind: 'custom', uuid: 'tenant-page' })
    }
    expect(resolvePreviewNavigation('/another-store-page', origin, pages)).toBeNull()
  })
  it('ignores external, privileged, transactional and non-page links', () => {
    for (const href of ['https://other.test/contact', '//other.test/', 'javascript:alert(1)', 'mailto:test@example.test', '/admin', '/cart', '#details', '']) {
      expect(resolvePreviewNavigation(href, origin, pages)).toBeNull()
    }
  })
})
