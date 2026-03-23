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
      <!-- Root level categories -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div
          :ref="el => setSliderRef(el as HTMLElement | null, 0)"
          class="category-slider flex items-center gap-2 sm:gap-3 overflow-x-auto py-3 sm:py-4"
          @scroll="() => updateScrollArrows(0)"
        >
          <button
            @click="selectAtLevel(0, null)"
            class="whitespace-nowrap px-4 sm:px-5 py-[7px] sm:py-2 rounded-full text-[13px] font-medium transition-all duration-200 shrink-0 cursor-pointer select-none"
            :class="!selectedPath[0]
              ? 'bg-[var(--color-secondary)] text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-[var(--color-secondary-300)] hover:text-[var(--color-secondary)] hover:-translate-y-px'"
          >
            All
          </button>
          <button
            v-for="cat in categoryLevels[0]"
            :key="cat.id"
            @click="selectAtLevel(0, cat)"
            class="whitespace-nowrap px-4 sm:px-5 py-[7px] sm:py-2 rounded-full text-[13px] font-medium transition-all duration-200 shrink-0 cursor-pointer select-none"
            :class="selectedPath[0]?.id === cat.id
              ? 'bg-[var(--color-secondary)] text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-[var(--color-secondary-300)] hover:text-[var(--color-secondary)] hover:-translate-y-px'"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Scroll arrows for root -->
        <ShopScrollArrow :visible="!!sliderScrollState[0]?.left" direction="left" @scroll="scrollSlider(0, 'left')" />
        <ShopScrollArrow :visible="!!sliderScrollState[0]?.right" direction="right" @scroll="scrollSlider(0, 'right')" />
      </div>

      <!-- Subcategory levels with line connector -->
      <TransitionGroup name="sublevel">
        <div
          v-for="(level, idx) in subCategoryLevels"
          :key="'sub-' + idx + '-' + (selectedPath[idx]?.id ?? 'none')"
          class="bg-gradient-to-b from-gray-50 to-white border-t border-gray-100"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <!-- Connecting line & label -->
            <div class="flex items-center gap-2 pt-2 sm:pt-3 pb-1">
              <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] shadow-[0_0_0_3px_rgba(var(--color-secondary-rgb,99,102,241),0.15)] shrink-0" />
              <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <span class="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider shrink-0 px-1">
                {{ selectedPath[idx]?.name }}
              </span>
              <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>

            <!-- Subcategory pills -->
            <div
              :ref="el => setSliderRef(el as HTMLElement | null, idx + 1)"
              class="category-slider flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 sm:pb-4 pt-1"
              @scroll="() => updateScrollArrows(idx + 1)"
            >
              <button
                @click="selectAtLevel(idx + 1, null)"
                class="whitespace-nowrap px-3.5 sm:px-4 py-[5px] sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer select-none"
                :class="!selectedPath[idx + 1]
                  ? 'bg-[var(--color-secondary)] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-white hover:border-[var(--color-secondary-300)] hover:text-[var(--color-secondary)]'"
              >
                All {{ selectedPath[idx]?.name ?? '' }}
              </button>
              <button
                v-for="cat in level"
                :key="cat.id"
                @click="selectAtLevel(idx + 1, cat)"
                class="whitespace-nowrap px-3.5 sm:px-4 py-[5px] sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer select-none"
                :class="selectedPath[idx + 1]?.id === cat.id
                  ? 'bg-[var(--color-secondary)] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-white hover:border-[var(--color-secondary-300)] hover:text-[var(--color-secondary)]'"
              >
                {{ cat.name }}
              </button>
            </div>

            <!-- Scroll arrows for subcategory -->
            <ShopScrollArrow :visible="!!sliderScrollState[idx + 1]?.left" direction="left" small @scroll="scrollSlider(idx + 1, 'left')" />
            <ShopScrollArrow :visible="!!sliderScrollState[idx + 1]?.right" direction="right" small @scroll="scrollSlider(idx + 1, 'right')" />
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Filters -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex gap-3">

          <!-- Search -->
          <div class="flex-1 flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all bg-white">
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
            class="py-2.5 px-3.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
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
        <ShopProductSkeleton v-if="loading" />

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
    <ShopPromoBanner />

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
const sortBy = ref('newest')

// Multi-level category selection: selectedPath[0] = root selection, [1] = sub, etc.
const selectedPath = ref<(Category | null)[]>([])

// Computed: the levels of category pills to show
const categoryLevels = computed(() => {
  const levels: Category[][] = [categories.value]
  for (const selected of selectedPath.value) {
    if (!selected || !selected.children?.length) break
    levels.push(selected.children)
  }
  return levels
})

// Subcategory levels only (excludes root level)
const subCategoryLevels = computed(() => categoryLevels.value.slice(1))

// The deepest selected category ID (used for API filtering)
const activeCategoryId = computed(() => {
  for (let i = selectedPath.value.length - 1; i >= 0; i--) {
    if (selectedPath.value[i]) return selectedPath.value[i]!.id
  }
  return null
})

const selectAtLevel = (levelIndex: number, cat: Category | null) => {
  // Truncate path to this level and set selection
  const newPath = selectedPath.value.slice(0, levelIndex)
  newPath[levelIndex] = cat
  selectedPath.value = newPath
  fetchProducts()
}

// Slider refs (non-reactive — never read in template, only used in handlers)
const sliderRefs = new Map<number, HTMLElement>()
const sliderScrollState = ref<Record<number, { left: boolean; right: boolean }>>({})

const setSliderRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    sliderRefs.set(index, el)
    nextTick(() => updateScrollArrows(index))
  } else {
    sliderRefs.delete(index)
  }
}

const updateScrollArrows = (index: number) => {
  const el = sliderRefs.get(index)
  if (!el) return
  const left = el.scrollLeft > 0
  const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
  const current = sliderScrollState.value[index]
  if (current?.left === left && current?.right === right) return
  sliderScrollState.value = {
    ...sliderScrollState.value,
    [index]: { left, right },
  }
}

const scrollSlider = (index: number, direction: 'left' | 'right') => {
  const el = sliderRefs.get(index)
  if (!el) return
  el.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' })
}

const getSortParams = () => {
  switch (sortBy.value) {
    case 'price-low':  return { sort: 'price', order: 'asc' }
    case 'price-high': return { sort: 'price', order: 'desc' }
    case 'name':       return { sort: 'name', order: 'asc' }
    case 'newest':
    default:           return { sort: 'created_at', order: 'desc' }
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedPath.value = []
  sortBy.value = 'newest'
  fetchProducts()
}

function normalizeCategories(cats: any[]): Category[] {
  return (cats || []).map(c => ({
    ...c,
    id: Number(c.id),
    parent_id: c.parent_id != null ? Number(c.parent_id) : null,
    children: normalizeCategories(c.children || c.children_recursive || []),
  }))
}

const fetchCategories = async () => {
  try {
    const response = await $apiFetch<CategoriesResponse>('/categories', { method: 'GET' })
    if (response?.data) {
      categories.value = normalizeCategories(response.data)
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

    if (activeCategoryId.value) queryParams.category_id = activeCategoryId.value
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
    nextTick(() => {
      for (const idx of sliderRefs.keys()) {
        updateScrollArrows(idx)
      }
    })
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
/* Hidden scrollbar for category sliders */
.category-slider {
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
.category-slider::-webkit-scrollbar {
  display: none;
}

/* Sublevel transition */
.sublevel-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.sublevel-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.sublevel-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.sublevel-enter-to {
  opacity: 1;
  max-height: 120px;
  transform: translateY(0);
}
.sublevel-leave-from {
  opacity: 1;
  max-height: 120px;
  transform: translateY(0);
}
.sublevel-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
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
</style>
