import { ref } from 'vue'
import { useWebsitePages } from '~/composables/useWebsitePages'
import type { WebsitePageSummary } from '~/types/websitePage'

export function useWebsiteEditorPageDirectory() {
  const api = useWebsitePages()
  const pages = ref<WebsitePageSummary[]>([])
  const loading = ref(false)
  const error = ref('')
  async function load() {
    loading.value = true
    error.value = ''
    try {
      const result: WebsitePageSummary[] = []
      let page = 1
      let lastPage = 1
      do {
        const response = await api.list({ page, per_page: 100, sort: 'updated_at', order: 'desc' })
        result.push(...response.data)
        lastPage = response.last_page
        page += 1
      } while (page <= lastPage)
      pages.value = result
      return result
    } catch (requestError: any) {
      error.value = requestError?.data?.message || 'Your store’s pages could not be loaded.'
      throw requestError
    } finally { loading.value = false }
  }
  return { pages, loading, error, load }
}
