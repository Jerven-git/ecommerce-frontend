<template>
  <div>
    <!-- Hero Section -->
    <section class="relative h-[600px] flex items-center justify-center text-white overflow-hidden" :style="heroStyle">
      <!-- Slide progress bar while hero image loads -->
      <Transition name="fade">
        <div v-if="imageLoading" class="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden z-20">
          <div class="slide-bar h-full" />
        </div>
      </Transition>

      <!-- Dark scrim fades in once image is ready -->
      <Transition name="fade">
        <div v-if="imageLoaded || !siteConfig?.hero_image_url" class="absolute inset-0 bg-black/45" />
      </Transition>

      <!-- Hero text slides up on mount -->
      <Transition name="hero-up" appear>
        <div class="relative z-10 text-center px-6 max-w-3xl">
          <h1 class="text-5xl md:text-6xl font-bold mb-5 leading-tight drop-shadow-lg">
            {{ siteConfig?.hero_title || 'Welcome to Our Store' }}
          </h1>
          <p class="text-lg md:text-xl mb-10 text-white/85 drop-shadow max-w-xl mx-auto">
            {{ siteConfig?.hero_subtitle || 'Discover amazing products' }}
          </p>
          <div class="flex items-center justify-center gap-3 flex-wrap">
            <NuxtLink
              to="/shop"
              class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold bg-white text-gray-900 hover:bg-gray-50 shadow-lg hover:scale-105 transition-all duration-200"
            >
              Shop Now
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </section>

    <!-- Featured Products -->
    <section class="bg-gray-50 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <p
            class="text-xs font-semibold uppercase tracking-widest mb-2"
            :style="{ color: siteConfig?.primary_color || '#6898ED' }"
          >New Arrivals</p>
          <h2 class="text-3xl font-bold text-gray-900">Featured Products</h2>
          <div class="mt-3 mx-auto w-12 h-1 rounded-full" :style="{ backgroundColor: siteConfig?.primary_color || '#6898ED' }"></div>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div class="h-48 bg-gray-100"></div>
            <div class="p-4 space-y-3">
              <div class="h-4 bg-gray-100 rounded-lg w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded-lg w-full"></div>
              <div class="h-3 bg-gray-100 rounded-lg w-2/3"></div>
              <div class="h-8 bg-gray-100 rounded-lg mt-2"></div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center max-w-sm mx-auto">
          <div class="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-red-600">{{ error }}</p>
        </div>

        <!-- Empty -->
        <div v-else-if="products.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-sm mx-auto">
          <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-sm text-gray-400">No products available at the moment.</p>
        </div>

        <!-- Products with stagger fade-up -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(product, index) in products"
            :key="product.id"
            class="card-stagger"
            :style="{ animationDelay: `${index * 60}ms` }"
          >
            <ProductCard :product="product" />
          </div>
        </div>

        <div class="text-center mt-12">
          <NuxtLink to="/shop" class="btn-secondary inline-flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            View All Products
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-20 bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-widest mb-2" :style="{ color: siteConfig?.primary_color || '#6898ED' }">Simple & Easy</p>
        <h2 class="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
        <p class="text-gray-500 text-sm mb-14 max-w-md mx-auto">Start shopping in just three easy steps — no hassle, no confusion.</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <!-- Connector line desktop -->
          <div class="hidden md:block absolute top-10 left-[calc(16.66%+3rem)] right-[calc(16.66%+3rem)] h-px bg-gray-200 z-0"></div>

          <!-- Step 1 -->
          <div class="relative z-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 ring-4 ring-white shadow-sm">
              <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <span class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Step 1</span>
            <h3 class="text-base font-semibold text-gray-900 mb-1.5">Browse Products</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Explore our wide selection of quality items across all categories.</p>
          </div>

          <!-- Step 2 -->
          <div class="relative z-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5 ring-4 ring-white shadow-sm">
              <svg class="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Step 2</span>
            <h3 class="text-base font-semibold text-gray-900 mb-1.5">Add to Cart</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Pick your favourites and add them to your cart with one click.</p>
          </div>

          <!-- Step 3 -->
          <div class="relative z-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
            <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-5 ring-4 ring-white shadow-sm">
              <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span class="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Step 3</span>
            <h3 class="text-base font-semibold text-gray-900 mb-1.5">Fast Checkout</h3>
            <p class="text-gray-500 text-sm leading-relaxed">Secure payment and fast delivery straight to your doorstep.</p>
          </div>
        </div>

        <div class="mt-10">
          <NuxtLink to="/shop" class="btn-primary inline-flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            Start Shopping
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Feature Strip -->
    <section class="bg-gray-50 border-t border-gray-100 py-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-blue-100 transition-all duration-300">
            <div class="w-12 h-12 mb-4 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
              <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900 mb-1">Quality Products</h3>
            <p class="text-gray-500 text-sm">Carefully curated selection of premium items.</p>
          </div>

          <div class="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-emerald-100 transition-all duration-300">
            <div class="w-12 h-12 mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-300">
              <svg class="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900 mb-1">Best Prices</h3>
            <p class="text-gray-500 text-sm">Competitive pricing on all our products.</p>
          </div>

          <div class="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-purple-100 transition-all duration-300">
            <div class="w-12 h-12 mb-4 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors duration-300">
              <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900 mb-1">Fast Delivery</h3>
            <p class="text-gray-500 text-sm">Quick and reliable shipping to your doorstep.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Banner -->
    <section class="py-16 text-white" :style="{ background: `linear-gradient(135deg, ${siteConfig?.primary_color || '#6898ED'}, ${siteConfig?.secondary_color || '#4B5979'})` }">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div v-for="stat in stats" :key="stat.label" class="group">
            <div class="text-4xl font-extrabold mb-1 drop-shadow group-hover:scale-110 transition-transform duration-300">{{ stat.value }}</div>
            <div class="text-white/70 text-xs font-semibold uppercase tracking-widest">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter CTA -->
    <section class="py-20 text-white relative overflow-hidden" :style="{ backgroundColor: 'var(--color-secondary)' }">
      <div class="absolute inset-0 opacity-5 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white blur-3xl"></div>
      </div>
      <div class="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-widest text-white mb-3">Stay in the loop</p>
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Don't miss a deal.</h2>
        <p class="text-white text-sm mb-8 max-w-sm mx-auto">Get the latest products, exclusive offers, and updates delivered straight to your inbox.</p>
        <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" @submit.prevent>
          <input
            type="email"
            placeholder="Enter your email"
            class="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm"
          />
          <button
            type="submit"
            class="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-400 hover:scale-105 transition-all duration-200 shadow-lg shrink-0"
          >
            Subscribe
          </button>
        </form>
        <p class="text-white text-xs mt-4">No spam, ever. Unsubscribe anytime.</p>
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

interface ProductsResponse {
  data: Product[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

const { $apiFetch } = useNuxtApp()
const { siteConfig } = useSiteConfig()

const stats = [
  { value: '500+', label: 'Products' },
  { value: '1,200+', label: 'Happy Customers' },
  { value: '99%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support' },
]

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const imageLoading = ref(false)
const imageLoaded = ref(false)

const heroStyle = computed(() => {
  const imageUrl = siteConfig.value?.hero_image_url

  if (imageUrl) {
    return {
      backgroundImage: imageLoaded.value ? `url("${imageUrl}")` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#1e293b',
    }
  }

  return {
    backgroundImage: `linear-gradient(135deg, ${siteConfig.value?.primary_color || '#6898ED'}, ${
      siteConfig.value?.secondary_color || '#4B5979'
    })`,
  }
})

const preloadImage = (url: string) => {
  imageLoading.value = true
  imageLoaded.value = false

  const img = new Image()
  img.onload = () => {
    imageLoaded.value = true
    imageLoading.value = false
  }
  img.onerror = () => {
    imageLoading.value = false
  }
  img.src = url
}

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const productsResponse = await $apiFetch<ProductsResponse>('/products', {
      method: 'GET',
      query: {
        is_active: 1,
        limit: 8,
        sort: 'created_at',
        order: 'desc'
      }
    })

    if (productsResponse?.data) {
      products.value = productsResponse.data
    }
  } catch (err: any) {
    console.error('Error fetching data:', err)
    error.value = err?.data?.message || 'Failed to load products. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Preload hero image when siteConfig becomes available
watch(() => siteConfig.value?.hero_image_url, (url) => {
  if (url) preloadImage(url)
}, { immediate: true })

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Hero image slide progress bar */
.slide-bar {
  background: rgba(255, 255, 255, 0.85);
  width: 40%;
  border-radius: 9999px;
  animation: slide 1.4s ease-in-out infinite;
}

@keyframes slide {
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(200%); }
  100% { transform: translateX(200%); }
}

/* Hero text slide-up on appear */
.hero-up-enter-active {
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.hero-up-enter-from {
  opacity: 0;
  transform: translateY(28px);
}

/* Product cards stagger fade-up */
.card-stagger {
  opacity: 0;
  animation: card-fade-up 0.5s ease forwards;
}

@keyframes card-fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Shared fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
