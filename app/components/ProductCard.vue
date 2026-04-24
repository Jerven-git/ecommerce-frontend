<template>
  <div class="card hover:shadow-xl transition-shadow group cursor-pointer flex flex-col h-full">
    <!-- Image with hover overlay -->
    <NuxtLink :to="`/product/${product.slug}`" class="block">
      <div class="relative w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
        <SmoothImage
          v-if="product.image_url"
          :src="product.image_url"
          :alt="product.name"
          class="h-64 w-full object-cover object-center group-hover:scale-105"
        />
        <div v-else class="h-64 w-full bg-gray-300">
          <ProductImagePlaceholder size="md" />
        </div>

        <FavoriteButton :product-id="product.id" size="sm" />

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-white/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <span class="translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-semibold border border-white/20 shadow-lg">
            View
          </span>
        </div>
      </div>
    </NuxtLink>

    <div class="flex flex-col flex-1">
      <NuxtLink :to="`/product/${product.slug}`" class="block">
        <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{{ product.name }}</h3>
        <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ product.description }}</p>
      </NuxtLink>

      <div class="mt-auto">
        <div class="flex items-center justify-between mb-4">
          <span class="text-2xl font-bold text-primary-600">${{ product.price }}</span>
          <StockBadge :stock="product.stock" :can-backorder="product.can_backorder" variant="text" />
        </div>

        <button
          @click="addToCart"
          :disabled="!orderable"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ orderable ? 'Add to Cart' : 'Out of Stock' }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{
  product: Product
}>()

const cartStore = useCartStore()

const orderable = computed(() => isOrderable(props.product))

const addToCart = () => {
  cartStore.addItem(props.product)
}
</script>
