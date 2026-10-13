<template>
  <section
    v-if="visible"
    class="bg-white py-12 md:py-16"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Heading row + scroll arrows -->
      <div class="flex items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <p
            v-if="bestSellers.label"
            class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1"
          >
            {{ bestSellers.label }}
          </p>
          <h2 v-if="bestSellers.heading" class="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-[var(--color-secondary,#4B5979)]">
            {{ bestSellers.heading }}
          </h2>
          <p
            v-if="bestSellers.subtitle"
            class="text-sm text-gray-500 mt-1 max-w-xl"
          >
            {{ bestSellers.subtitle }}
          </p>
        </div>

        <div class="hidden sm:flex items-center gap-1 shrink-0">
          <button
            type="button"
            class="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="!canScrollLeft"
            @click="scrollBy(-1)"
            aria-label="Scroll left"
          >
            <Icon name="heroicons:chevron-left" class="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="!canScrollRight"
            @click="scrollBy(1)"
            aria-label="Scroll right"
          >
            <Icon name="heroicons:chevron-right" class="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Cards -->
      <div
        ref="trackRef"
        @scroll.passive="updateScrollState"
        class="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 best-sellers-track"
      >
        <div
          v-for="product in bestSellers.products"
          :key="product.id"
          class="snap-start shrink-0 w-[78%] sm:w-[46%] md:w-[31%] lg:w-[23%] xl:w-[19%]"
        >
          <ProductCard :product="toProduct(product)" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageBestSellersProduct, SiteConfig } from '~/composables/useSiteConfig'
import type { Product } from '~/types/product'

const props = defineProps<{ siteConfig?: SiteConfig | null }>()
const { siteConfig: sharedSiteConfig } = useSiteConfig()
const siteConfig = computed(() => props.siteConfig ?? sharedSiteConfig.value)

const bestSellers = computed(() => siteConfig.value?.homepage_best_sellers)

// Render only when the admin enabled the section AND the resolver actually
// returned something to show. An empty list with the toggle on (e.g. fallback
// list emptied + no orders yet) is silent rather than an empty band.
const visible = computed(() =>
  !!bestSellers.value
    && bestSellers.value.enabled
    && bestSellers.value.products.length > 0,
)

// ProductCard expects the full Product shape; the API trims to a subset for
// this section (no description, weight, dimensions etc.). Pad the missing
// fields with safe defaults so the card renders without optional-chaining
// every line.
function toProduct(p: HomepageBestSellersProduct): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: '',
    price: p.price,
    stock: p.stock,
    image_url: p.image_url,
    is_active: p.is_active,
    allow_backorder: p.allow_backorder,
    backorder_charge_policy: p.backorder_charge_policy as Product['backorder_charge_policy'],
    can_backorder: p.can_backorder,
  } as Product
}

const trackRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const el = trackRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollBy(direction: 1 | -1) {
  const el = trackRef.value
  if (!el) return
  el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.85), behavior: 'smooth' })
}

onMounted(() => {
  nextTick(updateScrollState)
  window.addEventListener('resize', updateScrollState)
})
onBeforeUnmount(() => window.removeEventListener('resize', updateScrollState))

// Re-evaluate scroll arrows whenever the products list changes (e.g. siteConfig
// finishes loading on hard refresh).
watch(
  () => bestSellers.value?.products.length,
  () => nextTick(updateScrollState),
)
</script>

<style scoped>
.best-sellers-track {
  scrollbar-width: none;
}
.best-sellers-track::-webkit-scrollbar {
  display: none;
}
</style>
