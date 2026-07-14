<template>
  <section class="relative overflow-hidden bg-secondary-900 py-20 text-white">
    <!-- Soft, theme-driven glow (replaces the floating orbs) -->
    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
      :style="{ background: 'radial-gradient(65% 120% at 50% -10%, color-mix(in srgb, var(--color-primary) 42%, transparent), transparent 62%)' }"
    />

    <div class="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
      <p v-if="badge" class="mb-4 text-sm font-medium text-white/55">{{ badge }}</p>
      <h2 class="display-2 font-bold whitespace-pre-line">
        {{ promo?.heading || 'New arrivals\nevery single week.' }}
      </h2>
      <p class="mx-auto mt-4 max-w-lg text-white/70">
        {{ promo?.subtitle || 'Stay ahead of the trend. Fresh drops, exclusive deals, and hand-picked collections — updated weekly just for you.' }}
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <div
          v-for="(perk, i) in displayPerks"
          :key="i"
          class="flex items-center gap-2 text-sm text-white/85"
        >
          <svg class="h-4 w-4 shrink-0" :style="{ color: 'var(--color-primary-300)' }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="perkIcons[i % perkIcons.length]" />
          </svg>
          {{ perk }}
        </div>
      </div>

      <NuxtLink to="/shop" class="promo-cta mt-10">
        {{ promo?.button_text || 'Shop New Arrivals' }}
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const { siteConfig } = useSiteConfig()

const promo = computed(() => siteConfig.value?.shop_promo)
const badge = computed(() => promo.value?.badge ?? 'Members get more')

const defaultPerks = ['Free Shipping', 'Easy Returns', 'Secure Checkout']
const displayPerks = computed(() => promo.value?.perks?.length ? promo.value.perks : defaultPerks)

const perkIcons = [
  'M5 13l4 4L19 7',
  'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
]
</script>

<style scoped>
.promo-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  padding: 0.875rem 2rem;
  font-weight: 600;
  background: #fff;
  color: #111827;
  box-shadow: 0 12px 34px -14px rgba(0, 0, 0, 0.7);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease;
}
.promo-cta svg {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.promo-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 44px -16px rgba(0, 0, 0, 0.75);
}
.promo-cta:hover svg {
  transform: translateX(3px);
}

@media (prefers-reduced-motion: reduce) {
  .promo-cta,
  .promo-cta svg {
    transition: none;
  }
  .promo-cta:hover {
    transform: none;
  }
}
</style>
