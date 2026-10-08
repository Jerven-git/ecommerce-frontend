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
            <Icon name="heroicons:shopping-bag" class="w-8 h-8 text-gray-300" aria-hidden="true" />
          </div>
          <p class="text-base font-semibold text-gray-900 mb-1">Your cart is empty</p>
          <p class="text-sm text-gray-400 mb-6">Add some products to get started!</p>
          <NuxtLink
            to="/shop"
            class="inline-flex items-center gap-2 btn-primary"
          >
            Continue Shopping
            <Icon name="heroicons:arrow-right" class="w-4 h-4" aria-hidden="true" />
          </NuxtLink>
        </div>

        <!-- Cart Grid -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-4">
            <div
              v-for="(item, index) in cartStore.items"
              :key="`${item.id}-${item.variantId ?? 'base'}`"
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
                    loading="lazy"
                    decoding="async"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <Icon name="heroicons:photo" class="w-8 h-8 text-gray-200" aria-hidden="true" />
                  </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 truncate">{{ item.name }}</h3>
                  <p v-if="item.selectedOptions && Object.keys(item.selectedOptions).length" class="text-xs text-gray-500 mt-0.5">
                    {{ Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' · ') }}
                  </p>
                  <p class="text-sm text-gray-400 mt-0.5">{{ format(item.price) }} each &middot; {{ item.weight }} kg</p>
                  <!-- Backorder indicator -->
                  <div v-if="item.quantity > item.stock && item.can_backorder" class="mt-1.5 flex items-center gap-1.5">
                    <span class="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                      <Icon name="heroicons:clock" class="w-3 h-3" aria-hidden="true" />
                      {{ item.stock > 0 ? `${item.quantity - item.stock} on backorder` : 'Backorder' }}
                    </span>
                  </div>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0">
                  <button
                    @click="cartStore.updateQuantity(item.id, item.quantity - 1, item.variantId)"
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all text-lg font-medium"
                  >−</button>
                  <span class="w-8 text-center text-sm font-semibold text-gray-900">{{ item.quantity }}</span>
                  <button
                    @click="cartStore.updateQuantity(item.id, item.quantity + 1, item.variantId)"
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all text-lg font-medium"
                  >+</button>
                </div>

                <!-- Line Total + Remove -->
                <div class="text-right shrink-0">
                  <p class="font-bold text-gray-900">{{ format(item.price * item.quantity) }}</p>
                  <button
                    @click="cartStore.removeItem(item.id, item.variantId)"
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
                  <span class="font-medium text-gray-900">{{ format(cartStore.rawSubtotal) }}</span>
                </div>

                <!-- Tax Breakdown -->
                <template v-if="cartStore.taxInfo.enabled">
                  <div class="bg-gray-50 rounded-lg px-3 py-2.5 space-y-1.5">
                    <div class="flex justify-between text-xs text-gray-500">
                      <span>Net price</span>
                      <span class="font-medium text-gray-700">{{ format(cartStore.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between text-xs text-gray-500">
                      <span>{{ cartStore.taxInfo.name }} ({{ cartStore.taxInfo.rate }}%)</span>
                      <span class="font-medium text-gray-700">+ {{ format(cartStore.taxAmount) }}</span>
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
                  <span v-else class="font-medium text-gray-900">{{ format(cartStore.shippingCost) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center py-4">
                <span class="font-bold text-gray-900">Total</span>
                <span class="text-xl font-bold text-gray-900">{{ format(cartStore.grandTotal) }}</span>
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
const { format } = useCurrency()

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
