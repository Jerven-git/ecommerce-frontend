<template>
  <div class="min-h-screen flex flex-col">

    <!-- Page Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Store</p>
        <h1 class="text-3xl font-bold text-gray-900">Shop All Products</h1>
        <p class="text-sm text-gray-500 mt-1">Browse our full collection of quality items</p>
      </div>
    </div>

    <!-- Category Slider -->
    <div v-if="categories.length" class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <!-- Left arrow -->
        <Transition name="arrow-fade">
          <button
            v-if="canScrollLeft"
            @click="scrollSlider('left')"
            class="slider-arrow left-3"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </Transition>

        <!-- Parent category pills -->
        <div
          ref="sliderRef"
          class="category-slider flex items-center gap-2 py-4 overflow-x-auto"
          @scroll="updateScrollArrows"
        >
          <button
            @click="selectParent(null)"
            class="category-pill"
            :class="!selectedParentId ? 'category-pill-active' : 'category-pill-inactive'"
          >
            All
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectParent(cat.id)"
            class="category-pill"
            :class="selectedParentId === cat.id ? 'category-pill-active' : 'category-pill-inactive'"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Right arrow -->
        <Transition name="arrow-fade">
          <button
            v-if="canScrollRight"
            @click="scrollSlider('right')"
            class="slider-arrow right-3"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Transition>
      </div>

      <!-- Subcategory pills (shown when parent has children) -->
      <div v-if="activeSubcategories.length" class="border-t border-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-2 py-3 overflow-x-auto category-slider">
            <button
              @click="selectSub(null)"
              class="category-pill text-xs"
              :class="!selectedSubId ? 'category-pill-active' : 'category-pill-inactive'"
            >
              All {{ selectedParentName }}
            </button>
            <button
              v-for="sub in activeSubcategories"
              :key="sub.id"
              @click="selectSub(sub.id)"
              class="category-pill text-xs"
              :class="selectedSubId === sub.id ? 'category-pill-active' : 'category-pill-inactive'"
            >
              {{ sub.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex gap-3">

          <!-- Search -->
          <div class="flex-1 flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all bg-white">
            <span class="flex items-center pl-3.5 pr-2 text-gray-400 shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="flex-1 py-2.5 pr-3.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
              @input="debouncedFetch"
            />
          </div>

          <!-- Sort -->
          <select
            v-model="sortBy"
            class="py-2.5 px-3.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            @change="fetchProducts"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        <!-- Skeleton -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div class="h-48 bg-gray-100"></div>
            <div class="p-4 space-y-3">
              <div class="h-4 bg-gray-100 rounded-lg w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded-lg w-full"></div>
              <div class="h-3 bg-gray-100 rounded-lg w-2/3"></div>
              <div class="flex items-center justify-between mt-2">
                <div class="h-5 bg-gray-100 rounded-lg w-16"></div>
                <div class="h-8 bg-gray-100 rounded-lg w-24"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center max-w-sm mx-auto mt-8">
          <div class="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-red-600 mb-4">{{ error }}</p>
          <button @click="fetchProducts" class="btn-primary">Retry</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="products.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-sm mx-auto mt-8">
          <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-900 mb-1">No products found</p>
          <p class="text-sm text-gray-400 mb-5">Try adjusting your search or filter to find what you're looking for.</p>
          <button @click="clearFilters" class="btn-secondary">Clear Filters</button>
        </div>

        <!-- Product Grid with stagger -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="(product, index) in products"
            :key="product.id"
            class="card-stagger"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </div>

    <!-- Promo Banner -->
    <section class="relative overflow-hidden text-white py-16" :style="{ background: `linear-gradient(135deg, var(--color-secondary), var(--color-primary), var(--color-primary-400))` }">
      <!-- Floating orbs -->
      <div class="orb orb-1" />
      <div class="orb orb-2" />
      <div class="orb orb-3" />

      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-block bg-white/20 backdrop-blur-sm text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
          Members get more
        </span>
        <h2 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          New arrivals<br />every single week.
        </h2>
        <p class="text-base text-white/75 mb-8 max-w-lg mx-auto">
          Stay ahead of the trend. Fresh drops, exclusive deals, and hand-picked collections — updated weekly just for you.
        </p>

        <div class="flex flex-wrap justify-center gap-3 mb-10">
          <div class="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-medium">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Free Shipping
          </div>
          <div class="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-medium">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Easy Returns
          </div>
          <div class="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-medium">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Checkout
          </div>
        </div>

        <NuxtLink
          to="/shop"
          class="inline-flex items-center gap-2 bg-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
          :style="{ color: 'var(--color-primary-700)' }"
        >
          Shop New Arrivals
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  category: string
  category_id: number | null
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
  parent_id: number | null
  sort_order: number
  children: Category[]
}

interface ProductsResponse {
  data: Product[]
}

interface CategoriesResponse {
  data: Category[]
}

const { $apiFetch } = useNuxtApp()

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedParentId = ref<number | null>(null)
const selectedSubId = ref<number | null>(null)
const sortBy = ref('newest')

// Category slider refs
const sliderRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// Computed: subcategories for selected parent
const activeSubcategories = computed(() => {
  if (!selectedParentId.value) return []
  const parent = categories.value.find(c => c.id === selectedParentId.value)
  return parent?.children ?? []
})

// Computed: selected parent name for "All X" pill
const selectedParentName = computed(() => {
  if (!selectedParentId.value) return ''
  return categories.value.find(c => c.id === selectedParentId.value)?.name ?? ''
})

const getSortParams = () => {
  switch (sortBy.value) {
    case 'price-low':  return { sort: 'price', order: 'asc' }
    case 'price-high': return { sort: 'price', order: 'desc' }
    case 'name':       return { sort: 'name', order: 'asc' }
    case 'newest':
    default:           return { sort: 'created_at', order: 'desc' }
  }
}

const selectParent = (id: number | null) => {
  selectedParentId.value = id
  selectedSubId.value = null
  fetchProducts()
}

const selectSub = (id: number | null) => {
  selectedSubId.value = id
  fetchProducts()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedParentId.value = null
  selectedSubId.value = null
  sortBy.value = 'newest'
  fetchProducts()
}

// Slider scroll helpers
const updateScrollArrows = () => {
  const el = sliderRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

const scrollSlider = (direction: 'left' | 'right') => {
  const el = sliderRef.value
  if (!el) return
  el.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' })
}

const fetchCategories = async () => {
  try {
    const response = await $apiFetch<CategoriesResponse>('/categories', { method: 'GET' })
    if (response?.data) {
      categories.value = response.data
    }
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

const fetchProducts = async () => {
  loading.value = true
  error.value = null

  try {
    const sortParams = getSortParams()
    const queryParams: Record<string, any> = { is_active: 1, ...sortParams }

    // Use the most specific selection: subcategory > parent category
    const activeCategoryId = selectedSubId.value ?? selectedParentId.value
    if (activeCategoryId) queryParams.category_id = activeCategoryId
    if (searchQuery.value) queryParams.search = searchQuery.value

    const response = await $apiFetch<ProductsResponse>('/products', {
      method: 'GET',
      query: queryParams
    })

    if (response?.data) {
      products.value = response.data
    }
  } catch (err: any) {
    console.error('Error fetching products:', err)
    error.value = err?.data?.message || 'Failed to load products. Please try again.'
  } finally {
    loading.value = false
    nextTick(updateScrollArrows)
  }
}

let debounceTimer: ReturnType<typeof setTimeout>
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchProducts, 500)
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
/* Category slider */
.category-slider {
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}
.category-slider::-webkit-scrollbar {
  display: none;
}

.category-pill {
  white-space: nowrap;
  padding: 6px 18px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;
  cursor: pointer;
}

.category-pill-active {
  background-color: var(--color-secondary);
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.category-pill-inactive {
  background-color: #fff;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}
.category-pill-inactive:hover {
  border-color: var(--color-secondary-300);
  color: var(--color-secondary);
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}
.slider-arrow:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  color: #374151;
}

.arrow-fade-enter-active,
.arrow-fade-leave-active {
  transition: opacity 0.2s ease;
}
.arrow-fade-enter-from,
.arrow-fade-leave-to {
  opacity: 0;
}

/* Product card stagger fade-up */
.card-stagger {
  opacity: 0;
  animation: card-fade-up 0.45s ease forwards;
}

@keyframes card-fade-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Promo banner floating orbs */
.orb {
  position: absolute;
  border-radius: 9999px;
  opacity: 0.15;
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 280px;
  height: 280px;
  background: white;
  top: -80px;
  left: -60px;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  background: white;
  bottom: -60px;
  right: 10%;
  animation-delay: 2s;
}

.orb-3 {
  width: 140px;
  height: 140px;
  background: white;
  top: 30%;
  right: -40px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50%       { transform: translateY(-18px) scale(1.04); }
}
</style>
