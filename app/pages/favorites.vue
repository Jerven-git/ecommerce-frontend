<template>
  <div class="min-h-screen flex flex-col">
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Saved</p>
        <h1 class="text-3xl font-bold text-gray-900">Your Favorites</h1>
        <p class="text-sm text-gray-500 mt-1">
          Products you've hearted, saved on this device.
        </p>
      </div>
    </div>

    <!-- Body -->
    <div class="flex-1 bg-gray-50/40 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
          <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
          <p class="text-sm text-gray-500">Loading favorites…</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center max-w-md mx-auto">
          <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="heroicons:exclamation-circle" class="w-6 h-6 text-red-500" aria-hidden="true" />
          </div>
          <p class="font-semibold text-gray-800 mb-1">Failed to load favorites</p>
          <p class="text-sm text-red-500 mb-6">{{ error }}</p>
          <button @click="loadFavorites" class="btn-primary">Retry</button>
        </div>

        <!-- Empty -->
        <div v-else-if="products.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-md mx-auto">
          <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Icon name="heroicons:heart" class="w-7 h-7 text-gray-300" aria-hidden="true" />
          </div>
          <p class="text-sm font-semibold text-gray-900 mb-1">No favorites yet</p>
          <p class="text-sm text-gray-400 mb-5">
            Tap the heart on any product to save it here. Favorites stay on this device.
          </p>
          <NuxtLink to="/shop" class="btn-primary inline-block">Browse Products</NuxtLink>
        </div>

        <!-- Grid -->
        <div v-else>
          <div class="flex items-center justify-between mb-5">
            <p class="text-sm text-gray-500">
              {{ products.length }} {{ products.length === 1 ? 'item' : 'items' }} saved
            </p>
            <button
              v-if="products.length > 0"
              @click="confirmClear"
              class="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </div>

    <ConfirmModal
      :open="clearConfirmOpen"
      title="Clear all favorites?"
      message="This will remove every product from your saved list. You can always re-save them later."
      confirm-text="Clear all"
      variant="danger"
      @confirm="clearAll"
      @cancel="clearConfirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

interface ProductsResponse { data: Product[] }

const { $apiFetch } = useNuxtApp()
const favoritesStore = useFavoritesStore()
const router = useRouter()
const { siteConfig } = useSiteConfig()

const loading = ref(true)
const error = ref<string | null>(null)
const products = ref<Product[]>([])
const clearConfirmOpen = ref(false)

// If the admin disables the favorites feature site-wide, the page becomes
// dead UI. Bounce back to /shop rather than render an orphaned screen.
watchEffect(() => {
  if (siteConfig.value && siteConfig.value.favorites_enabled === false) {
    router.replace('/shop')
  }
})

async function loadFavorites() {
  loading.value = true
  error.value = null

  const ids = favoritesStore.productIds
  if (ids.length === 0) {
    products.value = []
    loading.value = false
    return
  }

  try {
    const response = await $apiFetch<ProductsResponse>('/products', {
      method: 'GET',
      query: { ids: ids.join(',') },
    })
    // Preserve the user's heart-order (newest first as stored), and drop any
    // ids the server didn't return — those products were deleted upstream
    // and would otherwise stay in localStorage forever.
    const byId = new Map((response?.data ?? []).map((p) => [p.id, p]))
    const ordered: Product[] = []
    const stillExist: number[] = []
    for (const id of ids) {
      const p = byId.get(id)
      if (p) {
        ordered.push(p)
        stillExist.push(id)
      }
    }
    if (stillExist.length !== ids.length) {
      favoritesStore.productIds = stillExist
      favoritesStore.persist()
    }
    products.value = ordered
  } catch (err: any) {
    console.error('Error fetching favorites:', err)
    error.value = err?.data?.message || 'Failed to load favorites.'
  } finally {
    loading.value = false
  }
}

function confirmClear() {
  clearConfirmOpen.value = true
}

function clearAll() {
  favoritesStore.clear()
  products.value = []
  clearConfirmOpen.value = false
}

// Re-fetch when the user toggles a favorite from this page (heart on the
// card). The store is reactive, so the id list change triggers a refresh.
watch(() => favoritesStore.productIds.length, (newLen, oldLen) => {
  // Only refetch on additions, not removals — a removal we already reflect
  // by filtering products in-memory below.
  if (newLen > oldLen) loadFavorites()
})

watch(() => [...favoritesStore.productIds], (newIds, oldIds) => {
  // Drop products whose hearts were just removed, without re-hitting the API.
  if (newIds.length < oldIds.length) {
    const keep = new Set(newIds)
    products.value = products.value.filter((p) => keep.has(p.id))
  }
})

onMounted(loadFavorites)
</script>
