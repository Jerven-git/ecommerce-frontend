import type { WebsiteEditorAssetSlot, WebsiteEditorAssetUpload } from '~/composables/useWebsiteEditorDraft'

export interface WebsiteEditorMediaAsset {
  id: number
  name: string
  url: string
  mime_type: string
  size: number
  alt_text: string | null
  status: 'live' | 'draft' | 'archived'
  usage: string[]
  can_delete: boolean
  created_at: string | null
}

export interface WebsiteEditorMediaPage {
  data: WebsiteEditorMediaAsset[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export function useWebsiteEditorMediaLibrary() {
  const { $apiFetch } = useNuxtApp()

  const fetchAssets = (params: {
    slot: WebsiteEditorAssetSlot
    type?: 'all' | 'image' | 'video'
    search?: string
    page?: number
  }) => $apiFetch<WebsiteEditorMediaPage>('/site-config/media-library', { params })

  const reuseAsset = (mediaId: number, slot: WebsiteEditorAssetSlot) =>
    $apiFetch<WebsiteEditorAssetUpload>(`/site-config/media-library/${mediaId}/use/${slot}`, {
      method: 'POST',
    })

  const updateAsset = (mediaId: number, metadata: { original_name: string; alt_text: string }) =>
    $apiFetch<{ data: WebsiteEditorMediaAsset }>(`/site-config/media-library/${mediaId}`, {
      method: 'PATCH',
      body: metadata,
    })

  const deleteAsset = (mediaId: number) =>
    $apiFetch<{ message: string }>(`/site-config/media-library/${mediaId}`, {
      method: 'DELETE',
    })

  return { fetchAssets, reuseAsset, updateAsset, deleteAsset }
}
