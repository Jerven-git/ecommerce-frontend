<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-4xl font-bold mb-8">Shopping Cart</h1>

    <div v-if="cartStore.items.length === 0" class="text-center py-16">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="text-xl text-gray-500 mb-6">Your cart is empty</p>
      <NuxtLink to="/shop" class="btn-primary">
        Continue Shopping
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="card">
          <div v-for="item in cartStore.items" :key="item.id" class="flex items-center gap-4 pb-6 mb-6 border-b last:border-b-0 last:pb-0 last:mb-0">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="w-24 h-24 object-cover rounded-lg"
            />
            <div v-else class="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ item.name }}</h3>
              <p class="text-blue-600 font-bold">${{ item.price }}</p>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                class="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                -
              </button>
              <span class="w-12 text-center font-medium">{{ item.quantity }}</span>
              <button
                @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                class="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                +
              </button>
            </div>

            <div class="text-right">
              <p class="font-bold text-lg">${{ (item.price * item.quantity).toFixed(2) }}</p>
              <button
                @click="cartStore.removeFromCart(item.id)"
                class="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card sticky top-24">
          <h2 class="text-2xl font-bold mb-6">Order Summary</h2>

          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div class="border-t pt-3 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
          </div>

          <NuxtLink to="/checkout" class="btn-primary w-full text-center block">
            Proceed to Checkout
          </NuxtLink>

          <NuxtLink to="/shop" class="btn-secondary w-full text-center block mt-3">
            Continue Shopping
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { useCartStore } from '@/stores/cart'
const cartStore = useCartStore()
</script>
