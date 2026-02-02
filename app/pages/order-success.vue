<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
      <p class="text-gray-600 mb-8">
        Thank you for your order. We've received your order and will process it shortly.
        You will receive a confirmation email soon.
      </p>

      <div class="space-y-3">
        <NuxtLink to="/shop" class="btn-primary w-full block text-center">
          Continue Shopping
        </NuxtLink>
        <NuxtLink to="/" class="btn-secondary w-full block text-center">
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Optional: Clear cart store on mount if not already cleared
const cartStore = useCartStore()
onMounted(() => {
  cartStore.clearCart()
})
</script>