<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">Blog Posts</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <p class="text-gray-500 text-sm mt-1">Write and publish articles for the public blog</p>
      </div>
      <NuxtLink
        data-guide="add-post-btn"
        to="/admin/posts/new"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shrink-0"
      >
        <Icon name="heroicons:plus" class="w-4 h-4" />
        New Post
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div data-guide="post-filters" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 flex items-center rounded-lg border border-gray-200 overflow-hidden focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20 bg-white">
          <span class="pl-3 text-gray-400 shrink-0">
            <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title or excerpt…"
            class="flex-1 py-2 pr-3 pl-2 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
          />
        </div>

        <select
          v-model="statusFilter"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>

        <select
          v-model="categoryFilter"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
        >
          <option value="">All categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="String(cat.id)">{{ cat.name }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-3">
      <div v-for="i in 5" :key="i" class="h-16 bg-gray-100 rounded-xl"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <p class="text-sm font-medium text-red-600 mb-4">{{ error }}</p>
      <button @click="load" class="btn-primary">Retry</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!posts.length" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon name="heroicons:document-text" class="w-7 h-7 text-gray-400" />
      </div>
      <p class="font-semibold text-gray-700 mb-1">No posts yet</p>
      <p class="text-sm text-gray-400 mb-6">Create your first blog post to get started</p>
      <NuxtLink to="/admin/posts/new" class="btn-primary">New Post</NuxtLink>
    </div>

    <!-- Table -->
    <div v-else data-guide="post-table" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Post</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Published</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="post in posts"
            :key="post.id"
            class="hover:bg-gray-50/50 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-12 h-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                  <img v-if="post.cover_image_url" :src="post.cover_image_url" :alt="post.title" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <Icon name="heroicons:photo" class="w-5 h-5 text-gray-300" />
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ post.title }}</p>
                  <p class="text-xs text-gray-400 truncate font-mono">/{{ post.slug }}</p>
                </div>
                <Icon
                  v-if="post.is_featured"
                  name="heroicons:star"
                  class="w-4 h-4 text-amber-400 shrink-0"
                  title="Featured"
                />
              </div>
            </td>

            <td class="px-4 py-3 hidden md:table-cell">
              <span
                v-if="post.category"
                class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-white"
                :style="{ background: `linear-gradient(135deg, ${post.category.gradient_from}, ${post.category.gradient_to})` }"
              >
                {{ post.category.name }}
              </span>
              <span v-else class="text-xs text-gray-400">—</span>
            </td>

            <td class="px-4 py-3 hidden sm:table-cell">
              <span
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                :class="post.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="post.is_published ? 'bg-green-500' : 'bg-gray-400'"></span>
                {{ post.is_published ? 'Published' : 'Draft' }}
              </span>
            </td>

            <td class="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">
              {{ post.published_at ? formatPostDate(post.published_at) : '—' }}
            </td>

            <td class="px-4 py-3 text-right">
              <div class="inline-flex items-center gap-1">
                <NuxtLink
                  :to="`/admin/posts/${post.id}`"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Edit
                </NuxtLink>
                <button
                  type="button"
                  @click="deleteTarget = post"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <nav v-if="!loading && !error && totalPages > 1" class="flex items-center justify-center gap-1.5 mt-6">
      <button
        type="button"
        class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        Prev
      </button>
      <button
        v-for="(page, i) in visiblePages"
        :key="i"
        type="button"
        class="min-w-[36px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="page === currentPage ? 'bg-primary-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-white'"
        :disabled="typeof page !== 'number'"
        @click="typeof page === 'number' && goToPage(page)"
      >
        {{ page }}
      </button>
      <button
        type="button"
        class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        Next
      </button>
    </nav>

    <!-- Delete confirm -->
    <ConfirmDeleteModal
      :open="!!deleteTarget"
      title="Delete Post"
      :message="`Are you sure you want to delete &quot;${deleteTarget?.title}&quot;? This cannot be undone.`"
      :deleting="deleting"
      @confirm="executeDelete"
      @cancel="deleteTarget = null"
    />

    <AdminToast />
  </div>
</template>

<script setup lang="ts">
import type { PaginatedPosts, Post, PostCategory } from '~/types/post'
import { formatPostDate } from '~/utils/formatPostDate'

definePageMeta({ middleware: 'auth' })

const { $apiFetch } = useNuxtApp()
const { showToast } = useAdminToast()

const posts = ref<Post[]>([])
const categories = ref<PostCategory[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const searchQuery = ref('')
const statusFilter = ref<'all' | 'published' | 'draft'>('all')
const categoryFilter = ref('')

const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 15

const deleteTarget = ref<Post | null>(null)
const deleting = ref(false)

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const query: Record<string, string | number> = {
      page: currentPage.value,
      per_page: perPage,
      sort: 'created_at',
      order: 'desc',
    }
    if (statusFilter.value === 'published') query.is_published = 1
    else if (statusFilter.value === 'draft') query.is_published = 0
    if (categoryFilter.value) query.category_id = categoryFilter.value
    if (searchQuery.value.trim()) query.search = searchQuery.value.trim()

    const res = await $apiFetch<PaginatedPosts>('/admin/posts', { query })
    posts.value = res.data ?? []
    totalPages.value = res.last_page ?? 1
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to load posts'
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const res = await $apiFetch<{ data: PostCategory[] }>('/post-categories')
    categories.value = res.data ?? []
  } catch {}
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  load()
}

async function executeDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await $apiFetch(`/admin/posts/${deleteTarget.value.id}`, { method: 'DELETE' })
    showToast('Post deleted', 'success')
    deleteTarget.value = null
    await load()
  } catch (err: any) {
    showToast(err?.data?.message || 'Failed to delete post', 'error')
  } finally {
    deleting.value = false
  }
}

watch([statusFilter, categoryFilter], () => {
  currentPage.value = 1
  load()
})

let searchTimer: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    load()
  }, 400)
})

onMounted(() => {
  load()
  loadCategories()
})
</script>
