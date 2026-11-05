import type {
  PaginatedWebsitePages,
  WebsitePageBlock,
  WebsitePageBlockDefinitionResponse,
  WebsitePageCollectionItem,
  WebsitePageConnectedBlockType,
  WebsitePageContentOptions,
  WebsitePageDetail,
  WebsitePageDocument,
  WebsitePageRuntime,
} from '~/types/websitePage'

export function useWebsitePages() {
  const { $apiFetch } = useNuxtApp()

  const list = (query: Record<string, string | number> = {}) =>
    $apiFetch<PaginatedWebsitePages>('/admin/website-pages', { query })
  const definitions = () =>
    $apiFetch<WebsitePageBlockDefinitionResponse>('/admin/website-pages/block-definitions')
  const get = (uuid: string) =>
    $apiFetch<{ data: WebsitePageDetail }>(`/admin/website-pages/${uuid}`)
  const create = (body: { title: string, path: string, payload?: WebsitePageDocument }) =>
    $apiFetch<{ data: WebsitePageDetail, message: string }>('/admin/website-pages', { method: 'POST', body })
  const update = (uuid: string, body: { title: string, path: string, draft_version: number }) =>
    $apiFetch<{ data: WebsitePageDetail, message: string }>(`/admin/website-pages/${uuid}`, { method: 'PATCH', body })
  const saveDraft = (uuid: string, draftVersion: number, payload: WebsitePageDocument) =>
    $apiFetch<{ data: WebsitePageDetail, message: string }>(`/admin/website-pages/${uuid}/draft`, {
      method: 'PUT',
      body: { draft_version: draftVersion, payload },
    })
  const remove = (uuid: string, draftVersion: number) =>
    $apiFetch<{ message: string }>(`/admin/website-pages/${uuid}`, {
      method: 'DELETE',
      body: { draft_version: draftVersion },
    })
  const contentOptions = (params: {
    type: WebsitePageConnectedBlockType
    search?: string
    ids?: number[]
    limit?: number
  }) => $apiFetch<{ data: WebsitePageContentOptions }>('/admin/website-pages/content-options', {
    query: params,
  })
  const previewCollections = (blocks: Array<Pick<WebsitePageBlock, 'id' | 'type' | 'settings'>>) =>
    $apiFetch<{ data: { collections: Record<string, WebsitePageCollectionItem[]> } }>('/admin/website-pages/preview-collections', {
      method: 'POST',
      body: { blocks },
    })
  const resolve = (path: string, locale?: string | null) =>
    $apiFetch<{ data: WebsitePageRuntime }>('/website-pages/resolve', {
      query: { path, ...(locale ? { locale } : {}) },
    })

  return { list, definitions, get, create, update, saveDraft, remove, contentOptions, previewCollections, resolve }
}
