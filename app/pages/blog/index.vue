<template>
  <div class="min-h-screen flex flex-col bg-gray-50">

    <!-- Hero -->
    <section class="relative isolate flex min-h-[52vh] overflow-hidden">
      <!-- Media / rich theme gradient fallback -->
      <img
        v-if="heroImage"
        :src="heroImage"
        :alt="coverAltText || heroHeading"
        class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        :class="heroLoaded ? 'opacity-100' : 'opacity-0'"
        loading="eager"
        fetchpriority="high"
        decoding="async"
        @load="heroLoaded = true"
        @error="heroLoaded = true"
      />
      <template v-else>
        <div class="hero-media-gradient absolute inset-0" aria-hidden="true" />
        <div class="hero-media-grain absolute inset-0" aria-hidden="true" />
      </template>

      <!-- Admin overlay (over image only) -->
      <div
        v-if="heroImage"
        class="absolute inset-0"
        :style="{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }"
      />
      <!-- Legibility gradient for the lower-left copy -->
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />

      <div class="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <p
            v-if="heroLabel"
            class="hero-stagger mb-3 text-sm font-medium text-white/70"
            style="animation-delay: 0.1s"
          >
            {{ heroLabel }}
          </p>
          <h1
            class="hero-stagger display-1 font-bold leading-tight text-white text-balance drop-shadow-sm"
            style="animation-delay: 0.25s"
          >
            {{ heroHeading }}
          </h1>
          <p
            v-if="heroSubtitle"
            class="hero-stagger mt-5 max-w-xl text-lg text-white/85"
            style="animation-delay: 0.4s"
          >
            {{ heroSubtitle }}
          </p>
        </div>
      </div>
    </section>

    <!-- Read by category -->
    <section v-if="categories.length" class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 class="display-2 font-bold text-gray-900 mb-6">Browse by category</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(cat, idx) in categories"
            :key="cat.id"
            class="category-stagger"
            :style="{ animationDelay: `${idx * 100}ms` }"
          >
            <CategoryTile
              :category="cat"
              :active="selectedCategory === cat.slug"
              @select="onCategorySelect"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Featured -->
    <section v-if="featuredPosts.length && !selectedCategory && !searchQuery" class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex items-end justify-between gap-4 border-b border-gray-200 pb-5 mb-8">
          <h2 class="display-2 font-bold text-gray-900">Featured</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          <PostCard v-for="post in featuredPosts" :key="post.id" :post="post" />
        </div>
      </div>
    </section>

    <!-- Recent posts -->
    <section class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <h2 class="display-2 font-bold text-gray-900">
            {{ selectedCategory ? `Posts in ${currentCategoryName}` : 'Latest from the blog' }}
          </h2>

          <!-- Search -->
          <div class="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all bg-white w-full sm:w-72">
            <span class="flex items-center pl-3.5 pr-2 text-gray-400 shrink-0">
              <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search posts…"
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
        <div v-else-if="error" class="flex flex-col items-center py-20 text-center">
          <svg class="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="mt-4 max-w-xs font-medium text-red-600">{{ error }}</p>
          <button @click="loadPosts" class="btn-primary mt-6">Retry</button>
        </div>

        <!-- Empty -->
        <div v-else-if="!posts.length" class="flex flex-col items-center py-20 text-center">
          <Icon name="heroicons:document-text" class="h-11 w-11 text-gray-300" />
          <p class="mt-4 text-lg font-semibold text-gray-900">No posts yet</p>
          <p class="mt-1 max-w-xs text-gray-500">Check back soon — new posts are on the way.</p>
        </div>

        <!-- Grid -->
        <div v-else :key="`grid-${animationKey}`" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <template v-for="(post, idx) in posts" :key="post.id">
            <div
              :ref="el => observeCard(el as Element | null)"
              class="card-stagger"
              :style="{ animationDelay: `${(idx % 3) * 100}ms` }"
            >
              <PostCard :post="post" />
            </div>
            <!-- CTA interstitial after row 2 (index 5) when CTA configured and on first page -->
            <div
              v-if="cta && currentPage === 1 && idx === 5"
              :ref="el => observeCard(el as Element | null)"
              class="card-stagger sm:col-span-2 lg:col-span-3"
            >
              <div class="relative overflow-hidden rounded-2xl bg-secondary-900 text-white p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div
                  class="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                  :style="{ background: 'radial-gradient(80% 140% at 15% -10%, color-mix(in srgb, var(--color-primary) 40%, transparent), transparent 60%)' }"
                />
                <div class="relative max-w-xl">
                  <h3 class="text-2xl font-bold mb-1.5">{{ cta.heading }}</h3>
                  <p v-if="cta.subtitle" class="text-white/70">{{ cta.subtitle }}</p>
                </div>
                <NuxtLink
                  v-if="cta.button_link"
                  :to="cta.button_link"
                  class="relative shrink-0 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
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
            :class="page === currentPage ? 'bg-primary-600' : 'text-gray-600 hover:text-gray-900 hover:bg-white'"
            :style="page === currentPage ? { color: 'var(--on-primary, #fff)' } : {}"
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
const animationKey = ref(0)

watch([currentPage, selectedCategory, searchQuery], () => {
  animationKey.value++
})

let cardObserver: IntersectionObserver | null = null

function observeCard(el: Element | null) {
  if (el && cardObserver) {
    cardObserver.observe(el)
  }
}

onMounted(() => {
  if (typeof IntersectionObserver !== 'undefined') {
    cardObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            cardObserver?.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )
  }
})

onUnmounted(() => {
  cardObserver?.disconnect()
  cardObserver = null
})

const heroLabel = computed(() => siteConfig.value?.blog_page?.header?.label || 'Blog')
const heroHeading = computed(() =>
  siteConfig.value?.blog_page?.header?.heading || 'Insights, stories and updates',
)
const heroSubtitle = computed(() => siteConfig.value?.blog_page?.header?.subtitle || '')
const heroImage = computed(() => siteConfig.value?.blog_image_url || null)
const overlayColor = computed(() => siteConfig.value?.blog_overlay_color || '#000000')
const overlayOpacity = computed(() => siteConfig.value?.blog_overlay_opacity ?? 40)
const cta = computed(() => siteConfig.value?.blog_page?.cta || null)

const currentCategoryName = computed(() => {
  if (!selectedCategory.value) return ''
  return categories.value.find(c => c.slug === selectedCategory.value)?.name || ''
})

function onCategorySelect(slug: string) {
  selectedCategory.value = selectedCategory.value === slug ? null : slug
}

onMounted(async () => {
  animationKey.value++
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
  transform: translateY(24px) scale(0.94);
}

.card-stagger.is-visible {
  animation: card-pop-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes card-pop-up {
  from { opacity: 0; transform: translateY(24px) scale(0.94); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.category-stagger {
  opacity: 0;
  animation: category-slide-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes category-slide-in {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .card-stagger,
  .card-stagger.is-visible,
  .category-stagger,
  .hero-stagger {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
