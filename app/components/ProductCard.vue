<template>
  <div class="card hover:shadow-xl transition-shadow group">
    <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
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
    </div>

    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ product.name }}</h3>
      <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ product.description }}</p>

      <div class="flex items-center justify-between mb-4">
        <span class="text-2xl font-bold text-blue-600">${{ product.price }}</span>
        <span v-if="product.stock > 0" class="text-sm text-green-600">In Stock</span>
        <span v-else class="text-sm text-red-600">Out of Stock</span>
      </div>

      <button
        @click="addToCart"
        :disabled="product.stock === 0"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: any
}>()

const usecartStore = useCartStore()

const addToCart = () => {
  usecartStore.addToCart(props.product)
}
</script>
