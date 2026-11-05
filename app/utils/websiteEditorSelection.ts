import type { LocationQuery } from 'vue-router'
import { WEBSITE_EDITOR_PAGES, type WebsiteEditorPageId } from '~/utils/websiteEditorPages'

export type WebsiteEditorSelection =
  | { kind: 'builtin'; page: WebsiteEditorPageId }
  | { kind: 'custom'; uuid: string }

export function resolveWebsiteEditorSelection(query: LocationQuery): WebsiteEditorSelection {
  if (typeof query.customPage === 'string' && query.customPage.trim()) {
    return { kind: 'custom', uuid: query.customPage.trim() }
  }
  const page = WEBSITE_EDITOR_PAGES.find(option => option.id === query.page)?.id ?? 'home'
  return { kind: 'builtin', page }
}

// Built-in pages share one SiteConfig draft; each custom page owns a document.
export function websiteEditorDocumentKey(selection: WebsiteEditorSelection): string {
  return selection.kind === 'custom' ? `custom:${selection.uuid}` : 'builtin'
}
