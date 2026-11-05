<template>
  <ApexMarketingShell v-if="isApexMarketing">
    <slot />
  </ApexMarketingShell>

  <StorefrontThemeHost
    v-else
    :theme="themeReference"
    :view-model="shellViewModel"
    @retry="retryStorefront"
  >
    <StorefrontThemePageHost :theme="themeReference" :view-model="pageViewModel">
      <slot />
    </StorefrontThemePageHost>
  </StorefrontThemeHost>
</template>

<script setup lang="ts">
import {
  createStorefrontPageViewModel,
  createStorefrontShellViewModel,
  storefrontThemeReference,
} from '~/themes/viewModels'

const cartStore = useCartStore()
const route = useRoute()
const {
  siteConfig,
  error: configError,
  pending: configPending,
  fetchSiteConfig,
} = useSiteConfig()

const isApexMarketing = useApexMarketing()
const themeReference = computed(() => storefrontThemeReference(siteConfig.value))
const shellViewModel = computed(() => createStorefrontShellViewModel({
  siteConfig: siteConfig.value,
  configError: Boolean(configError.value),
  configPending: configPending.value,
}))
const pageViewModel = computed(() => createStorefrontPageViewModel({
  path: route.path,
  locale: siteConfig.value?.locale,
}))

function retryStorefront() {
  fetchSiteConfig(true)
}

// Initialize cart - recalculate tax on mount
onMounted(() => {
  if (!isApexMarketing.value && cartStore.items.length > 0) {
    cartStore.calculateTax()
  }
})
</script>
