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
            <ProductImageZoom
              :enabled="zoomEnabled"
              :image-url="activeImage?.url || ''"
              class="block"
            >
              <div class="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
                <img
                  v-if="activeImage"
                  :src="activeImage.url"
                  :alt="activeImage.alt || product.name"
                  class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  :class="{ 'cursor-crosshair': zoomEnabled, 'cursor-zoom-in': !zoomEnabled }"
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
            </ProductImageZoom>

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
            <div class="flex items-baseline gap-2">
              <span v-if="hasVariants && !selectedVariant" class="text-sm font-medium text-gray-400 mr-0.5">From</span>
              <span class="text-3xl font-bold text-gray-900">{{ format(hasVariants && !selectedVariant ? fromPrice : effectivePrice) }}</span>
            </div>
            <p class="text-sm text-[var(--color-secondary)] mt-1">Shipping will calculated at checkout</p>
          </div>

          <!-- Specifications -->
          <dl v-if="specs.length" class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 border-t border-gray-100 pt-6">
            <div v-for="spec in specs" :key="spec.label" class="flex flex-col gap-0.5">
              <dt class="text-[11px] font-medium uppercase tracking-[0.15em] text-gray-400">{{ spec.label }}</dt>
              <dd class="text-sm text-gray-800">{{ spec.value }}</dd>
            </div>
          </dl>

          <!-- Option Selectors -->
          <div v-if="hasVariants" class="mt-6 space-y-4">
            <div v-for="option in product.options" :key="option.id">
              <label class="block text-sm font-semibold text-gray-700 mb-2">{{ option.name }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="value in option.values"
                  :key="value.id"
                  type="button"
                  @click="selectedValues[option.id] = selectedValues[option.id] === value.id ? null : value.id"
                  :disabled="isValueUnavailable(option.id, value.id)"
                  class="relative border-2 rounded-lg transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                  :class="selectedValues[option.id] === value.id
                    ? 'border-[var(--color-secondary)]'
                    : 'border-gray-200 hover:border-gray-400'"
                >
                  <!-- With variant image: image tile + label below -->
                  <template v-if="variantImageForValue(option.id, value.id)">
                    <img
                      :src="variantImageForValue(option.id, value.id)!"
                      :alt="value.label"
                      class="w-16 h-16 object-cover block"
                    />
                    <span
                      class="block text-xs font-semibold px-1.5 py-1 text-center"
                      :class="selectedValues[option.id] === value.id ? 'bg-[var(--color-secondary)]/10 text-gray-900' : 'bg-white text-gray-700'"
                    >{{ value.label }}</span>
                  </template>
                  <!-- Without variant image: plain text pill (+ optional swatch dot) -->
                  <template v-else>
                    <span class="flex items-center gap-1.5 px-3 py-1.5 text-sm"
                      :class="selectedValues[option.id] === value.id ? 'bg-[var(--color-secondary)]/10 text-gray-900' : 'bg-white text-gray-700'"
                    >
                      <img v-if="value.image_url" :src="value.image_url" class="w-4 h-4 rounded-full object-cover" :alt="value.label" />
                      {{ value.label }}
                    </span>
                  </template>
                  <!-- Selected tick -->
                  <span
                    v-if="selectedValues[option.id] === value.id"
                    class="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--color-secondary)] flex items-center justify-center"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
            <p v-if="incompleteOptionNames.length" class="text-sm text-amber-600">
              Please select {{ incompleteOptionNames.join(', ') }} to continue.
            </p>
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
            <StockBadge
              v-if="!hasVariants || selectedVariant"
              :stock="effectiveStock"
              :can-backorder="product.can_backorder"
              variant="dot"
            />
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
                :disabled="(!hasVariants || !!selectedVariant) && !product.can_backorder && quantity >= effectiveStock"
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
            class="w-full py-3.5 px-6 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
            :class="canOrder
              ? 'text-white bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-600)]'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'"
          >
            {{ canOrder ? 'Proceed to Cart' : (hasVariants && !selectedVariant ? 'Select Options' : 'Out of Stock') }}
          </button>

        </div>
      </div>
    </div>

    <!-- Related products -->
    <section v-if="product && relatedProducts.length" class="border-t border-gray-100 mt-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div class="text-center mb-12">
          <p class="text-[11px] font-medium uppercase tracking-[0.25em] text-gray-400 mb-3">{{ relatedByCategory ? 'From the Same Category' : 'Continue Exploring' }}</p>
          <h2 class="text-2xl sm:text-3xl font-normal tracking-tight text-gray-900">You May Also Like</h2>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          <ProductCard
            v-for="related in relatedProducts"
            :key="related.id"
            :product="related"
          />
        </div>

        <div class="text-center mt-14">
          <NuxtLink
            :to="product.category_id ? `/shop?category_id=${product.category_id}` : '/shop'"
            class="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-gray-900 border-b border-gray-300 pb-1 hover:border-gray-900 transition-colors"
          >
            View All Products
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

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

          <div @click.stop class="inline-block max-w-full max-h-[85vh]">
            <ProductImageZoom
              :enabled="zoomEnabled"
              :image-url="activeImage.url"
              fit-mode="contain"
            >
              <img
                :src="activeImage.url"
                :alt="activeImage.alt || product?.name"
                class="relative max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                decoding="async"
              />
            </ProductImageZoom>
          </div>

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
import type { Product, ProductDetail, ProductVariant } from '~/types/product'

const route = useRoute()
const { $apiFetch } = useNuxtApp()
const cartStore = useCartStore()
const { format } = useCurrency()

const product = ref<ProductDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const quantity = ref(1)
const showLightbox = ref(false)
const activeIndex = ref(0)

// ── Variant selection ────────────────────────────────────────────────────────
const hasVariants = computed(() => (product.value?.options?.length ?? 0) > 0)

// optionId → selected valueId (null = not yet chosen)
const selectedValues = ref<Record<number, number | null>>({})

watch(product, (p) => {
  if (p?.options) {
    selectedValues.value = Object.fromEntries(p.options.map(o => [o.id, null]))
  }
}, { immediate: true })

const selectedVariant = computed<ProductVariant | null>(() => {
  if (!hasVariants.value || !product.value?.variants) return null
  const allChosen = product.value.options!.every(o => selectedValues.value[o.id] !== null)
  if (!allChosen) return null
  return product.value.variants.find(v =>
    v.is_active &&
    v.option_values.every(ov =>
      selectedValues.value[ov.pivot.product_option_id] === ov.id
    )
  ) ?? null
})

// Grey out values that would lead to no available variant
function isValueUnavailable(optionId: number, valueId: number): boolean {
  if (!product.value?.variants) return false
  const hypo = { ...selectedValues.value, [optionId]: valueId }
  return !product.value.variants.some(v =>
    v.is_active &&
    (v.stock > 0 || !!product.value!.can_backorder) &&
    v.option_values.every(ov => {
      const sel = hypo[ov.pivot.product_option_id]
      return sel === null || sel === ov.id
    })
  )
}

const incompleteOptionNames = computed(() =>
  (product.value?.options ?? [])
    .filter(o => selectedValues.value[o.id] === null)
    .map(o => o.name)
)

// Generic spec list — only includes fields the admin has filled in.
const specs = computed(() => {
  const p = product.value
  if (!p) return []
  const rows: { label: string; value: string }[] = []
  if (p.material) rows.push({ label: 'Material', value: p.material })
  if (p.dimensions) rows.push({ label: 'Dimensions', value: p.dimensions })
  return rows
})

// Returns the image_url of the first active variant that contains the given option value.
// Used to show a variant photo thumbnail on the option button.
function variantImageForValue(optionId: number, valueId: number): string | null {
  return product.value?.variants?.find(v =>
    v.is_active && v.option_values.some(ov => ov.pivot.product_option_id === optionId && ov.id === valueId)
  )?.image_url ?? null
}

const effectivePrice = computed(() => {
  if (selectedVariant.value?.price !== undefined && selectedVariant.value.price !== null) {
    return Number(selectedVariant.value.price)
  }
  return Number(product.value?.price ?? 0)
})

// Lowest price across all active variants (or product base price if no overrides).
const fromPrice = computed(() => {
  const variants = product.value?.variants?.filter(v => v.is_active) ?? []
  if (!variants.length) return Number(product.value?.price ?? 0)
  const prices = variants.map(v => v.price !== null && v.price !== undefined ? Number(v.price) : Number(product.value!.price))
  return Math.min(...prices)
})

const effectiveStock = computed(() => {
  if (hasVariants.value) return selectedVariant.value?.stock ?? 0
  return product.value?.stock ?? 0
})
// ── End variant selection ─────────────────────────────────────────────────────

// Product gallery — never includes variant images, only product media.
const allImages = computed<{ url: string; alt: string | null }[]>(() => {
  if (!product.value) return []
  const fromMedia = (product.value.media || [])
    .filter(m => m.collection === 'gallery')
    .map(m => ({ url: m.url, alt: m.alt_text ?? null }))
  return fromMedia.length
    ? fromMedia
    : product.value.image_url ? [{ url: product.value.image_url, alt: null }] : []
})

// When a variant with its own image is selected, show that image in the main slot.
// Gallery thumbnails always reflect the product gallery; clicking one overrides the variant image.
const activeImage = computed(() => {
  if (selectedVariant.value?.image_url && activeIndex.value === 0) {
    return { url: selectedVariant.value.image_url, alt: null }
  }
  return allImages.value[activeIndex.value] || null
})

// When variant changes, reset to index 0 so the variant image shows immediately.
watch(selectedVariant, () => { activeIndex.value = 0 })

const prevImage = () => {
  if (allImages.value.length <= 1) return
  activeIndex.value = (activeIndex.value - 1 + allImages.value.length) % allImages.value.length
}

const nextImage = () => {
  if (allImages.value.length <= 1) return
  activeIndex.value = (activeIndex.value + 1) % allImages.value.length
}

const zoomEnabled = computed(() => !!product.value?.hover_zoom_enabled)

const canOrder = computed(() => {
  if (!product.value) return false
  if (hasVariants.value) {
    if (!selectedVariant.value) return false
    return selectedVariant.value.stock > 0 || !!product.value.can_backorder
  }
  return isOrderable(product.value)
})

const addToCart = () => {
  if (!product.value || !canOrder.value) return

  let variantPayload: Parameters<typeof cartStore.addItem>[1] = undefined
  if (selectedVariant.value) {
    const selectedOptions: Record<string, string> = {}
    for (const opt of product.value.options ?? []) {
      const valueId = selectedValues.value[opt.id]
      const valueLabel = opt.values.find(v => v.id === valueId)?.label ?? ''
      selectedOptions[opt.name] = valueLabel
    }
    const label = Object.values(selectedOptions).join(' / ')
    variantPayload = {
      id: selectedVariant.value.id,
      sku: selectedVariant.value.sku ?? null,
      price: selectedVariant.value.price !== null ? Number(selectedVariant.value.price) : null,
      image_url: selectedVariant.value.image_url ?? null,
      stock: selectedVariant.value.stock,
      selectedOptions,
      label,
    }
  }

  for (let i = 0; i < quantity.value; i++) {
    cartStore.addItem(product.value, variantPayload)
  }
  navigateTo('/cart')
}

// ── Related products ──────────────────────────────────────────────────────
const relatedProducts = ref<Product[]>([])
const relatedByCategory = ref(false)
const RELATED_LIMIT = 4

const fetchRelated = async () => {
  const p = product.value
  if (!p) return
  relatedProducts.value = []

  const pick = (list: Product[]) =>
    list.filter(r => r.id !== p.id && r.is_active !== false).slice(0, RELATED_LIMIT)

  try {
    // Prefer products from the same category; fall back to other recent products.
    if (p.category_id) {
      const res = await $apiFetch<{ data: Product[] }>('/products', {
        method: 'GET',
        query: { is_active: 1, category_id: p.category_id, per_page: RELATED_LIMIT + 1 },
      })
      const picked = pick(res?.data ?? [])
      if (picked.length) {
        relatedProducts.value = picked
        relatedByCategory.value = true
        return
      }
    }

    const res = await $apiFetch<{ data: Product[] }>('/products', {
      method: 'GET',
      query: { is_active: 1, per_page: RELATED_LIMIT + 1 },
    })
    relatedProducts.value = pick(res?.data ?? [])
    relatedByCategory.value = false
  } catch (err) {
    console.error('Error fetching related products:', err)
  }
}

const fetchProduct = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await $apiFetch<{ data: ProductDetail }>(`/products/${route.params.slug}`, { method: 'GET' })
    if (response?.data) {
      product.value = response.data
      fetchRelated()
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
