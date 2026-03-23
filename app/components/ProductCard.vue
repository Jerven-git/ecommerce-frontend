<template>
  <div class="card hover:shadow-xl transition-shadow group cursor-pointer flex flex-col h-full">
    <!-- Image with hover overlay -->
    <NuxtLink :to="`/product/${product.slug}`" class="block">
      <div class="relative w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
        <img
          v-if="product.image_url"
          :src="product.image_url"
          :alt="product.name"
          class="h-64 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        <div v-else class="h-64 w-full bg-gray-300 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <!-- Favorite button -->
        <button
          v-if="favoritesEnabled"
          @click.prevent="toggleFavorite"
          class="absolute top-2 right-2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all duration-200 hover:scale-110"
          :aria-label="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 transition-colors duration-200"
            :class="isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
            :fill="isFavorited ? 'currentColor' : 'none'"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

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
          <span v-if="product.stock > 0" class="text-sm text-green-600">In Stock</span>
          <span v-else-if="product.can_backorder" class="text-sm text-amber-600">Backorder</span>
          <span v-else class="text-sm text-red-600">Out of Stock</span>
        </div>

        <button
          @click="addToCart"
          :disabled="product.stock === 0 && !product.can_backorder"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ product.stock === 0 && !product.can_backorder ? 'Out of Stock' : 'Add to Cart' }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: any
}>()

const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const { siteConfig } = useSiteConfig()


const favoritesEnabled = computed(() => siteConfig.value?.favorites_enabled ?? false)
const isFavorited = computed(() => favoritesStore.isFavorited(props.product.id))

const toggleFavorite = () => {
  favoritesStore.toggle(props.product.id)
}

const addToCart = () => {
  cartStore.addItem(props.product)
}
</script>
