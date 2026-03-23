<template>
  <div class="min-h-screen flex flex-col">

    <!-- Page Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Your Order</p>
        <h1 class="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p class="text-sm text-gray-500 mt-1">
          {{ cartStore.itemCount === 0 ? 'No items yet' : `${cartStore.itemCount} item${cartStore.itemCount === 1 ? '' : 's'}` }}
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">

        <!-- Empty State -->
        <div v-if="cartStore.items.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center max-w-sm mx-auto mt-8">
          <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p class="text-base font-semibold text-gray-900 mb-1">Your cart is empty</p>
          <p class="text-sm text-gray-400 mb-6">Add some products to get started!</p>
          <NuxtLink
            to="/shop"
            class="inline-flex items-center gap-2 btn-primary"
          >
            Continue Shopping
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Cart Grid -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-4">
            <div
              v-for="(item, index) in cartStore.items"
              :key="item.id"
              class="card-stagger bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              :style="{ animationDelay: `${index * 60}ms` }"
            >
              <div class="flex items-center gap-4">

                <!-- Image -->
                <div class="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                  <img
                    v-if="item.image_url"
                    :src="item.image_url"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 truncate">{{ item.name }}</h3>
                  <p class="text-sm text-gray-400 mt-0.5">${{ item.price.toFixed(2) }} each &middot; {{ item.weight }} kg</p>
                  <!-- Backorder indicator -->
                  <div v-if="item.quantity > item.stock && item.can_backorder" class="mt-1.5 flex items-center gap-1.5">
                    <span class="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ item.stock > 0 ? `${item.quantity - item.stock} on backorder` : 'Backorder' }}
                    </span>
                  </div>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0">
                  <button
                    @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all text-lg font-medium"
                  >−</button>
                  <span class="w-8 text-center text-sm font-semibold text-gray-900">{{ item.quantity }}</span>
                  <button
                    @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all text-lg font-medium"
                  >+</button>
                </div>

                <!-- Line Total + Remove -->
                <div class="text-right shrink-0">
                  <p class="font-bold text-gray-900">${{ (item.price * item.quantity).toFixed(2) }}</p>
                  <button
                    @click="cartStore.removeItem(item.id)"
                    class="text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
                  >Remove</button>
                </div>

              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
              <h2 class="text-base font-bold text-gray-900 mb-5">Order Summary</h2>

              <div class="space-y-3 pb-4 border-b border-gray-100">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({{ cartStore.itemCount }} item{{ cartStore.itemCount === 1 ? '' : 's' }})</span>
                  <span class="font-medium text-gray-900">${{ cartStore.rawSubtotal.toFixed(2) }}</span>
                </div>

                <!-- Tax Breakdown -->
                <template v-if="cartStore.taxInfo.enabled">
                  <div class="bg-gray-50 rounded-lg px-3 py-2.5 space-y-1.5">
                    <div class="flex justify-between text-xs text-gray-500">
                      <span>Net price</span>
                      <span class="font-medium text-gray-700">${{ cartStore.subtotal.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-xs text-gray-500">
                      <span>{{ cartStore.taxInfo.name }} ({{ cartStore.taxInfo.rate }}%)</span>
                      <span class="font-medium text-gray-700">+ ${{ cartStore.taxAmount.toFixed(2) }}</span>
                    </div>
                    <p v-if="cartStore.taxInfo.mode === 'inclusive'" class="text-[10px] text-gray-400 pt-0.5">
                      Tax is included in the displayed price
                    </p>
                    <p v-else class="text-[10px] text-gray-400 pt-0.5">
                      Tax is added to the displayed price
                    </p>
                  </div>
                </template>

                <!-- Shipping -->
                <div v-if="cartStore.shippingCost > 0" class="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span
                    v-if="cartStore.shippingCalculation?.free_shipping"
                    class="font-semibold text-green-600"
                  >FREE</span>
                  <span v-else class="font-medium text-gray-900">${{ cartStore.shippingCost.toFixed(2) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center py-4">
                <span class="font-bold text-gray-900">Total</span>
                <span class="text-xl font-bold text-gray-900">${{ cartStore.grandTotal.toFixed(2) }}</span>
              </div>

              <NuxtLink
                to="/checkout"
                class="btn-primary w-full block text-center mb-3"
              >
                Proceed to Checkout
              </NuxtLink>

              <NuxtLink
                to="/shop"
                class="btn-secondary w-full block text-center"
              >
                Continue Shopping
              </NuxtLink>

              <!-- Tax Notice -->
              <div v-if="cartStore.taxInfo.enabled" class="mt-5 p-3 bg-primary-50 rounded-xl text-xs text-primary-700">
                <p v-if="cartStore.taxInfo.mode === 'inclusive'">
                  * Prices are tax inclusive — {{ cartStore.taxInfo.name }} ({{ cartStore.taxInfo.rate }}%) is already included
                </p>
                <p v-else>
                  * Prices are tax exclusive — {{ cartStore.taxInfo.name }} ({{ cartStore.taxInfo.rate }}%) is added at checkout
                </p>
              </div>
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

<style scoped>
.card-stagger {
  opacity: 0;
  animation: card-fade-up 0.4s ease forwards;
}

@keyframes card-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
