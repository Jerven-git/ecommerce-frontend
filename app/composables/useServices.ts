import type { PaginatedServices, Service, ServiceDetail } from '~/types/service'

export function useServices() {
  const { $apiFetch } = useNuxtApp()

  const services = ref<Service[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const perPage = 12

  const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const pages: (number | string)[] = [1]
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
    return pages
  })

  const loadServices = async () => {
    loading.value = true
    error.value = null

    try {
      const query: Record<string, string | number> = {
        page: currentPage.value,
        per_page: perPage,
      }

      if (selectedCategory.value) query.category = selectedCategory.value
      const q = searchQuery.value.trim()
      if (q) query.search = q

      const response = await $apiFetch<PaginatedServices>('/services', {
        method: 'GET',
        query,
      })

      if (response?.data) {
        services.value = response.data
        currentPage.value = response.current_page ?? 1
        totalPages.value = response.last_page ?? 1
        totalItems.value = response.total ?? 0
      }
    } catch (err: any) {
      console.error('Error loading services:', err)
      error.value = err?.data?.message || 'Failed to load services'
    } finally {
      loading.value = false
    }
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    loadServices()
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  watch(selectedCategory, () => {
    currentPage.value = 1
    loadServices()
  })

  let searchTimer: ReturnType<typeof setTimeout>
  watch(searchQuery, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      currentPage.value = 1
      loadServices()
    }, 400)
  })

  return {
    services,
    loading,
    error,
    searchQuery,
    selectedCategory,
    currentPage,
    totalPages,
    totalItems,
    perPage,
    visiblePages,
    loadServices,
    goToPage,
  }
}

/** Fetch a single service (with related) by slug. */
export async function fetchServiceBySlug(slug: string): Promise<{ data: ServiceDetail; related: Service[] } | null> {
  const { $apiFetch } = useNuxtApp()
  try {
    return await $apiFetch<{ data: ServiceDetail; related: Service[] }>(`/services/${slug}`)
  } catch {
    return null
  }
}

/** Fetch featured services for the landing strip. */
export async function fetchFeaturedServices(limit = 3): Promise<Service[]> {
  const { $apiFetch } = useNuxtApp()
  try {
    const res = await $apiFetch<{ data: Service[] }>('/services', {
      query: { featured: 1, limit },
    })
    return res.data ?? []
  } catch {
    return []
  }
}
