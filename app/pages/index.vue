<template>
  <div>
    <section class="relative h-[600px] flex items-center justify-center text-white" :style="heroStyle">
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="relative z-10 text-center px-4 max-w-4xl">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">{{ siteConfig?.hero_title || 'Welcome to Our Store' }}</h1>
        <p class="text-xl md:text-2xl mb-8">{{ siteConfig?.hero_subtitle || 'Discover amazing products' }}</p>
        <NuxtLink to="/shop" class="btn-primary inline-block text-lg">
          Shop Now
        </NuxtLink>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-3xl font-bold text-center mb-12">Featured Products</h2>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-500">
        <p>{{ error }}</p>
      </div>

      <div v-else-if="products.length === 0" class="text-center py-12 text-gray-500">
        <p>No products available at the moment.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>

      <div class="text-center mt-12">
        <NuxtLink to="/shop" class="btn-secondary">
          View All Products
        </NuxtLink>
      </div>
    </section>

    <section class="bg-gray-100 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="p-6">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" :style="{ backgroundColor: siteConfig?.primary_color || '#2563eb' }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Quality Products</h3>
            <p class="text-gray-600">Carefully curated selection of premium items</p>
          </div>

          <div class="p-6">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" :style="{ backgroundColor: siteConfig?.primary_color || '#2563eb' }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Best Prices</h3>
            <p class="text-gray-600">Competitive pricing on all our products</p>
          </div>

          <div class="p-6">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" :style="{ backgroundColor: siteConfig?.primary_color || '#2563eb' }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p class="text-gray-600">Quick and reliable shipping to your doorstep</p>
          </div>
        </div>
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
  is_active: boolean
  created_at: string
  updated_at: string
}

interface SiteConfig {
  id: number
  hero_title: string
  hero_subtitle: string
  primary_color: string
  secondary_color: string
}

interface ProductsResponse {
  data: Product[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface SiteConfigResponse {
  data: SiteConfig
}

const { $apiFetch } = useNuxtApp()

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const siteConfig = ref<SiteConfig | null>(null)

const heroStyle = computed(() => ({
  background: `linear-gradient(135deg, ${siteConfig.value?.primary_color || '#2563eb'}, ${siteConfig.value?.secondary_color || '#10b981'})`
}))

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch products and site config in parallel
    const [productsResponse, configResponse] = await Promise.all([
      $apiFetch<ProductsResponse>('/products', {
        method: 'GET',
        query: {
          is_active: 1,
          limit: 8,
          sort: 'created_at',
          order: 'desc'
        }
      }),
      $apiFetch<SiteConfigResponse>('/site-config', {
        method: 'GET'
      }).catch(() => null)
    ])

    if (productsResponse?.data) {
      products.value = productsResponse.data
    }

    if (configResponse?.data) {
      siteConfig.value = configResponse.data
    }
  } catch (err: any) {
    console.error('Error fetching data:', err)
    error.value = err?.data?.message || 'Failed to load products. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>