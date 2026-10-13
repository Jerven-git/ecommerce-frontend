<template>
  <div>
    <template v-for="section in sections" :key="section.id">
      <div
        v-if="section.visible || editorPreview"
        :data-storefront-section="section.id"
        :data-editor-label="HOMEPAGE_SECTION_LABELS[section.id]"
        :data-editor-hidden="section.visible ? undefined : 'true'"
      >
        <template v-if="section.visible">
          <StorefrontHomeHero v-if="section.id === 'hero'" :site-config="effectiveConfig" />
          <StorefrontHomeFeaturedProducts
            v-else-if="section.id === 'featured-products'"
            :error="error"
            :loading="loading"
            :products="products"
          />
          <HomepageShowcase v-else-if="section.id === 'showcase'" :site-config="effectiveConfig" />
          <HomepageWatchShop v-else-if="section.id === 'watch-shop'" :site-config="effectiveConfig" />
          <HomepageBestSellers v-else-if="section.id === 'best-sellers'" :site-config="effectiveConfig" />
          <StorefrontHomeHowItWorks v-else-if="section.id === 'how-it-works'" :config="effectiveConfig?.homepage_steps ?? null" />
          <StorefrontHomeFeatureStrip v-else-if="section.id === 'features'" :config="effectiveConfig?.homepage_features ?? null" />
          <StorefrontHomeStats v-else-if="section.id === 'stats'" :config="effectiveConfig?.homepage_stats ?? null" />
          <StorefrontHomeStatement v-else-if="section.id === 'statement'" :statement="effectiveConfig?.homepage_statement ?? null" />
          <StorefrontHomeNewsletter v-else-if="section.id === 'newsletter'" :config="effectiveConfig?.homepage_newsletter ?? null" />
        </template>

        <div
          v-if="editorPreview && (!section.visible || !hasSectionContent(section.id))"
          class="flex min-h-28 items-center justify-center border-y border-dashed border-violet-300 bg-violet-50 px-6 py-8 text-center"
          data-editor-empty-state
        >
          <div>
            <Icon :name="section.visible ? 'heroicons:inbox' : 'heroicons:eye-slash'" class="mx-auto h-5 w-5 text-violet-500" aria-hidden="true" />
            <p class="mt-2 text-sm font-semibold text-violet-950">
              {{ section.visible ? `${HOMEPAGE_SECTION_LABELS[section.id]} needs content` : `${HOMEPAGE_SECTION_LABELS[section.id]} is hidden` }}
            </p>
            <p class="mt-1 text-xs text-violet-700">
              {{ section.visible ? 'Add its required content to make this section render.' : 'Customers will not see this section after publishing.' }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { HomepageSectionId, SiteConfig } from '~/composables/useSiteConfig'
import type { Product } from '~/types/product'
import { HOMEPAGE_SECTION_LABELS, normalizeHomepageSections } from '~/utils/homepageSections'

const props = withDefaults(defineProps<{
  siteConfigOverride?: SiteConfig | null
  editorPreview?: boolean
}>(), {
  siteConfigOverride: null,
  editorPreview: false,
})

interface ProductsResponse {
  data: Product[]
}

const { $apiFetch } = useNuxtApp()
const { siteConfig } = useSiteConfig()
const effectiveConfig = computed(() => props.siteConfigOverride ?? siteConfig.value)
const sections = computed(() => normalizeHomepageSections(effectiveConfig.value?.homepage_sections))
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

function hasStructuredContent(value: unknown) {
  if (!value || typeof value !== 'object') return false
  return Object.values(value as Record<string, unknown>).some(entry => Array.isArray(entry)
    ? entry.length > 0
    : (typeof entry === 'string' ? entry.trim().length > 0 : Boolean(entry)))
}

function hasSectionContent(section: HomepageSectionId) {
  const config = effectiveConfig.value
  if (!config) return false
  if (section === 'hero') return true
  if (section === 'featured-products') return loading.value || Boolean(error.value) || products.value.length > 0
  if (section === 'showcase') return Boolean(config.homepage_showcase?.enabled)
  if (section === 'watch-shop') return Boolean(config.homepage_watch_shop?.enabled && config.homepage_watch_shop.cards?.length)
  if (section === 'best-sellers') return Boolean(config.homepage_best_sellers?.enabled && config.homepage_best_sellers.products?.length)
  if (section === 'how-it-works') return config.homepage_steps === null || hasStructuredContent(config.homepage_steps)
  if (section === 'features') return config.homepage_features === null || hasStructuredContent(config.homepage_features)
  if (section === 'stats') return config.homepage_stats === null || hasStructuredContent(config.homepage_stats)
  if (section === 'statement') return Boolean(config.homepage_statement?.enabled && config.homepage_statement.quote)
  if (section === 'newsletter') return config.homepage_newsletter === null || hasStructuredContent(config.homepage_newsletter)
  return false
}

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
