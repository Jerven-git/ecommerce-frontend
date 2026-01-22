<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <div class="card">
      <div class="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 class="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
      <p class="text-gray-600 mb-2">Thank you for your purchase.</p>
      <p class="text-gray-600 mb-8">We'll send you a confirmation email shortly.</p>

      <div v-if="orderId" class="bg-gray-100 p-4 rounded-lg mb-8">
        <p class="text-sm text-gray-600">Order ID</p>
        <p class="font-mono text-sm">{{ orderId }}</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink to="/shop" class="btn-primary">
          Continue Shopping
        </NuxtLink>
        <NuxtLink to="/" class="btn-secondary">
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const orderId = computed(() => route.query.orderId as string)
</script>
