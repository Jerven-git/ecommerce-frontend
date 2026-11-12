<template>
  <section id="featured" class="featured-products bg-white py-16 lg:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div ref="featuredHeadingRef" class="home-section-heading reveal flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end border-b border-gray-200 pb-6">
        <div>
          <h2 class="display-2 font-bold text-gray-900">Featured products</h2>
          <p class="mt-3 max-w-md text-gray-600">Explore products from our store.</p>
        </div>
        <NuxtLink to="/shop" class="link-arrow inline-flex min-h-11 shrink-0 items-center">
          View all products
          <Icon name="heroicons:arrow-right" class="h-4 w-4" aria-hidden="true" />
        </NuxtLink>
      </div>

      <div v-if="loading" class="featured-products-grid mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-12 lg:gap-x-6 lg:gap-y-10 lg:grid-cols-4" aria-label="Loading products" aria-busy="true">
        <div v-for="index in 8" :key="index" class="animate-pulse">
          <div class="aspect-square rounded-xl bg-gray-100" />
          <div class="mt-3.5 h-3.5 w-2/3 rounded bg-gray-100" />
          <div class="mt-2 h-3 w-1/3 rounded bg-gray-100" />
        </div>
      </div>

      <div v-else-if="error" class="mt-16 flex flex-col items-center text-center">
        <Icon name="heroicons:exclamation-circle" class="h-9 w-9 text-red-400" aria-hidden="true" />
        <p class="mt-4 text-sm font-medium text-red-600">{{ error }}</p>
      </div>

      <div v-else-if="products.length === 0" class="mt-16 flex flex-col items-center text-center">
        <Icon name="heroicons:cube" class="h-10 w-10 text-gray-300" aria-hidden="true" />
        <p class="mt-4 max-w-xs text-gray-500">No products are available to display yet.</p>
        <NuxtLink to="/shop" class="btn-primary mt-6 inline-flex items-center gap-2">Browse the shop</NuxtLink>
      </div>

      <div data-builtin-layout-grid v-else class="featured-products-grid mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-12 lg:gap-x-6 lg:gap-y-10 lg:grid-cols-4">
        <div
          v-for="product in products"
          :key="product.id"
          class="featured-card min-w-0"
        >
          <ProductCard :product="product" />
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{
  error: string | null
  loading: boolean
  products: Product[]
}>()

const { revealRef: featuredHeadingRef } = useScrollReveal()
</script>

<style scoped>
.featured-products :deep(.builtin-product-card) { height: 100%; }
.featured-products :deep(.builtin-product-card > div:first-child) {
  aspect-ratio: 1;
  background: color-mix(in srgb, currentColor 3%, white);
  border-radius: .75rem;
}
.featured-products :deep(.builtin-product-card > div:first-child > img) {
  padding: clamp(.75rem, 1.5vw, 1.25rem);
  object-fit: contain;
}
.featured-products :deep(.builtin-product-card > div:last-child) { text-align: start; }
.featured-products :deep(.builtin-product-card h3) {
  min-height: 3em;
  font-size: .9375rem;
  font-weight: 500;
  line-height: 1.5;
  -webkit-line-clamp: 2;
  text-wrap: pretty;
}
.featured-products :deep(.builtin-product-card > div:last-child p:last-child) {
  margin-top: .5rem;
  color: var(--color-secondary-950);
  font-size: .9375rem;
  font-weight: 600;
  letter-spacing: 0;
}
.featured-products :deep(.builtin-product-card:focus-visible) { outline-offset: 6px; border-radius: .75rem; }
@media (max-width: 639px) {
  .featured-products .home-section-heading { gap: .5rem; }
  .featured-products :deep(.builtin-product-card h3) { font-size: .875rem; }
}
</style>
