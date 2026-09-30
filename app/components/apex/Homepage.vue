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
import type { SubscriptionPlan } from '~/composables/useSubscription'

const authStore = useAuthStore()
const subscription = useSubscription()

const {
  data: marketingPlans,
  pending: marketingPlansLoading,
  error: marketingPlansRequestError,
  refresh: loadMarketingPlans,
} = await useAsyncData<SubscriptionPlan[]>(
  'apex-marketing-plans',
  () => subscription.fetchPlans(true),
  {
    server: true,
    default: () => subscription.plans.value ?? [],
  },
)

const marketingPlansError = computed(() => marketingPlansRequestError.value
  ? 'We couldn’t load pricing plans. Check your connection and try again.'
  : null)

onMounted(() => {
  // Let the CTAs recognise returning admins without blocking the homepage.
  if (!authStore.isAuthenticated) authStore.checkAuth().catch(() => {})
})
</script>
