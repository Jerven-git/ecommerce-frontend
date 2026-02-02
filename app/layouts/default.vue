<template>
  <div>
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()

// Initialize cart - recalculate tax on mount
onMounted(() => {
  if (cartStore.items.length > 0) {
    cartStore.calculateTax()
  }
})
</script>