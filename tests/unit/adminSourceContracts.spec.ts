import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectRoot = fileURLToPath(new URL('../..', import.meta.url))
const source = (path: string) => readFileSync(`${projectRoot}/${path}`, 'utf8')

describe('admin API source contracts', () => {
  it.each([
    ['posts', 'app/pages/admin/posts/[id].vue'],
    ['services', 'app/pages/admin/services/[id].vue'],
  ])('keeps %s create, update, upload, and delete endpoints stable', (resource, path) => {
    const contents = source(path)

    expect(contents).toContain(`$apiFetch('/admin/${resource}', { method: 'POST'`)
    expect(contents).toContain(`$apiFetch(\`/admin/${resource}/\${idParam.value}\`, { method: 'PATCH'`)
    expect(contents).toContain("fd.append('_method', 'PATCH')")
    expect(contents).toContain(`$apiFetch(\`/admin/${resource}/\${idParam.value}\`, { method: 'DELETE'`)
  })

  it('keeps the Site Settings request method and persisted top-level keys stable', () => {
    const contents = source('app/pages/admin/settings.vue')

    expect(contents).toMatch(/\$apiFetch<SiteConfigResponse>\('\/site-config', \{ method: 'GET' \}\)/)
    expect(contents).toContain("$apiFetch('/site-config', {\n      method: 'PATCH'")
    for (const key of [
      'theme',
      'badge_in_stock_color',
      'favorites_enabled',
      'homepage_showcase',
      'homepage_watch_shop',
      'homepage_best_sellers',
      'modules_enabled',
      'pages_seo',
    ]) {
      expect(contents).toContain(`${key}:`)
    }
  })

  it('keeps Website Editor mutations behind the private draft API', () => {
    const contents = source('app/composables/useWebsiteEditorDraft.ts')

    expect(contents).toContain("$apiFetch<{ data: WebsiteEditorDraftState }>('/site-config/draft', {\n      method: 'PUT'")
    expect(contents).toContain("$apiFetch<{ data: WebsiteEditorDraftState }>('/site-config/draft', {\n    method: 'DELETE'")
    expect(contents).toContain("$apiFetch<{ data: WebsiteEditorDraftState; message: string }>('/site-config/draft/publish', {")
  })
})
