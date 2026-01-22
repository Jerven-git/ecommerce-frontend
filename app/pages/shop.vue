<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-4xl font-bold mb-8">Shop All Products</h1>

    <div class="mb-8 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="input-field"
          @input="debouncedFetch"
        />
      </div>

      <select v-model="selectedCategory" class="input-field max-w-xs" @change="fetchProducts">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>

      <select v-model="sortBy" class="input-field max-w-xs" @change="fetchProducts">
        <option value="newest">Newest First</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="name">Name: A to Z</option>
      </select>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-500">
      <p class="mb-4">{{ error }}</p>
      <button @click="fetchProducts" class="btn-primary">Retry</button>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">No products found matching your criteria.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
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
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ProductsResponse {
  data: Product[]
}

const { $apiFetch } = useNuxtApp()

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('newest')

// Get unique categories from products
const categories = computed(() => {
  const cats = products.value.map(p => p.category)
  return [...new Set(cats)].filter(Boolean)
})

// Get sort parameters based on selection
const getSortParams = () => {
  switch (sortBy.value) {
    case 'price-low':
      return { sort: 'price', order: 'asc' }
    case 'price-high':
      return { sort: 'price', order: 'desc' }
    case 'name':
      return { sort: 'name', order: 'asc' }
    case 'newest':
    default:
      return { sort: 'created_at', order: 'desc' }
  }
}

const fetchProducts = async () => {
  loading.value = true
  error.value = null

  try {
    const sortParams = getSortParams()
    const queryParams: any = {
      is_active: 1,
      ...sortParams
    }

    // Add category filter if selected
    if (selectedCategory.value) {
      queryParams.category = selectedCategory.value
    }

    // Add search query if provided
    if (searchQuery.value) {
      queryParams.search = searchQuery.value
    }

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
  }
}

// Debounce search input
let debounceTimer: NodeJS.Timeout
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchProducts()
  }, 500)
}

onMounted(() => {
  fetchProducts()
})
</script>