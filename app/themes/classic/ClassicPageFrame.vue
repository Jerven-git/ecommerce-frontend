<template>
  <slot />
</template>

<script setup lang="ts">
import type { StorefrontPageViewModel } from '~/themes/contracts'

defineProps<{
  viewModel: StorefrontPageViewModel
}>()
</script>

