<template>
  <div class="min-h-screen flex flex-col bg-gray-50">

    <!-- Hero -->
    <section class="relative overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0" :style="fallbackHeroStyle">
        <img
          v-if="heroImage"
          :src="heroImage"
          :alt="coverAltText || heroHeading"
          class="w-full h-full object-cover transition-opacity duration-500"
          :class="heroLoaded ? 'opacity-100' : 'opacity-0'"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          @load="heroLoaded = true"
          @error="heroLoaded = true"
        />
        <div
          v-if="heroImage"
          class="absolute inset-0"
          :style="{
            backgroundColor: overlayColor,
            opacity: overlayOpacity / 100,
          }"
        />
      </div>

      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        <p
          class="hero-stagger text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-white/80"
          style="animation-delay: 0.1s"
        >
          {{ heroLabel }}
        </p>
        <h1
          class="hero-stagger text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl mx-auto text-white"
          style="animation-delay: 0.25s"
        >
          {{ heroHeading }}
        </h1>
        <p
          v-if="heroSubtitle"
          class="hero-stagger text-sm sm:text-base mt-4 max-w-2xl mx-auto text-white/80"
          style="animation-delay: 0.4s"
        >
          {{ heroSubtitle }}
        </p>
      </div>
    </section>

    <!-- Read by category -->
    <section v-if="categories.length" class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Read by category</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CategoryTile
            v-for="cat in categories"
            :key="cat.id"
            :category="cat"
            :active="selectedCategory === cat.slug"
            @select="onCategorySelect"
          />
        </div>
      </div>
    </section>

    <!-- Featured -->
    <section v-if="featuredPosts.length && !selectedCategory && !searchQuery" class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-5">Featured blogs</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PostCard v-for="post in featuredPosts" :key="post.id" :post="post" />
        </div>
      </div>
    </section>

    <!-- Recent posts -->
    <section class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              {{ selectedCategory ? currentCategoryName : 'Recent posts' }}
            </p>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
              {{ selectedCategory ? `Posts in ${currentCategoryName}` : 'Latest from the blog' }}
            </h2>
          </div>

          <!-- Search -->
          <div class="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all bg-white w-full sm:w-72">
            <span class="flex items-center pl-3.5 pr-2 text-gray-400 shrink-0">
              <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search posts..."
              class="flex-1 py-2.5 pr-3.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <!-- Filter clear -->
        <div v-if="selectedCategory" class="mb-6">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
            @click="selectedCategory = null"
          >
            <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
            Clear filter
          </button>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="aspect-[16/9] rounded-2xl bg-gray-200 mb-3" />
            <div class="h-3 bg-gray-200 rounded w-1/3 mb-2" />
            <div class="h-4 bg-gray-200 rounded w-5/6 mb-1.5" />
            <div class="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center max-w-sm mx-auto">
          <p class="text-sm font-medium text-red-600 mb-4">{{ error }}</p>
          <button @click="loadPosts" class="btn-primary">Retry</button>
        </div>

        <!-- Empty -->
        <div v-else-if="!posts.length" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-md mx-auto">
          <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Icon name="heroicons:document-text" class="w-7 h-7 text-gray-300" />
          </div>
          <p class="text-sm font-semibold text-gray-900 mb-1">No posts yet</p>
          <p class="text-sm text-gray-400">Check back soon — new posts are on the way.</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <template v-for="(post, idx) in posts" :key="post.id">
            <div class="card-stagger" :style="{ animationDelay: `${idx * 50}ms` }">
              <PostCard :post="post" />
            </div>
            <!-- CTA interstitial after row 2 (index 5) when CTA configured and on first page -->
            <div
              v-if="cta && currentPage === 1 && idx === 5"
              class="card-stagger sm:col-span-2 lg:col-span-3"
              :style="{ animationDelay: `${idx * 50}ms` }"
            >
              <div class="rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 shadow-sm">
                <div class="max-w-xl">
                  <h3 class="text-xl sm:text-2xl font-bold mb-1.5">{{ cta.heading }}</h3>
                  <p v-if="cta.subtitle" class="text-sm text-white/90">{{ cta.subtitle }}</p>
                </div>
                <NuxtLink
                  v-if="cta.button_link"
                  :to="cta.button_link"
                  class="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  {{ cta.button_label || 'Learn more' }}
                </NuxtLink>
              </div>
            </div>
          </template>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1.5 mt-10">
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
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types/post'

const { siteConfig } = useSiteConfig()
const {
  posts,
  loading,
  error,
  searchQuery,
  selectedCategory,
  currentPage,
  totalPages,
  visiblePages,
  loadPosts,
  goToPage,
} = usePosts()

const { categories, loadCategories } = usePostCategories()
const featuredPosts = ref<Post[]>([])
const heroLoaded = ref(false)

const heroLabel = computed(() => siteConfig.value?.blog_page?.header?.label || 'Blog')
const heroHeading = computed(() =>
  siteConfig.value?.blog_page?.header?.heading || 'Insights, stories and updates',
)
const heroSubtitle = computed(() => siteConfig.value?.blog_page?.header?.subtitle || '')
const heroImage = computed(() => siteConfig.value?.blog_image_url || null)
const overlayColor = computed(() => siteConfig.value?.blog_overlay_color || '#000000')
const overlayOpacity = computed(() => siteConfig.value?.blog_overlay_opacity ?? 40)

const fallbackHeroStyle = computed(() => ({
  backgroundImage: `linear-gradient(135deg, ${siteConfig.value?.theme?.primary_color || '#6898ED'}, ${
    siteConfig.value?.theme?.secondary_color || '#4B5979'
  })`,
}))
const cta = computed(() => siteConfig.value?.blog_page?.cta || null)

const currentCategoryName = computed(() => {
  if (!selectedCategory.value) return ''
  return categories.value.find(c => c.slug === selectedCategory.value)?.name || ''
})

function onCategorySelect(slug: string) {
  selectedCategory.value = selectedCategory.value === slug ? null : slug
}

onMounted(async () => {
  await Promise.all([
    loadPosts(),
    loadCategories(),
    fetchFeaturedPosts(3).then(p => { featuredPosts.value = p }),
  ])
})

useStaticPageSeo('blog', {
  title: `${siteConfig.value?.blog_page?.header?.label || 'Blog'} – ${siteConfig.value?.site_name || ''}`,
  description: siteConfig.value?.blog_page?.header?.subtitle || '',
})

const coverAltText = computed(() => siteConfig.value?.pages_seo?.blog?.cover_alt_text ?? '')
</script>

<style scoped>
.hero-stagger {
  opacity: 0;
  animation: hero-fade-up 0.7s ease forwards;
}

@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-stagger {
  opacity: 0;
  animation: card-fade-up 0.45s ease forwards;
}

@keyframes card-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
