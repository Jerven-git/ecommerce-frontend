import type { ServiceCategory } from '~/types/service'

export function useServiceCategories() {
  const { $apiFetch } = useNuxtApp()

  const categories = ref<ServiceCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await $apiFetch<{ data: ServiceCategory[] }>('/service-categories')
      categories.value = res.data ?? []
    } catch (err: any) {
      console.error('Error loading service categories:', err)
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
