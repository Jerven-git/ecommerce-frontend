<template>
  <div>
    <ClientOnly>
      <LazyHomeCustomCursor />
    </ClientOnly>

    <ApexHero :is-authenticated="authStore.isAuthenticated" />
    <ApexFeatures />
    <ApexHowItWorks :plans="marketingPlans" />
    <ApexPricing
      :is-authenticated="authStore.isAuthenticated"
      :loading="marketingPlansLoading"
      :error="marketingPlansError"
      :plans="marketingPlans"
      @retry="loadMarketingPlans"
    />
    <ApexFinalCta :is-authenticated="authStore.isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const subscription = useSubscription()
const marketingPlans = computed(() => subscription.plans.value ?? [])
const marketingPlansLoading = ref(true)
const marketingPlansError = ref<string | null>(null)

async function loadMarketingPlans() {
  marketingPlansLoading.value = true
  marketingPlansError.value = null
  try {
    await subscription.fetchPlans(true)
  } catch {
    marketingPlansError.value = 'We couldn’t load pricing plans. Check your connection and try again.'
  } finally {
    marketingPlansLoading.value = false
  }
}

onMounted(() => {
  loadMarketingPlans()

  // Let the CTAs recognise returning admins without blocking the homepage.
  if (!authStore.isAuthenticated) authStore.checkAuth().catch(() => {})
})
</script>
