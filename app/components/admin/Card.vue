<template>
  <div class="bg-white rounded-2xl border border-gray-200/70 shadow-sm" :class="padded ? 'p-5 sm:p-6' : ''">
    <slot />
  </div>
</template>

<script setup lang="ts">
// The one calm admin surface: soft border + subtle shadow, no heavy elevation.
withDefaults(defineProps<{ padded?: boolean }>(), { padded: false })
</script>
