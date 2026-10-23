import type { PaginatedPosts, Post, PostDetail } from '~/types/post'
import { getPaginationItems } from '~/utils/pagination'

export function usePosts() {
  const { $apiFetch } = useNuxtApp()

  const posts = ref<Post[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const perPage = 12

  const visiblePages = computed(() => getPaginationItems(currentPage.value, totalPages.value))

  const loadPosts = async () => {
    loading.value = true
    error.value = null

    try {
      const query: Record<string, string | number> = {
        sort: 'newest',
        page: currentPage.value,
        per_page: perPage,
      }

      if (selectedCategory.value) query.category = selectedCategory.value
      const q = searchQuery.value.trim()
      if (q) query.search = q

      const response = await $apiFetch<PaginatedPosts>('/posts', {
        method: 'GET',
        query,
      })

      if (response?.data) {
        posts.value = response.data
        currentPage.value = response.current_page ?? 1
        totalPages.value = response.last_page ?? 1
        totalItems.value = response.total ?? 0
      }
    } catch (err: any) {
      console.error('Error loading posts:', err)
      error.value = err?.data?.message || 'Failed to load posts'
    } finally {
      loading.value = false
    }
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    loadPosts()
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  watch(selectedCategory, () => {
    currentPage.value = 1
    loadPosts()
  })

  let searchTimer: ReturnType<typeof setTimeout>
  watch(searchQuery, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      currentPage.value = 1
      loadPosts()
    }, 400)
  })

  return {
    posts,
    loading,
    error,
    searchQuery,
    selectedCategory,
    currentPage,
    totalPages,
    totalItems,
    perPage,
    visiblePages,
    loadPosts,
    goToPage,
  }
}

/** Fetch a single post (with related) by slug. */
export async function fetchPostBySlug(slug: string): Promise<{ data: PostDetail; related: Post[] } | null> {
  const { $apiFetch } = useNuxtApp()
  try {
    return await $apiFetch<{ data: PostDetail; related: Post[] }>(`/posts/${slug}`)
  } catch {
    return null
  }
}

/** Fetch featured posts for the landing hero strip. */
export async function fetchFeaturedPosts(limit = 3): Promise<Post[]> {
  const { $apiFetch } = useNuxtApp()
  try {
    const res = await $apiFetch<{ data: Post[] }>('/posts', {
      query: { featured: 1, limit },
    })
    return res.data ?? []
  } catch {
    return []
  }
}
