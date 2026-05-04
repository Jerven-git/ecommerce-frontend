<template>
  <div class="min-h-screen bg-white">

    <!-- Breadcrumb -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <nav class="flex items-center gap-2 text-sm text-gray-500">
        <NuxtLink to="/shop" class="hover:text-gray-900 transition-colors">Shop</NuxtLink>
        <span>/</span>
        <span class="text-gray-900">{{ product?.name || 'Product' }}</span>
      </nav>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 animate-pulse">
        <div>
          <div class="aspect-square bg-gray-200 rounded-2xl" />
          <div class="flex gap-2 mt-3">
            <div v-for="i in 4" :key="i" class="w-16 h-16 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div class="space-y-4 py-4">
          <div class="h-8 bg-gray-200 rounded w-3/4" />
          <div class="h-5 bg-gray-200 rounded w-1/4" />
          <div class="h-4 bg-gray-200 rounded w-full mt-6" />
          <div class="h-4 bg-gray-200 rounded w-5/6" />
          <div class="h-4 bg-gray-200 rounded w-2/3" />
          <div class="h-12 bg-gray-200 rounded w-full mt-8" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-md mx-auto px-4 py-20 text-center">
      <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-red-600 mb-4">{{ error }}</p>
      <NuxtLink to="/shop" class="btn-primary inline-block">Back to Shop</NuxtLink>
    </div>

    <!-- Product Detail -->
    <div v-else-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

        <!-- Left: Image Gallery -->
        <div class="relative">
          <div class="sticky top-8">
            <!-- Main Image -->
            <div class="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
              <img
                v-if="activeImage"
                :src="activeImage.url"
                :alt="activeImage.alt || product.name"
                class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                @click="showLightbox = true"
              />
              <ProductImagePlaceholder v-else size="lg" />

              <!-- Prev / Next Arrows (only if multiple images) -->
              <template v-if="allImages.length > 1">
                <button
                  @click.stop="prevImage"
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  @click.stop="nextImage"
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </template>

              <FavoriteButton :product-id="product.id" size="md" />
            </div>

            <!-- Thumbnail Strip -->
            <div v-if="allImages.length > 1" class="flex gap-2 mt-3 overflow-x-auto pb-1">
              <button
                v-for="(img, idx) in allImages"
                :key="idx"
                @click="activeIndex = idx"
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all duration-200 hover:opacity-100"
                :class="activeIndex === idx
                  ? 'border-[var(--color-secondary)] opacity-100 ring-1 ring-[var(--color-secondary)]'
                  : 'border-gray-200 opacity-60 hover:border-gray-300'"
              >
                <img :src="img.url" :alt="img.alt || `${product.name} ${idx + 1}`" class="w-full h-full object-cover" loading="lazy" decoding="async" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Product Info -->
        <div class="flex flex-col py-2">

          <!-- Name -->
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{{ product.name }}</h1>

          <!-- Category -->
          <p v-if="product.category" class="text-sm text-gray-500 mt-2">{{ product.category }}</p>

          <!-- Price -->
          <div class="mt-6">
            <span class="text-3xl font-bold text-gray-900">${{ Number(product.price).toFixed(2) }}</span>
            <p class="text-sm text-[var(--color-secondary)] mt-1">Shipping will calculated at checkout</p>
          </div>

          <!-- Divider -->
          <div class="border-t border-gray-200 my-6" />

          <!-- Description -->
          <div v-if="product.description" class="mb-6">
            <p
              class="text-sm text-gray-600 leading-relaxed whitespace-pre-line max-h-[400px] overflow-y-auto"
            >
              {{ product.description }}
            </p>
          </div>

          <!-- Stock -->
          <div class="flex items-center gap-2 mb-6">
            <StockBadge :stock="product.stock" :can-backorder="product.can_backorder" variant="dot" />
          </div>

          <!-- Quantity -->
          <div class="flex items-center gap-4 mb-6">
            <span class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Quantity</span>
            <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                @click="quantity > 1 && quantity--"
                :disabled="quantity <= 1"
                class="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M5 12h14" />
                </svg>
              </button>
              <span class="w-12 h-10 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-300">
                {{ quantity }}
              </span>
              <button
                @click="quantity++"
                :disabled="!product.can_backorder && quantity >= product.stock"
                class="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Add to Cart -->
          <button
            @click="addToCart"
            :disabled="!canOrder"
            class="w-full py-3.5 px-6 text-sm font-bold uppercase tracking-wider text-white bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-600)] rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ canOrder ? 'Proceed to Cart' : 'Out of Stock' }}
          </button>

        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showLightbox && activeImage"
          class="fixed inset-0 z-[60] flex items-center justify-center p-4 cursor-zoom-out"
          @click="showLightbox = false"
        >
          <div class="absolute inset-0 bg-black/80" />

          <!-- Close -->
          <button
            type="button"
            @click="showLightbox = false"
            class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Prev / Next in lightbox -->
          <template v-if="allImages.length > 1">
            <button
              @click.stop="prevImage"
              class="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              @click.stop="nextImage"
              class="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </template>

          <img
            :src="activeImage.url"
            :alt="activeImage.alt || product?.name"
            class="relative max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            decoding="async"
            @click.stop
          />

          <!-- Lightbox dot indicators -->
          <div v-if="allImages.length > 1" class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" @click.stop>
            <button
              v-for="(_, idx) in allImages"
              :key="idx"
              @click="activeIndex = idx"
              class="w-2.5 h-2.5 rounded-full transition-all duration-200"
              :class="activeIndex === idx ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import type { ProductDetail } from '~/types/product'

const route = useRoute()
const { $apiFetch } = useNuxtApp()
const cartStore = useCartStore()

const product = ref<ProductDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const quantity = ref(1)
const showLightbox = ref(false)
const activeIndex = ref(0)

// Build image list from media array (with alt_text), falling back to image_url.
const allImages = computed<{ url: string; alt: string | null }[]>(() => {
  if (!product.value) return []
  const fromMedia = (product.value.media || [])
    .filter(m => m.collection === 'gallery')
    .map(m => ({ url: m.url, alt: m.alt_text ?? null }))
  if (fromMedia.length) return fromMedia
  return product.value.image_url ? [{ url: product.value.image_url, alt: null }] : []
})

const activeImage = computed(() => allImages.value[activeIndex.value] || null)

const prevImage = () => {
  if (allImages.value.length <= 1) return
  activeIndex.value = (activeIndex.value - 1 + allImages.value.length) % allImages.value.length
}

const nextImage = () => {
  if (allImages.value.length <= 1) return
  activeIndex.value = (activeIndex.value + 1) % allImages.value.length
}

const canOrder = computed(() => !!product.value && isOrderable(product.value))

const addToCart = () => {
  if (!product.value || !canOrder.value) return
  for (let i = 0; i < quantity.value; i++) {
    cartStore.addItem(product.value)
  }
  navigateTo('/cart')
}

const fetchProduct = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await $apiFetch<{ data: ProductDetail }>(`/products/${route.params.slug}`, { method: 'GET' })
    if (response?.data) {
      product.value = response.data
    }
  } catch (err: any) {
    console.error('Error fetching product:', err)
    error.value = err?.data?.message || 'Product not found.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProduct)

useEntitySeo(() => product.value)
</script>

<style scoped>
/* Hide scrollbar on thumbnail strip */
.overflow-x-auto {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>
