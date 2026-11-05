<template>
  <component
    :is="shellComponent"
    :view-model="viewModel"
    @retry="$emit('retry')"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template v-if="$slots.default" #default>
      <slot />
    </template>
    <template v-if="$slots['footer-banner']" #footer-banner>
      <slot name="footer-banner" />
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
    <template v-if="$slots.popup" #popup>
      <slot name="popup" />
    </template>
  </component>
</template>

<script setup lang="ts">
import type { ThemeLayoutReference } from '~/composables/useSiteConfig'
import type { StorefrontShellViewModel } from '~/themes/contracts'
import {
  reportThemeFallback,
  resolveThemeRegistration,
  themeShellComponent,
} from '~/themes/registry'

const props = defineProps<{
  theme: ThemeLayoutReference | null | undefined
  viewModel: StorefrontShellViewModel
}>()

defineEmits<{
  retry: []
}>()

const resolution = computed(() => resolveThemeRegistration(props.theme))
const shellComponent = computed(() => themeShellComponent(resolution.value.registration))

watchEffect(() => reportThemeFallback(resolution.value))
</script>

