<template>
  <section
    class="relative overflow-hidden text-white py-16"
    :style="{ background: `linear-gradient(135deg, var(--color-secondary), var(--color-primary), var(--color-primary-400))` }"
  >
    <!-- Floating orbs -->
    <div class="orb absolute rounded-full opacity-15 bg-white w-[280px] h-[280px] -top-20 -left-[60px]" />
    <div class="orb absolute rounded-full opacity-15 bg-white w-[200px] h-[200px] -bottom-[60px] right-[10%] [animation-delay:2s]" />
    <div class="orb absolute rounded-full opacity-15 bg-white w-[140px] h-[140px] top-[30%] -right-10 [animation-delay:4s]" />

    <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <span class="inline-block bg-white/20 backdrop-blur-sm text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
        Members get more
      </span>
      <h2 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">
        New arrivals<br />every single week.
      </h2>
      <p class="text-base text-white/75 mb-8 max-w-lg mx-auto">
        Stay ahead of the trend. Fresh drops, exclusive deals, and hand-picked collections — updated weekly just for you.
      </p>

      <div class="flex flex-wrap justify-center gap-3 mb-10">
        <div
          v-for="perk in perks"
          :key="perk.label"
          class="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-medium"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="perk.icon" />
          </svg>
          {{ perk.label }}
        </div>
      </div>

      <NuxtLink
        to="/shop"
        class="inline-flex items-center gap-2 bg-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
        :style="{ color: 'var(--color-primary-700)' }"
      >
        Shop New Arrivals
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const perks = [
  { label: 'Free Shipping', icon: 'M5 13l4 4L19 7' },
  { label: 'Easy Returns', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { label: 'Secure Checkout', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
]
</script>

<style scoped>
.orb {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50%      { transform: translateY(-18px) scale(1.04); }
}
</style>
