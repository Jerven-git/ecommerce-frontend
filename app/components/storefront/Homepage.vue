<template>
  <div>
    <StorefrontHomeHero :site-config="siteConfig" />
    <StorefrontHomeFeaturedProducts
      :error="error"
      :loading="loading"
      :products="products"
    />

    <HomepageShowcase />
    <HomepageWatchShop />
    <HomepageBestSellers />

    <StorefrontHomeHowItWorks :config="siteConfig?.homepage_steps ?? null" />
    <StorefrontHomeFeatureStrip :config="siteConfig?.homepage_features ?? null" />
    <StorefrontHomeStats :config="siteConfig?.homepage_stats ?? null" />
    <StorefrontHomeStatement :statement="siteConfig?.homepage_statement ?? null" />
    <StorefrontHomeNewsletter :config="siteConfig?.homepage_newsletter ?? null" />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

interface ProductsResponse {
  data: Product[]
}

const { $apiFetch } = useNuxtApp()
const { siteConfig } = useSiteConfig()
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchProducts() {
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<ProductsResponse>('/products', {
      method: 'GET',
      query: {
        is_active: 1,
        limit: 8,
        sort: 'created_at',
        order: 'desc',
      },
    })

    products.value = response?.data ?? []
  } catch (err: any) {
    console.error('Error fetching data:', err)
    error.value = err?.data?.message || 'Failed to load products. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducts)
</script>
