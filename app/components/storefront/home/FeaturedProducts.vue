<template>
  <section id="featured" class="bg-white py-16 lg:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div ref="featuredHeadingRef" class="reveal flex items-end justify-between gap-6 border-b border-gray-200 pb-6">
        <div>
          <h2 class="display-2 font-bold text-gray-900">New Arrivals</h2>
          <p class="mt-3 max-w-md text-gray-600">Fresh additions to the shop, hand-picked and just in.</p>
        </div>
        <NuxtLink to="/shop" class="link-arrow mb-1 hidden shrink-0 sm:inline-flex">
          View all
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>

      <div v-if="loading" class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-12 lg:gap-x-6 lg:gap-y-10">
        <div v-for="index in 8" :key="index" class="animate-pulse">
          <div class="aspect-[4/5] rounded-xl bg-gray-100" />
          <div class="mx-auto mt-3.5 h-3.5 w-2/3 rounded bg-gray-100" />
          <div class="mx-auto mt-2 h-3 w-1/3 rounded bg-gray-100" />
        </div>
      </div>

      <div v-else-if="error" class="mt-16 flex flex-col items-center text-center">
        <svg class="h-9 w-9 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="mt-4 text-sm font-medium text-red-600">{{ error }}</p>
      </div>

      <div v-else-if="products.length === 0" class="mt-16 flex flex-col items-center text-center">
        <svg class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p class="mt-4 max-w-xs text-gray-500">New products are on their way — check back soon.</p>
        <NuxtLink to="/shop" class="btn-primary mt-6 inline-flex items-center gap-2">Browse the shop</NuxtLink>
      </div>

      <div v-else class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-12 lg:gap-x-6 lg:gap-y-10 lg:grid-cols-4">
        <div
          v-for="(product, index) in products"
          :key="product.id"
          :ref="addFeaturedRevealRef"
          :class="['featured-card', Math.floor(index / 4) % 2 === 0 ? 'from-right' : 'from-left']"
          :style="{ animationDelay: `${Math.floor(index / 4) * 600 + (index % 4) * 100}ms` }"
        >
          <ProductCard :product="product" />
        </div>
      </div>

      <div :ref="addRevealRef" class="reveal mt-12 text-center sm:hidden">
        <NuxtLink to="/shop" class="link-arrow">
          View all products
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
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
const { addRevealRef } = useScrollRevealAll()
const { addRevealRef: addFeaturedRevealRef } = useScrollRevealAll({ threshold: 0.15 })
</script>

<style scoped>
.featured-card {
  opacity: 0;
}

.featured-card.from-right { transform: translateX(60px); }
.featured-card.from-left { transform: translateX(-60px); }

.featured-card.reveal-visible.from-right {
  animation: card-slide-from-right 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.featured-card.reveal-visible.from-left {
  animation: card-slide-from-left 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes card-slide-from-right {
  from { opacity: 0; transform: translateX(60px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes card-slide-from-left {
  from { opacity: 0; transform: translateX(-60px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .featured-card,
  .featured-card.reveal-visible.from-right,
  .featured-card.reveal-visible.from-left {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
