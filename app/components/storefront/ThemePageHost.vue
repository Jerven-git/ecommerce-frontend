<template>
  <component :is="pageFrameComponent" :view-model="viewModel">
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { ThemeLayoutReference } from '~/composables/useSiteConfig'
import type { StorefrontPageViewModel } from '~/themes/contracts'
import {
  reportThemeFallback,
  resolveThemeRegistration,
  themePageFrameComponent,
} from '~/themes/registry'

const props = defineProps<{
  theme: ThemeLayoutReference | null | undefined
  viewModel: StorefrontPageViewModel
}>()

const resolution = computed(() => resolveThemeRegistration(props.theme))
const pageFrameComponent = computed(() => themePageFrameComponent(resolution.value.registration))

watchEffect(() => reportThemeFallback(resolution.value))
</script>
