<template>
  <div class="rounded-2xl border border-admin-border bg-admin-surface" :class="padded ? 'p-5 sm:p-6' : ''">
    <slot />
  </div>
</template>

<script setup lang="ts">
// The one calm admin surface: a structural border without redundant elevation.
withDefaults(defineProps<{ padded?: boolean }>(), { padded: false })
</script>
