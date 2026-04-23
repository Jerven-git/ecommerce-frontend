import type { PostCategory } from '~/types/post'

export function usePostCategories() {
  const { $apiFetch } = useNuxtApp()

  const categories = ref<PostCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await $apiFetch<{ data: PostCategory[] }>('/post-categories')
      categories.value = res.data ?? []
    } catch (err: any) {
      console.error('Error loading post categories:', err)
      error.value = err?.data?.message || 'Failed to load categories'
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    error,
    loadCategories,
  }
}
