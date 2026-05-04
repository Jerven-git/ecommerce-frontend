interface Product {
  id: number
  slug: string
  name: string
  description: string
  price: number | string
  stock: number
  weight: number | string
  length_cm: number | string
  width_cm: number | string
  height_cm: number | string
  shipping_calc_type: 'weight' | 'dimensions'
  volume_cbm: number
  category: string
  category_id: number | null
  categories?: { id: number; name: string }[]
  image_url: string
  is_active: boolean
  allow_backorder: boolean
  backorder_charge_policy: 'charged_now' | 'charged_later'
  seo_title?: string | null
  seo_description?: string | null
  og_image_url?: string | null
  noindex?: boolean
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  data: Product[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type { Product, PaginatedResponse }

export function useProducts() {
  const { $apiFetch } = useNuxtApp()

  const products = ref<Product[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedStatus = ref('all')
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const perPage = 15

  const showDeleteModal = ref(false)
  const deletingId = ref<number | null>(null)
  const deleting = ref(false)

  const statusFilters = [
    { value: 'all', label: 'All', activeClass: 'border-blue-500 bg-blue-50 text-blue-700' },
    { value: 'active', label: 'Active', activeClass: 'border-green-500 bg-green-50 text-green-700' },
    { value: 'inactive', label: 'Inactive', activeClass: 'border-gray-500 bg-gray-100 text-gray-700' },
  ]

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

  const loadProducts = async () => {
    loading.value = true
    error.value = null

    try {
      const query: Record<string, string | number> = {
        sort: 'created_at',
        order: 'desc',
        page: currentPage.value,
        per_page: perPage,
      }

      if (selectedStatus.value === 'active') query.is_active = 1
      else if (selectedStatus.value === 'inactive') query.is_active = 0

      const q = searchQuery.value.trim()
      if (q) query.search = q

      const response = await $apiFetch<PaginatedResponse>('/products', {
        method: 'GET',
        query,
      })

      if (response?.data) {
        products.value = response.data
        currentPage.value = response.current_page ?? 1
        totalPages.value = response.last_page ?? 1
        totalItems.value = response.total ?? 0
      }
    } catch (err: any) {
      console.error('Error loading products:', err)
      error.value = err?.data?.message || 'Failed to load products'
    } finally {
      loading.value = false
    }
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    loadProducts()
  }

  const deleteProduct = (id: number) => {
    deletingId.value = id
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!deletingId.value) return
    deleting.value = true

    try {
      await $apiFetch(`/products/${deletingId.value}`, { method: 'DELETE' })
      await loadProducts()
      showDeleteModal.value = false
      deletingId.value = null
    } catch (err: any) {
      console.error('Error deleting product:', err)
    } finally {
      deleting.value = false
    }
  }

  // Re-fetch when status filter changes
  watch(selectedStatus, () => {
    currentPage.value = 1
    loadProducts()
  })

  // Debounced re-fetch when search query changes
  let searchTimer: ReturnType<typeof setTimeout>
  watch(searchQuery, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      currentPage.value = 1
      loadProducts()
    }, 400)
  })

  return {
    products,
    loading,
    error,
    searchQuery,
    selectedStatus,
    currentPage,
    totalPages,
    totalItems,
    perPage,
    statusFilters,
    visiblePages,
    showDeleteModal,
    deleting,
    loadProducts,
    goToPage,
    deleteProduct,
    confirmDelete,
  }
}
