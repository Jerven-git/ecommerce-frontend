<template>
  <div v-if="configError" class="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-16">
    <section class="w-full max-w-md text-center" aria-labelledby="storefront-unavailable-title" role="alert">
      <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-700">
        <Icon name="heroicons:signal-slash" class="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 id="storefront-unavailable-title" class="mt-6 text-2xl font-semibold tracking-tight text-gray-950">
        Storefront temporarily unavailable
      </h1>
      <p class="mx-auto mt-3 max-w-sm text-base leading-7 text-gray-600">
        We couldn’t load this store’s information. Check your connection and try again.
      </p>
      <button
        type="button"
        class="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-wait disabled:opacity-60"
        :disabled="configPending"
        @click="retryStorefront"
      >
        <Icon
          name="heroicons:arrow-path"
          class="h-4 w-4"
          :class="configPending ? 'animate-spin' : ''"
          aria-hidden="true"
        />
        {{ configPending ? 'Trying again…' : 'Try again' }}
      </button>
    </section>
  </div>

  <div v-else>
    <Header />
    <main>
      <slot />
    </main>
    <FooterBanner />
    <Footer />
    <WelcomePopup />
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
const {
  error: configError,
  pending: configPending,
  fetchSiteConfig,
} = useSiteConfig()

function retryStorefront() {
  fetchSiteConfig(true)
}

// Initialize cart - recalculate tax on mount
onMounted(() => {
  if (cartStore.items.length > 0) {
    cartStore.calculateTax()
  }
})
</script>
