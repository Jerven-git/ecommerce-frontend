<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div v-if="cartStore.items.length === 0" class="text-center py-16 bg-white rounded-lg shadow">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
        <p class="text-gray-500 mb-6">Add some products to get started!</p>
        <NuxtLink to="/shop" class="btn-primary inline-block">Continue Shopping</NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <div v-for="item in cartStore.items" :key="item.id" class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center space-x-4">
              <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="w-24 h-24 object-cover rounded" />
              <div v-else class="w-24 h-24 bg-gray-200 rounded"></div>

              <div class="flex-1">
                <h3 class="font-semibold text-lg">{{ item.name }}</h3>
                <p class="text-gray-600">${{ item.price.toFixed(2) }} × {{ item.quantity }}</p>
                <p class="text-sm text-gray-500">Weight: {{ item.weight }} kg</p>
              </div>

              <div class="flex items-center space-x-3">
                <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)" class="w-8 h-8 rounded border hover:bg-gray-100">-</button>
                <span class="w-12 text-center">{{ item.quantity }}</span>
                <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)" class="w-8 h-8 rounded border hover:bg-gray-100">+</button>
              </div>

              <div class="text-right">
                <p class="font-semibold text-lg">${{ (item.price * item.quantity).toFixed(2) }}</p>
                <button @click="cartStore.removeItem(item.id)" class="text-red-600 hover:text-red-800 text-sm mt-2">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 class="text-xl font-bold mb-4">Order Summary</h2>

            <div class="space-y-3 mb-4 pb-4 border-b">
              <div class="flex justify-between text-gray-700">
                <span>Items ({{ cartStore.itemCount }})</span>
                <span>${{ cartStore.rawSubtotal.toFixed(2) }}</span>
              </div>

              <!-- Tax Display -->
              <div v-if="cartStore.taxInfo.enabled">
                <!-- Inclusive Tax -->
                <div v-if="cartStore.taxInfo.mode === 'inclusive'" class="text-sm text-gray-600">
                  <p>(Includes {{ cartStore.taxInfo.name }} {{ cartStore.taxInfo.rate }}%: ${{ cartStore.taxAmount.toFixed(2) }})</p>
                </div>

                <!-- Exclusive Tax -->
                <div v-else class="flex justify-between text-gray-700">
                  <span>{{ cartStore.taxInfo.name }} ({{ cartStore.taxInfo.rate }}%)</span>
                  <span>${{ cartStore.taxAmount.toFixed(2) }}</span>
                </div>
              </div>

              <div v-if="cartStore.shippingCost > 0" class="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span v-if="cartStore.shippingCalculation?.free_shipping" class="text-green-600 font-semibold">FREE</span>
                <span v-else>${{ cartStore.shippingCost.toFixed(2) }}</span>
              </div>
            </div>

            <div class="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span>${{ cartStore.grandTotal.toFixed(2) }}</span>
            </div>

            <NuxtLink to="/checkout" class="btn-primary w-full block text-center mb-3">
              Proceed to Checkout
            </NuxtLink>

            <NuxtLink to="/shop" class="btn-secondary w-full block text-center">
              Continue Shopping
            </NuxtLink>

            <!-- Tax Info Notice -->
            <div v-if="cartStore.taxInfo.enabled" class="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
              <p v-if="cartStore.taxInfo.mode === 'inclusive'">
                * Prices include {{ cartStore.taxInfo.name }}
              </p>
              <p v-else>
                * {{ cartStore.taxInfo.name }} will be added at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()

onMounted(() => {
  cartStore.calculateTax()
})
</script>