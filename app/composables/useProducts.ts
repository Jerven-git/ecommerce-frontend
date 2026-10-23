import type { AdminProduct, PaginatedProducts } from '~/types/product'

export function useProducts() {
  const { $apiFetch } = useNuxtApp()

  const products = ref<AdminProduct[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedStatus = ref('all')
  const selectedCategoryId = ref<number | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const perPage = 10

  const showDeleteModal = ref(false)
  const deletingId = ref<number | null>(null)
  const deleting = ref(false)

  const statusFilters = [
    { value: 'all', label: 'All', activeClass: 'border-blue-500 bg-blue-50 text-blue-700' },
    { value: 'active', label: 'Active', activeClass: 'border-green-500 bg-green-50 text-green-700' },
    { value: 'inactive', label: 'Inactive', activeClass: 'border-gray-500 bg-gray-100 text-gray-700' },
  ]

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
      if (selectedCategoryId.value !== null) query.category_id = selectedCategoryId.value

      const response = await $apiFetch<PaginatedProducts>('/products', {
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

  // Parent categories include their descendants through the ProductController
  // category filter contract.
  watch(selectedCategoryId, () => {
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
    selectedCategoryId,
    currentPage,
    totalPages,
    totalItems,
    perPage,
    statusFilters,
    showDeleteModal,
    deleting,
    loadProducts,
    goToPage,
    deleteProduct,
    confirmDelete,
  }
}
