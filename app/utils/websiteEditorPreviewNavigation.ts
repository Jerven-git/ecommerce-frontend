import { WEBSITE_EDITOR_PAGES } from '~/utils/websiteEditorPages'
import type { WebsitePageSummary } from '~/types/websitePage'

// Only known destinations from this store can select an editor document.
export function resolvePreviewNavigation(href: string, origin: string, pages: WebsitePageSummary[]) {
  if (!href || href.startsWith('#')) return null
  let url: URL
  try { url = new URL(href, origin) } catch { return null }
  if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol)) return null
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const builtin = WEBSITE_EDITOR_PAGES.find(page => page.path === path)
  if (builtin) return { kind: 'builtin' as const, page: builtin.id }
  const custom = pages.find(page => page.path === path || page.published_path === path)
  return custom ? { kind: 'custom' as const, uuid: custom.uuid } : null
}
